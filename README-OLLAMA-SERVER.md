# LeanSight Ollama Server Deployment

This guide explains how to deploy Ollama on your server so all LeanSight users can access local LLM capabilities.

## 🎯 Overview

By deploying Ollama on your server, you provide:
- **Cost-effective AI**: No per-token charges from cloud providers
- **Data privacy**: All processing stays on your infrastructure
- **Consistent performance**: Dedicated resources for your users
- **Offline capability**: Works without internet connectivity
- **Model variety**: Multiple specialized models for different use cases

## 📋 Prerequisites

### System Requirements

#### Minimum (Essential Models)
- **RAM**: 8GB available
- **Storage**: 20GB free space
- **CPU**: 4 cores, 2.5GHz+
- **Models**: Llama 2 7B, Mistral 7B, Orca Mini 3B

#### Recommended (Enhanced Models)
- **RAM**: 16GB available
- **Storage**: 50GB free space
- **CPU**: 8 cores, 3.0GHz+
- **GPU**: Optional NVIDIA GPU with 8GB+ VRAM
- **Models**: Includes Code Llama, Neural Chat, Llama 2 13B

#### High-Performance (Advanced Models)
- **RAM**: 64GB+ available
- **Storage**: 200GB+ free space
- **CPU**: 16+ cores, 3.0GHz+
- **GPU**: NVIDIA GPU with 24GB+ VRAM (recommended)
- **Models**: Includes Mixtral 8x7B, Llama 2 70B, Code Llama 34B

### Software Requirements
- Docker & Docker Compose
- Linux/macOS/Windows with WSL2
- Network access for initial model downloads

## 🚀 Quick Deployment

### 1. Run the Deployment Script

```bash
# Navigate to your LeanSight project
cd /path/to/leansight

# Run the deployment script
./scripts/deploy-ollama.sh
```

The script will:
- Check system resources
- Recommend deployment tier
- Set up Docker containers
- Download appropriate models
- Configure LeanSight integration
- Optionally set up auto-start service

### 2. Manual Deployment (Alternative)

If you prefer manual setup:

```bash
# 1. Start Ollama with Docker Compose
docker-compose up -d ollama

# 2. Wait for startup
curl -f http://localhost:11434/api/tags

# 3. Download models
docker-compose up ollama-init

# 4. Optional: Start Web UI
docker-compose up -d ollama-webui
```

## 🔧 Configuration

### Environment Variables

Add these to your LeanSight `.env` file:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama2:7b
DEFAULT_LLM_PROVIDER=ollama

# For Docker deployment
OLLAMA_BASE_URL=http://ollama:11434
```

### Docker Compose Services

The deployment includes:

#### Ollama Server
- **Image**: `ollama/ollama:latest`
- **Port**: 11434
- **GPU**: Auto-detected NVIDIA support
- **Health checks**: Automatic monitoring

#### Model Initialization
- **Purpose**: Downloads models on first run
- **Logic**: Adapts to available resources
- **Models**: Essential → Enhanced → Advanced

#### Web UI (Optional)
- **Image**: `open-webui/open-webui`
- **Port**: 3001
- **Features**: Model management, chat interface

## 🤖 Available Models & Context Windows

### Essential Models (Always Downloaded)

| Model | Context Window | Training Cutoff | Size | Use Case |
|-------|----------------|-----------------|------|----------|
| **Llama 2 7B** | 4,096 tokens | Sep 2022 | 3.8GB | General lean guidance |
| **Mistral 7B** | 8,192 tokens | Sep 2023 | 4.1GB | Detailed analysis |
| **Orca Mini 3B** | 2,048 tokens | Jun 2023 | 1.9GB | Quick responses |

### Enhanced Models (>50GB disk + >16GB RAM)

| Model | Context Window | Training Cutoff | Size | Use Case |
|-------|----------------|-----------------|------|----------|
| **Llama 2 13B** | 4,096 tokens | Sep 2022 | 7.3GB | Higher quality analysis |
| **Code Llama 7B** | 16,384 tokens | Sep 2022 | 3.8GB | Code generation |
| **Neural Chat 7B** | 4,096 tokens | Oct 2023 | 4.1GB | Conversational AI |

### Advanced Models (>200GB disk + >64GB RAM)

| Model | Context Window | Training Cutoff | Size | Use Case |
|-------|----------------|-----------------|------|----------|
| **Mixtral 8x7B** | 32,768 tokens | Sep 2023 | 26GB | Complex analysis |
| **Llama 2 70B** | 4,096 tokens | Sep 2022 | 39GB | Premium quality |
| **Code Llama 34B** | 16,384 tokens | Sep 2022 | 19GB | Advanced coding |

## 🎛️ Context Window Management

### How LeanSight Uses Context

```
Total Context = System Prompt + Assessment Context + History + User Query + Response Buffer

