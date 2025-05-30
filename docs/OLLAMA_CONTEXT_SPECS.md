# Ollama Models: Context Windows & Training Data in LeanSight

This document provides detailed information about the context windows and training data cutoffs for all Ollama models configured in the LeanSight platform.

## Overview

LeanSight uses Ollama to provide local LLM capabilities for lean manufacturing assessment assistance. The following models are configured based on server resources and use cases.

## Essential Models (Always Available)

### Llama 2 7B (`llama2`)
- **Context Window**: 4,096 tokens (~3,072 words)
- **Training Data Cutoff**: September 2022
- **Model Size**: ~3.8GB
- **Use Case**: General lean manufacturing guidance, quick assessments
- **Best For**: Basic lean principles, 5S methodology, waste identification

### Mistral 7B (`mistral`)
- **Context Window**: 8,192 tokens (~6,144 words)
- **Training Data Cutoff**: September 2023
- **Model Size**: ~4.1GB
- **Use Case**: Alternative general purpose model with longer context
- **Best For**: Detailed lean analysis, multi-step improvement recommendations

### Orca Mini 3B (`orca-mini`)
- **Context Window**: 2,048 tokens (~1,536 words)
- **Training Data Cutoff**: June 2023
- **Model Size**: ~1.9GB
- **Use Case**: Quick responses, low-resource scenarios
- **Best For**: Fast lean terminology explanations, brief assessments

## Enhanced Models (Available with >50GB disk + >16GB RAM)

### Llama 2 13B (`llama2:13b`)
- **Context Window**: 4,096 tokens (~3,072 words)
- **Training Data Cutoff**: September 2022
- **Model Size**: ~7.3GB
- **Use Case**: Higher quality lean analysis and recommendations
- **Best For**: Complex lean transformations, detailed value stream mapping

### Code Llama 7B (`code-llama`)
- **Context Window**: 16,384 tokens (~12,288 words)
- **Training Data Cutoff**: September 2022 (code focus)
- **Model Size**: ~3.8GB
- **Use Case**: Code generation for lean tools, automation scripts
- **Best For**: Creating lean dashboards, KPI calculations, data analysis

### Neural Chat 7B (`neural-chat`)
- **Context Window**: 4,096 tokens (~3,072 words)
- **Training Data Cutoff**: October 2023
- **Model Size**: ~4.1GB
- **Use Case**: Conversational lean coaching and guidance
- **Best For**: Interactive lean training, Q&A sessions

## Advanced Models (Available with >200GB disk + >64GB RAM)

### Llama 2 70B (`llama2:70b`)
- **Context Window**: 4,096 tokens (~3,072 words)
- **Training Data Cutoff**: September 2022
- **Model Size**: ~39GB
- **Use Case**: Highest quality lean analysis and strategic recommendations
- **Best For**: Enterprise lean transformations, complex problem solving

### Mixtral 8x7B (`mixtral`)
- **Context Window**: 32,768 tokens (~24,576 words)
- **Training Data Cutoff**: September 2023
- **Model Size**: ~26GB
- **Use Case**: Complex multi-document analysis with extended context
- **Best For**: Comprehensive lean assessments, cross-department analysis

### Code Llama 34B (`code-llama:34b`)
- **Context Window**: 16,384 tokens (~12,288 words)
- **Training Data Cutoff**: September 2022 (code focus)
- **Model Size**: ~19GB
- **Use Case**: Advanced automation and integration development
- **Best For**: Complex lean analytics, custom tool development

## LeanSight-Specific Context Usage

### Prompt Structure
LeanSight uses a structured prompt format that consumes context as follows:
- **System Prompt**: ~200-500 tokens (lean methodology context)
- **Assessment Context**: ~300-800 tokens (current assessment details)
- **Conversation History**: ~500-2000 tokens (previous exchanges)
- **User Query**: ~50-500 tokens (current question)
- **Response Buffer**: Remaining tokens for model response

