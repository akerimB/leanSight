import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom Logo Icon component
const LogoIcon = styled(SvgIcon)(({ theme }) => ({
  fontSize: 'inherit',
  width: '1em',
  height: '1em',
}));

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onClick?: () => void;
  sx?: any;
}

export default function Logo({ 
  size = 'medium', 
  showText = true, 
  onClick,
  sx = {} 
}: LogoProps) {
  const sizeConfig = {
    small: { iconSize: 24, fontSize: '1rem' },
    medium: { iconSize: 32, fontSize: '1.25rem' },
    large: { iconSize: 48, fontSize: '1.5rem' }
  };

  const config = sizeConfig[size];

  const LogoSvg = () => (
    <LogoIcon 
      viewBox="0 0 200 100" 
      sx={{ 
        fontSize: config.iconSize,
        color: '#ff6b35', // Orange/red color from the logo
      }}
    >
      {/* Eye shape background */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="45" 
        ry="30" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      
      {/* Bar chart inside the eye */}
      <rect x="25" y="35" width="8" height="30" fill="currentColor" />
      <rect x="37" y="25" width="8" height="40" fill="currentColor" />
      <rect x="49" y="15" width="8" height="50" fill="currentColor" />
      <rect x="61" y="30" width="8" height="35" fill="currentColor" />
    </LogoIcon>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...sx
      }}
      onClick={onClick}
    >
      <LogoSvg />
      {showText && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontSize: config.fontSize,
            fontWeight: 700,
            color: '#b85450', // Darker red/brown color from the logo
            fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          Leansight
        </Typography>
      )}
    </Box>
  );
} 