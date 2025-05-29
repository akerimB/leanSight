'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Tooltip,
  useTheme,
  Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface MaturityLevel {
  level: number;
  title: string;
  description: string;
}

interface MaturityOptionProps {
  levels: MaturityLevel[];
  value: string;
  onChange: (value: string) => void;
  dimension?: string;
}

export default function MaturityOption({ 
  levels, 
  value, 
  onChange,
  dimension = 'Leadership Commitment'
}: MaturityOptionProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleToggleExpand = (level: number) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {dimension}
      </Typography>
      
      <RadioGroup
        name={`maturity-${dimension.replace(/\s+/g, '-').toLowerCase()}`}
        value={value}
        onChange={handleChange}
      >
        {levels.map((level) => {
          const isHovered = hoveredLevel === level.level;
          const isExpanded = expandedLevel === level.level;
          
          return (
            <Box key={level.level} sx={{ mb: 1 }}>
              <Paper
                elevation={isHovered || isExpanded ? 2 : 1}
                sx={{
                  p: 2,
                  transition: 'all 0.2s',
                  borderLeft: 6,
                  borderColor: 
                    level.level === 1 ? 'error.main' : 
                    level.level === 2 ? 'warning.main' : 
                    level.level === 3 ? 'info.main' : 
                    level.level === 4 ? 'success.light' : 
                    'success.dark',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}
                onMouseEnter={() => setHoveredLevel(level.level)}
                onMouseLeave={() => setHoveredLevel(null)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <FormControlLabel
                    value={level.level.toString()}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {level.level}: {level.title}
                        </Typography>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', '.MuiFormControlLabel-label': { mt: 0.25 } }}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Toggle full description">
                      <Box 
                        sx={{ 
                          cursor: 'pointer', 
                          display: 'flex',
                          p: 0.5,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderRadius: '50%'
                          }
                        }}
                        onClick={() => handleToggleExpand(level.level)}
                      >
                        {isExpanded ? 
                          <KeyboardArrowUpIcon /> : 
                          <KeyboardArrowDownIcon />
                        }
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
                
                {/* Always show description but with conditional styling */}
                <Box sx={{ mt: 1 }}>
                  <Collapse in={isExpanded || isHovered}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        maxHeight: isExpanded ? 'none' : '3.6em', // ~3 lines of text
                        overflow: isExpanded ? 'visible' : 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'none' : 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {level.description}
                    </Typography>
                    
                    {isHovered && !isExpanded && (
                      <Typography 
                        variant="caption" 
                        color="primary"
                        sx={{ display: 'block', mt: 0.5, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleExpand(level.level);
                        }}
                      >
                        Click to read more
                      </Typography>
                    )}
                  </Collapse>
                </Box>
              </Paper>
            </Box>
          );
        })}
      </RadioGroup>
    </Box>
  );
} 