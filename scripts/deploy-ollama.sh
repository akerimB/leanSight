#!/bin/bash

# LeanSight Ollama Server Deployment Script
# This script sets up Ollama on a server for all users to access

set -e

echo "🚀 Starting LeanSight Ollama Server Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ollama-models
mkdir -p logs

# Set permissions
chmod 755 ollama-models
chmod 755 logs

# Check system resources
echo "🔍 Checking system resources..."
TOTAL_RAM=$(free -g | awk 'NR==2{print $2}')
AVAILABLE_DISK=$(df -BG . | awk 'NR==2 {gsub(/G/, "", $4); print $4}')

echo "Available RAM: ${TOTAL_RAM}GB"
echo "Available Disk: ${AVAILABLE_DISK}GB"

# Recommend deployment tier based on resources
if [ "$TOTAL_RAM" -ge 64 ] && [ "$AVAILABLE_DISK" -ge 200 ]; then
    DEPLOYMENT_TIER="advanced"
    echo "✅ System suitable for ADVANCED deployment (all models)"
elif [ "$TOTAL_RAM" -ge 16 ] && [ "$AVAILABLE_DISK" -ge 50 ]; then
    DEPLOYMENT_TIER="enhanced"
    echo "✅ System suitable for ENHANCED deployment (essential + enhanced models)"
else
    DEPLOYMENT_TIER="essential"
    echo "⚠️  System suitable for ESSENTIAL deployment (basic models only)"
fi

# Create environment file for deployment
echo "⚙️  Creating environment configuration..."
cat > .env.ollama << EOF
# LeanSight Ollama Configuration
DEPLOYMENT_TIER=${DEPLOYMENT_TIER}
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_DEFAULT_MODEL=llama2:7b
WEBUI_SECRET_KEY=$(openssl rand -hex 32)
TOTAL_RAM=${TOTAL_RAM}
AVAILABLE_DISK=${AVAILABLE_DISK}
EOF

# Check for GPU support
if command -v nvidia-smi &> /dev/null; then
    echo "🎮 NVIDIA GPU detected - enabling GPU acceleration"
    GPU_SUPPORT="true"
    echo "GPU_SUPPORT=true" >> .env.ollama
else
    echo "💻 No GPU detected - using CPU only"
    GPU_SUPPORT="false"
    echo "GPU_SUPPORT=false" >> .env.ollama
fi

# Create docker-compose override for GPU if available
if [ "$GPU_SUPPORT" = "false" ]; then
    echo "📝 Creating CPU-only Docker Compose override..."
    cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  ollama:
    deploy:
      resources:
        reservations: {}
EOF
fi

# Pull Docker images
echo "📥 Pulling Docker images..."
docker-compose pull

# Start services
echo "🚀 Starting Ollama services..."
docker-compose up -d ollama

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to start..."
timeout=300 # 5 minutes
elapsed=0
while ! curl -f http://localhost:11434/api/tags > /dev/null 2>&1; do
    if [ $elapsed -ge $timeout ]; then
        echo "❌ Timeout waiting for Ollama to start"
        exit 1
    fi
    sleep 5
    elapsed=$((elapsed + 5))
    echo "Still waiting... (${elapsed}s)"
done

echo "✅ Ollama is ready!"

# Initialize models
echo "📦 Initializing models..."
docker-compose up ollama-init

# Start web UI (optional)
read -p "Do you want to start the Ollama Web UI for administration? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting Ollama Web UI..."
    docker-compose up -d ollama-webui
    echo "✅ Web UI available at http://localhost:3001"
fi

# Display available models
echo "📋 Available models:"
curl -s http://localhost:11434/api/tags | jq -r '.models[].name' 2>/dev/null || echo "Could not list models"

# Create systemd service for auto-start (optional)
read -p "Do you want to create a systemd service for auto-start? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Creating systemd service..."
    
    SERVICE_FILE="/etc/systemd/system/leansight-ollama.service"
    sudo tee $SERVICE_FILE > /dev/null << EOF
[Unit]
Description=LeanSight Ollama Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable leansight-ollama.service
    echo "✅ Systemd service created and enabled"
fi

# Update LeanSight environment variables
echo "🔄 Updating LeanSight configuration..."
if [ -f "../.env" ]; then
    # Update existing .env file
    sed -i '/^OLLAMA_BASE_URL=/d' ../.env
    sed -i '/^OLLAMA_DEFAULT_MODEL=/d' ../.env
    sed -i '/^DEFAULT_LLM_PROVIDER=/d' ../.env
    echo "OLLAMA_BASE_URL=http://localhost:11434" >> ../.env
    echo "OLLAMA_DEFAULT_MODEL=llama2:7b" >> ../.env
    echo "DEFAULT_LLM_PROVIDER=ollama" >> ../.env
    echo "✅ Updated LeanSight .env file"
else
    echo "⚠️  No .env file found in parent directory. Please add these variables:"
    echo "OLLAMA_BASE_URL=http://localhost:11434"
    echo "OLLAMA_DEFAULT_MODEL=llama2:7b"
    echo "DEFAULT_LLM_PROVIDER=ollama"
fi

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > monitor-ollama.sh << 'EOF'
#!/bin/bash

echo "=== LeanSight Ollama Status ==="
echo "Date: $(date)"
echo

# Check service status
echo "🐳 Docker Services:"
docker-compose ps

echo
echo "📊 Resource Usage:"
echo "Memory: $(free -h | awk 'NR==2{printf "%.1f/%.1fGB (%.2f%%)", $3/1024/1024, $2/1024/1024, $3*100/$2 }')"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
echo "Disk: $(df -h . | awk 'NR==2{print $3"/"$2" ("$5")"}')"

echo
echo "🤖 Available Models:"
curl -s http://localhost:11434/api/tags | jq -r '.models[]? | "\(.name) - Size: \(.size)"' 2>/dev/null || echo "Could not fetch models"

echo
echo "🔗 Endpoints:"
echo "Ollama API: http://localhost:11434"
if docker-compose ps | grep -q ollama-webui; then
    echo "Web UI: http://localhost:3001"
fi

echo
echo "📝 Recent Logs (last 10 lines):"
docker-compose logs --tail=10 ollama
EOF

chmod +x monitor-ollama.sh

# Final instructions
echo
echo "🎉 LeanSight Ollama deployment complete!"
echo
echo "📋 Summary:"
echo "  - Deployment Tier: $DEPLOYMENT_TIER"
echo "  - GPU Support: $GPU_SUPPORT"
echo "  - Ollama API: http://localhost:11434"
if docker-compose ps | grep -q ollama-webui; then
    echo "  - Web UI: http://localhost:3001"
fi
echo
echo "🔧 Management Commands:"
echo "  - Start: docker-compose up -d"
echo "  - Stop: docker-compose down"
echo "  - Monitor: ./monitor-ollama.sh"
echo "  - Logs: docker-compose logs -f ollama"
echo
echo "📚 Next Steps:"
echo "  1. Restart your LeanSight application to use the new Ollama server"
echo "  2. Test the LLM functionality in the LeanSight demo page"
echo "  3. Monitor resource usage with ./monitor-ollama.sh"
echo
echo "✅ All users can now access local LLM assistance in LeanSight!" 