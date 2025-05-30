'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Chip,
  Collapse,
  Tooltip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Badge,
  Fade
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  Assignment as AssignmentIcon,
  TipsAndUpdates as TipsAndUpdatesIcon
} from '@mui/icons-material';
import { useLLMChat, ChatMessage, AssessmentContext } from '@/hooks/useLLMChat';

interface AssessmentAssistantProps {
  assessmentContext?: AssessmentContext;
  isVisible?: boolean;
  onToggle?: () => void;
  compact?: boolean;
  suggestedQuestions?: string[];
}

const PROMPT_TYPES = {
  GENERAL_GUIDANCE: { label: 'General Help', icon: HelpIcon, color: 'primary' },
  SCORING_GUIDANCE: { label: 'Scoring Help', icon: AssignmentIcon, color: 'secondary' },
  BEST_PRACTICES: { label: 'Best Practices', icon: LightbulbIcon, color: 'warning' },
  EVIDENCE_SUGGESTIONS: { label: 'Evidence Ideas', icon: TipsAndUpdatesIcon, color: 'info' },
  QUICK_HELP: { label: 'Quick Answer', icon: PsychologyIcon, color: 'success' }
};

export default function AssessmentAssistant({
  assessmentContext,
  isVisible = true,
  onToggle,
  compact = false,
  suggestedQuestions = []
}: AssessmentAssistantProps) {
  const [message, setMessage] = useState('');
  const [selectedPromptType, setSelectedPromptType] = useState<string>('GENERAL_GUIDANCE');
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    isStreaming,
    error,
    hasMessages,
    usageStats
  } = useLLMChat({ enableStreaming: true });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    await sendMessage(message, assessmentContext, selectedPromptType);
    setMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsMenuAnchor(null);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  if (!isVisible) {
    return (
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title="Open Assessment Assistant">
          <Badge badgeContent={hasMessages ? messages.length : 0} color="primary">
            <IconButton
              onClick={onToggle}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 56,
                height: 56
              }}
            >
              <SmartToyIcon />
            </IconButton>
          </Badge>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: compact ? 'relative' : 'fixed',
        bottom: compact ? 0 : 20,
        right: compact ? 0 : 20,
        width: compact ? '100%' : 400,
        height: compact ? 500 : 600,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.dark', width: 32, height: 32 }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Assessment Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {isStreaming ? 'Thinking...' : 'Ready to help'}
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton
            size="small"
            onClick={handleSettingsClick}
            sx={{ color: 'white', mr: 1 }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
          {onToggle && (
            <IconButton
              size="small"
              onClick={onToggle}
              sx={{ color: 'white' }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Assessment Context Display */}
      {assessmentContext && (
        <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderBottom: 1, borderColor: 'grey.200' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Current Context:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {assessmentContext.categoryName}
            {assessmentContext.dimensionName && ` - ${assessmentContext.dimensionName}`}
          </Typography>
          {assessmentContext.questionText && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {assessmentContext.questionText.length > 80 
                ? `${assessmentContext.questionText.substring(0, 80)}...`
                : assessmentContext.questionText
              }
            </Typography>
          )}
        </Box>
      )}

      {/* Prompt Type Selector */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {Object.entries(PROMPT_TYPES).map(([key, type]) => {
            const IconComponent = type.icon;
            return (
              <Chip
                key={key}
                icon={<IconComponent fontSize="small" />}
                label={type.label}
                size="small"
                variant={selectedPromptType === key ? 'filled' : 'outlined'}
                color={selectedPromptType === key ? type.color as any : 'default'}
                onClick={() => setSelectedPromptType(key)}
                sx={{ fontSize: '0.75rem' }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 1,
          bgcolor: 'grey.50'
        }}
      >
        {!hasMessages && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hi! I'm your Assessment Assistant. I can help with:
            </Typography>
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                • Understanding assessment questions
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Guidance on scoring
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Best practice recommendations
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Evidence suggestions
              </Typography>
            </Box>
          </Box>
        )}

        {/* Suggested Questions */}
        {!hasMessages && suggestedQuestions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Suggested questions:
            </Typography>
            {suggestedQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                size="small"
                variant="outlined"
                onClick={() => handleSuggestedQuestion(question)}
                sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}

        {/* Chat Messages */}
        {messages.map((msg) => (
          <Fade in key={msg.id}>
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                sx={{
                  maxWidth: '85%',
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    mt: 0.5,
                    textAlign: 'right'
                  }}
                >
                  {formatTimestamp(msg.timestamp)}
                </Typography>
              </Box>
            </Box>
          </Fade>
        ))}

        {/* Loading Indicator */}
        {(isLoading || isStreaming) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              {isStreaming ? 'Generating response...' : 'Processing...'}
            </Typography>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'grey.200', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask me anything about this assessment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            color="primary"
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        
        {hasMessages && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {messages.length} messages
            </Typography>
            <Button
              size="small"
              onClick={clearMessages}
              startIcon={<ClearIcon />}
              color="inherit"
            >
              Clear
            </Button>
          </Box>
        )}
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsClose}
      >
        <MenuItem onClick={handleSettingsClose}>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <MenuItem onClick={handleSettingsClose}>
          <Typography variant="body2">Export Chat</Typography>
        </MenuItem>
        {usageStats && (
          <MenuItem onClick={handleSettingsClose}>
            <Typography variant="body2">
              Usage: ${usageStats.totalCost?.toFixed(4) || '0.0000'}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
} 