'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, useTheme, IconButton, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface HoverRevealTextProps {
  text: string;
  maxLines?: number;
  maxHeight?: number;
}

export default function HoverRevealText({ 
  text, 
  maxLines = 3,
  maxHeight = 72 // Approximately 3 lines of text with default typography
}: HoverRevealTextProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [overlayStyle, setOverlayStyle] = useState({
    top: 0,
    left: 0,
    width: 300,
  });

  useEffect(() => {
    // Check if text element height exceeds the max height
    if (textRef.current) {
      setNeedsTruncation(textRef.current.scrollHeight > maxHeight);
    }
  }, [text, maxHeight]);

  const updateOverlayPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOverlayStyle({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleMouseEnter = () => {
    if (needsTruncation && !isExpanded) {
      updateOverlayPosition();
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    setIsHovering(false);
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <Box 
        sx={{ 
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Truncated text (always visible) */}
        <Typography
          ref={textRef}
          variant="body1"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'none' : maxLines,
            WebkitBoxOrient: 'vertical',
            maxHeight: isExpanded ? 'none' : maxHeight,
            flexGrow: 1,
          }}
        >
          {text}
        </Typography>

        {needsTruncation && (
          <Tooltip title={isExpanded ? "Show less" : "Show more"}>
            <IconButton 
              size="small" 
              onClick={toggleExpand}
              sx={{ 
                ml: 1, 
                mt: -0.5,
                transform: isExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Full text overlay (visible on hover) */}
      {needsTruncation && isHovering && !isExpanded && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '140%',
            maxWidth: '800px',
            zIndex: 1500,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            p: 2,
            maxHeight: '400px',
            overflowY: 'auto',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: theme.shadows[6],
          }}
        >
          <Typography variant="body1">{text}</Typography>
        </Paper>
      )}
    </Box>
  );
} 