### Context Window Management
```typescript
// LeanSight automatically manages context by:
1. Prioritizing recent conversation history
2. Truncating older messages when approaching limits
3. Preserving assessment context and system prompts
4. Using sliding window approach for long conversations
```

### Training Data Limitations
**Important**: All models have training data cutoffs, which means:
- **Lean methodologies**: Well covered (Toyota Production System, Six Sigma, etc.)
- **Recent industry trends**: May not be included (post-cutoff developments)
- **Company-specific practices**: Not included (use assessment context)
- **Real-time data**: Not available (models work with provided context)

## Performance Characteristics

### Token Processing Speed (Approximate)
| Model | Tokens/Second | Best Use Case |
|-------|---------------|---------------|
| Orca Mini 3B | 50-100 | Quick responses |
| Llama 2 7B | 30-60 | Balanced performance |
| Mistral 7B | 25-50 | Detailed analysis |
| Llama 2 13B | 15-30 | Quality responses |
| Neural Chat 7B | 20-40 | Conversations |
| Code Llama 7B | 25-45 | Code generation |
| Mixtral 8x7B | 10-20 | Complex analysis |
| Llama 2 70B | 5-15 | Premium quality |
| Code Llama 34B | 8-18 | Advanced coding |

### Memory Requirements (Inference)
| Model | RAM Usage | VRAM (GPU) | Recommended Hardware |
|-------|-----------|------------|---------------------|
| Orca Mini 3B | 4GB | 2GB | Entry laptop |
| Llama 2 7B | 8GB | 4GB | Standard workstation |
| Mistral 7B | 8GB | 4GB | Standard workstation |
| Llama 2 13B | 16GB | 8GB | High-end workstation |
| Neural Chat 7B | 8GB | 4GB | Standard workstation |
| Code Llama 7B | 8GB | 4GB | Development machine |
| Mixtral 8x7B | 32GB | 16GB | Server/workstation |
| Llama 2 70B | 80GB | 40GB | High-end server |
| Code Llama 34B | 48GB | 24GB | Development server |

## Configuration in LeanSight

### Environment Variables
```bash
# Default configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama2
DEFAULT_LLM_PROVIDER=ollama

# For server deployment
OLLAMA_BASE_URL=http://ollama:11434  # Docker internal network
```

### Model Selection Logic
LeanSight automatically selects models based on:
1. **Query complexity**: Simple questions → smaller models
2. **Context length**: Long documents → models with larger context windows
3. **Response type**: Code requests → Code Llama variants
4. **Available resources**: Falls back to smaller models if needed

### Context Optimization
- **Automatic truncation**: Maintains most relevant context within limits
- **Smart summarization**: Compresses older conversation history
- **Assessment persistence**: Key assessment data always preserved
- **Efficient encoding**: Optimizes token usage for lean-specific terminology

## Best Practices for LeanSight Users

### Maximizing Context Efficiency
1. **Be specific**: Clear questions use fewer tokens
2. **Reference current assessment**: Use provided assessment context
3. **Break down complex queries**: Multiple focused questions vs one complex query
4. **Use conversation history**: Build on previous responses

### Model Selection Guidelines
- **Quick clarifications**: Orca Mini 3B
- **Standard assessments**: Llama 2 7B or Mistral 7B
- **Complex analysis**: Llama 2 13B or Mixtral 8x7B
- **Code/calculations**: Code Llama variants
- **Premium analysis**: Llama 2 70B (if available)

## Troubleshooting Context Issues

### Common Problems
1. **Truncated responses**: Context window exceeded
2. **Lost conversation history**: Too many exchanges
3. **Inconsistent responses**: Model changed mid-conversation
4. **Slow responses**: Model too large for available resources

### Solutions
1. **Start new conversation**: Reset context window
2. **Summarize key points**: Manually provide context
3. **Use smaller models**: For routine questions
4. **Optimize queries**: More focused, specific questions

---

*Last updated: Current deployment*
*For technical support with Ollama models in LeanSight, contact the development team.* 