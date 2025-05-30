# 🦙 Local LLM Setup with Ollama

This guide will help you set up local Large Language Models (LLMs) for LeanSight using Ollama, providing privacy, cost savings, and offline capability.

## 🚀 Why Use Local LLMs?

- **🔒 Privacy**: Your data never leaves your server
- **💰 Cost-effective**: No per-token charges, unlimited usage
- **⚡ Speed**: No network latency for faster responses
- **🌐 Offline**: Works without internet connection
- **🎛️ Control**: Full control over model selection and configuration

## 📋 Prerequisites

- **RAM**: Minimum 8GB (16GB+ recommended for larger models)
- **Storage**: 4-50GB depending on model size
- **OS**: macOS, Linux, or Windows
- **CPU**: Modern multi-core processor (Apple Silicon or x64)

## 🛠️ Installation Steps

### 1. Install Ollama

#### macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download the installer from [ollama.ai](https://ollama.ai/download)

### 2. Start Ollama Service

```bash
ollama serve
```

This starts the Ollama API server on `http://localhost:11434`

### 3. Pull Your First Model

#### Recommended Starting Models

**For General Use (Small & Fast):**
```bash
ollama pull llama2        # 3.8GB - Meta Llama 2 7B
ollama pull mistral       # 4.1GB - Mistral 7B
```

**For Better Quality (Medium Size):**
```bash
ollama pull llama2:13b    # 7.3GB - Meta Llama 2 13B
ollama pull mixtral       # 26GB - Mixtral 8x7B (excellent quality)
```

**For Code & Technical Tasks:**
```bash
ollama pull code-llama    # 3.8GB - Code Llama 7B
ollama pull deepseek-coder # 3.8GB - DeepSeek Coder
```

**Specialized Models:**
```bash
ollama pull neural-chat   # 4.1GB - Intel Neural Chat
ollama pull nous-hermes2  # 4.1GB - Nous Hermes 2
ollama pull starling-lm   # 4.1GB - Starling LM
```

### 4. Configure LeanSight

Add these environment variables to your `.env.local` file:

```env
# Use Ollama as the default provider
DEFAULT_LLM_PROVIDER=ollama

# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama2

# Optional: Keep cloud providers as fallback
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 5. Test the Setup

1. Start your LeanSight development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/llm-demo` in your browser

3. Try asking the Assessment Assistant a question

## 🎯 Model Recommendations

### 📊 Performance vs. Size Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **llama2** | 3.8GB | ⚡⚡⚡ | ⭐⭐⭐ | General purpose, fast responses |
| **mistral** | 4.1GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Balanced speed/quality |
| **llama2:13b** | 7.3GB | ⚡⚡ | ⭐⭐⭐⭐ | Better quality, moderate speed |
| **mixtral** | 26GB | ⚡ | ⭐⭐⭐⭐⭐ | Highest quality, slower |
| **code-llama** | 3.8GB | ⚡⚡⚡ | ⭐⭐⭐ | Code generation/analysis |

### 🏆 Recommended Setup by Use Case

**Laptop/Development (8-16GB RAM):**
```bash
ollama pull mistral       # Primary model
ollama pull code-llama    # For technical questions
```

**Workstation (32GB+ RAM):**
```bash
ollama pull mixtral       # Primary model (best quality)
ollama pull llama2:13b    # Backup model
ollama pull code-llama    # For technical questions
```

**Production Server:**
```bash
ollama pull mistral       # Fast, reliable
ollama pull mixtral       # High quality for important tasks
```

## ⚙️ Advanced Configuration

### Custom Model Parameters

You can customize model behavior by setting these environment variables:

```env
# Model-specific settings
OLLAMA_TEMPERATURE=0.7        # Creativity (0.0-1.0)
OLLAMA_MAX_TOKENS=1000        # Response length
OLLAMA_CONTEXT_LENGTH=4096    # Context window
```

### Multiple Model Support

LeanSight automatically detects available models. You can switch between them based on the task:

- **Quick answers**: `mistral` or `llama2`
- **Detailed analysis**: `mixtral` or `llama2:13b`
- **Code questions**: `code-llama` or `deepseek-coder`

### Memory Optimization

For better performance with limited RAM:

```bash
# Use smaller models
ollama pull orca-mini       # 1.9GB - Very fast, basic quality

# Or use quantized versions
ollama pull llama2:7b-q4_0  # Quantized for less memory usage
```

## 🔧 Troubleshooting

### Common Issues

**Ollama not responding:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
pkill ollama && ollama serve
```

**Model not found:**
```bash
# List available models
ollama list

# Pull missing model
ollama pull llama2
```

**Out of memory:**
```bash
# Use a smaller model
ollama pull orca-mini

# Or increase system memory/swap
```

**Slow responses:**
- Use smaller models (`llama2` vs `llama2:13b`)
- Increase available RAM
- Use SSD storage
- Close other applications

### Performance Tips

1. **Preload models**: Start your most-used model on system boot
2. **Use SSD**: Store models on fast SSD storage
3. **Adequate RAM**: Ensure model fits in memory
4. **Background running**: Keep Ollama running as a service

## 🎨 Model Customization

### Creating Custom Models

You can create custom models optimized for lean assessment tasks:

```bash
# Create a Modelfile
cat > Modelfile << EOF
FROM llama2

SYSTEM """
You are an expert lean transformation consultant with deep knowledge of:
- Toyota Production System (TPS)
- Lean manufacturing principles
- Continuous improvement methodologies
- 5S, Kaizen, Value Stream Mapping
- Six Sigma and quality management

Provide practical, actionable advice for lean maturity assessments.
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
EOF

# Build custom model
ollama create lean-advisor -f Modelfile
```

### Using Custom Models

Update your environment:
```env
OLLAMA_DEFAULT_MODEL=lean-advisor
```

## 📈 Monitoring & Management

### Check Model Usage

```bash
# List installed models
ollama list

# Show model info
ollama show llama2

# Remove unused models
ollama rm old-model
```

### Performance Monitoring

LeanSight provides built-in monitoring at `/llm-demo` showing:
- Response times
- Token usage
- Model performance
- Provider availability

## 🔄 Migration from Cloud APIs

If you're currently using OpenAI or Anthropic:

1. **Install Ollama** following the steps above
2. **Pull a model**: `ollama pull mistral`
3. **Update config**: Set `DEFAULT_LLM_PROVIDER=ollama`
4. **Test thoroughly**: Compare response quality
5. **Keep fallback**: Maintain cloud API keys for backup

## 🆘 Support

- **Ollama Documentation**: [ollama.ai/docs](https://ollama.ai/docs)
- **Model Library**: [ollama.ai/library](https://ollama.ai/library)
- **Community**: [GitHub Issues](https://github.com/jmorganca/ollama)
- **LeanSight Support**: Check the `/llm-demo` page for status

## 🎉 Benefits Achieved

After setup, you'll have:
- ✅ **Private AI**: No data leaves your system
- ✅ **Zero ongoing costs**: No per-token charges
- ✅ **Unlimited usage**: Ask as many questions as you want
- ✅ **Faster responses**: No network latency
- ✅ **Offline capability**: Works without internet
- ✅ **Full control**: Choose and customize models
- ✅ **Better privacy**: GDPR/compliance friendly

Happy local LLM usage! 🚀 