Typical allocation:
- System Prompt: 200-500 tokens (lean methodology context)
- Assessment Context: 300-800 tokens (current assessment details)
- Conversation History: 500-2000 tokens (previous exchanges)
- User Query: 50-500 tokens (current question)
- Response Buffer: 30% of total window (for model response)
```

### Automatic Optimization

LeanSight automatically:
1. **Prioritizes recent context**: Keeps latest conversation
2. **Preserves assessment data**: Never truncates current assessment
3. **Smart truncation**: Removes oldest messages when needed
4. **Model selection**: Chooses appropriate model for context size

### Token Estimation

- **Approximation**: ~4 characters per token
- **Word count**: ~750 words per 1000 tokens
- **Paragraph**: ~100-200 tokens typical

## 📊 Performance Characteristics

### Speed Expectations

| Model | Tokens/Second | Response Time (500 tokens) |
|-------|---------------|---------------------------|
| Orca Mini 3B | 50-100 | 5-10 seconds |
| Llama 2 7B | 30-60 | 8-17 seconds |
| Mistral 7B | 25-50 | 10-20 seconds |
| Llama 2 13B | 15-30 | 17-33 seconds |
| Mixtral 8x7B | 10-20 | 25-50 seconds |
| Llama 2 70B | 5-15 | 33-100 seconds |

### Resource Usage

Monitor with: `./monitor-ollama.sh`

Typical RAM usage during inference:
- **Llama 2 7B**: 8GB RAM
- **Mistral 7B**: 8GB RAM  
- **Llama 2 13B**: 16GB RAM
- **Mixtral 8x7B**: 32GB RAM
- **Llama 2 70B**: 80GB RAM

## 🔍 Management & Monitoring

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f ollama

# Check status
./monitor-ollama.sh
```

### Health Monitoring

The deployment includes automatic:
- **Health checks**: Service availability
- **Resource monitoring**: RAM, CPU, disk usage
- **Model status**: Available models and sizes
- **API endpoints**: Service connectivity

### Web UI Management (Optional)

Access at `http://your-server:3001`:
- **Model management**: Download/remove models
- **Chat interface**: Test model responses
- **System metrics**: Resource utilization
- **Configuration**: Model parameters

## 🛡️ Security & Best Practices

### Network Security
- **Internal access**: Keep Ollama on internal network
- **Firewall**: Block external access to port 11434
- **Reverse proxy**: Use nginx/Apache for HTTPS

### Resource Management
- **Memory limits**: Set Docker memory constraints
- **CPU limits**: Prevent resource exhaustion
- **Disk monitoring**: Alert on low storage
- **Auto-restart**: Use systemd service for reliability

### Model Updates
- **Regular updates**: Check for model improvements
- **Staged deployment**: Test new models before production
- **Backup models**: Keep working models during updates

## 🚨 Troubleshooting

### Common Issues

#### Ollama Won't Start
```bash
# Check Docker status
docker-compose ps

# View detailed logs
docker-compose logs ollama

# Check port availability
netstat -tlnp | grep 11434
```

#### Models Won't Download
```bash
# Check disk space
df -h

# Check network connectivity
curl -I https://ollama.ai

# Manual model download
docker exec -it leansight-ollama ollama pull llama2:7b
```

#### Slow Performance
```bash
# Check resource usage
docker stats

# Monitor system resources
htop

# Check model size vs available RAM
./monitor-ollama.sh
```

#### Context Window Errors
- **Symptoms**: Truncated responses, "context exceeded" errors
- **Solution**: Use models with larger context windows
- **Prevention**: Implement conversation summarization

### Getting Help

1. **Check logs**: `docker-compose logs ollama`
2. **Monitor resources**: `./monitor-ollama.sh`
3. **Test API**: `curl http://localhost:11434/api/tags`
4. **Verify models**: Check available models in Web UI

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load balancer**: Distribute requests across Ollama instances
- **Model sharding**: Different servers for different models
- **Queue system**: Handle burst requests

### Performance Optimization
- **SSD storage**: Faster model loading
- **GPU acceleration**: Significant speed improvements
- **Memory optimization**: Tune model parameters
- **Caching**: Implement response caching

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Check resource usage and logs
- **Monthly**: Update Docker images
- **Quarterly**: Evaluate new models
- **As needed**: Clean up old models

### Backup Strategy
- **Model storage**: Backup `/var/lib/docker/volumes/ollama_data`
- **Configuration**: Backup docker-compose.yml and .env files
- **Documentation**: Keep deployment notes updated

---

## 📚 Additional Resources

- **Ollama Documentation**: https://ollama.ai/docs
- **Model Library**: https://ollama.ai/library
- **Docker Compose Reference**: https://docs.docker.com/compose/
- **LeanSight LLM API**: `/app/api/llm/chat`

## ✅ Verification

After deployment, verify everything works:

1. **API Health**: `curl http://localhost:11434/api/tags`
2. **Model List**: Check available models
3. **LeanSight Integration**: Test in demo page
4. **Performance**: Monitor response times
5. **Resource Usage**: Check system resources

🎉 **Success!** All LeanSight users now have access to local LLM assistance with transparent context window management and detailed model specifications. 