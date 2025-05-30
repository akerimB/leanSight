#!/bin/bash

# Wait for Ollama to be ready
echo "Waiting for Ollama server to be ready..."
until curl -f http://ollama:11434/api/tags > /dev/null 2>&1; do
    sleep 5
    echo "Still waiting for Ollama..."
done

echo "Ollama server is ready. Starting model initialization..."

# Define models to download based on use case and server resources
# These are the essential models for LeanSight

ESSENTIAL_MODELS=(
    "llama2:7b"           # General purpose, good for most tasks
    "mistral:7b"          # Alternative general purpose model
    "orca-mini:3b"        # Lightweight model for quick responses
)

ENHANCED_MODELS=(
    "llama2:13b"          # Better quality for complex analysis
    "code-llama:7b"       # For code-related assistance
    "neural-chat:7b"      # Good conversational model
)

ADVANCED_MODELS=(
    "llama2:70b"          # Highest quality (requires significant resources)
    "mixtral:8x7b"        # Very capable mixture of experts model
    "code-llama:34b"      # Advanced code assistance
)

# Function to download a model
download_model() {
    local model=$1
    echo "Downloading model: $model"
    
    curl -X POST http://ollama:11434/api/pull \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$model\"}" \
        --max-time 3600 # 1 hour timeout
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully downloaded: $model"
    else
        echo "❌ Failed to download: $model"
    fi
}

# Check available disk space and RAM to determine which models to download
AVAILABLE_SPACE=$(df /root/.ollama | awk 'NR==2 {print $4}')
AVAILABLE_RAM=$(free -m | awk 'NR==2{printf "%.0f", $7/1024}')

echo "Available disk space: ${AVAILABLE_SPACE}KB"
echo "Available RAM: ${AVAILABLE_RAM}GB"

# Download essential models (always download these)
echo "📦 Downloading essential models..."
for model in "${ESSENTIAL_MODELS[@]}"; do
    download_model "$model"
done

# Download enhanced models if we have enough space (>50GB) and RAM (>16GB)
if [ $AVAILABLE_SPACE -gt 52428800 ] && [ $AVAILABLE_RAM -gt 16 ]; then
    echo "📦 Downloading enhanced models..."
    for model in "${ENHANCED_MODELS[@]}"; do
        download_model "$model"
    done
fi

# Download advanced models if we have plenty of space (>200GB) and RAM (>64GB)
if [ $AVAILABLE_SPACE -gt 209715200 ] && [ $AVAILABLE_RAM -gt 64 ]; then
    echo "📦 Downloading advanced models..."
    for model in "${ADVANCED_MODELS[@]}"; do
        download_model "$model"
    done
fi

# Set default model
echo "Setting default model to llama2:7b..."
curl -X POST http://ollama:11434/api/generate \
    -H "Content-Type: application/json" \
    -d '{"model": "llama2:7b", "prompt": "Hello! I am ready to help with lean manufacturing assessments.", "stream": false}' \
    > /dev/null 2>&1

echo "🎉 Model initialization complete!"

# List all available models
echo "📋 Available models:"
curl -s http://ollama:11434/api/tags | jq -r '.models[].name' || echo "Could not list models" 