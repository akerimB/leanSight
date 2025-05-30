import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  CircularProgress,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ProgressIndicatorProps {
  variant?: 'linear' | 'circular' | 'stepper' | 'steps';
  value?: number; // 0-100 for linear/circular, current step for stepper
  total?: number; // Total steps for stepper variant
  steps?: Array<{
    label: string;
    description?: string;
    completed?: boolean;
    active?: boolean;
    error?: boolean;
  }>;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export default function ProgressIndicator({
  variant = 'linear',
  value = 0,
  total = 100,
  steps = [],
  showPercentage = true,
  showLabel = false,
  label,
  size = 'medium',
  color = 'primary',
  animated = true
}: ProgressIndicatorProps) {

  const getLinearHeight = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 12;
      default: return 8;
    }
  };

  const getCircularSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  };

  const renderLinearProgress = () => (
    <Box sx={{ width: '100%' }}>
      {(showLabel && label) && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(Math.max(value, 0), 100)}
            color={color}
            sx={{ 
              height: getLinearHeight(),
              borderRadius: 1,
              ...(animated && {
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.4s ease-in-out'
                }
              })
            }}
          />
        </Box>
        {showPercentage && (
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
            {Math.round(value)}%
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderCircularProgress = () => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(Math.max(value, 0), 100)}
        size={getCircularSize()}
        color={color}
        thickness={size === 'small' ? 3 : size === 'large' ? 6 : 4}
      />
      {showPercentage && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant={size === 'small' ? 'caption' : 'body2'}
            component="div"
            color="text.secondary"
          >
            {Math.round(value)}%
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderStepper = () => (
    <Stepper activeStep={value} orientation="vertical">
      {steps.map((step, index) => (
        <Step key={step.label} completed={step.completed}>
          <StepLabel error={step.error}>
            {step.label}
          </StepLabel>
          {step.description && (
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  );

  const renderSteps = () => (
    <Box>
      {(showLabel && label) && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isActive = step.active || (!isCompleted && index === value);
          const isError = step.error;

          return (
            <Box key={step.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                icon={
                  isError ? <AccessTimeIcon /> :
                  isCompleted ? <CheckCircleIcon /> : 
                  <RadioButtonUncheckedIcon />
                }
                label={step.label}
                variant={isActive ? 'filled' : 'outlined'}
                color={
                  isError ? 'error' :
                  isCompleted ? 'success' :
                  isActive ? 'primary' : 'default'
                }
                size={size === 'large' ? 'medium' : size}
              />
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 16,
                    height: 2,
                    backgroundColor: isCompleted ? 'success.main' : 'divider',
                    borderRadius: 1
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      {showPercentage && steps.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {steps.filter(s => s.completed).length} of {steps.length} completed
        </Typography>
      )}
    </Box>
  );

  switch (variant) {
    case 'circular':
      return renderCircularProgress();
    case 'stepper':
      return renderStepper();
    case 'steps':
      return renderSteps();
    default:
      return renderLinearProgress();
  }
}

// Specialized components for common use cases
export const AssessmentProgress = ({ 
  completed, 
  total, 
  ...props 
}: { 
  completed: number; 
  total: number; 
} & Partial<ProgressIndicatorProps>) => (
  <ProgressIndicator
    variant="linear"
    value={(completed / total) * 100}
    label={`Assessment Progress: ${completed}/${total} questions answered`}
    showLabel
    {...props}
  />
);

export const UploadProgress = ({ 
  progress, 
  fileName,
  ...props 
}: { 
  progress: number; 
  fileName?: string;
} & Partial<ProgressIndicatorProps>) => (
  <ProgressIndicator
    variant="linear"
    value={progress}
    label={fileName ? `Uploading ${fileName}...` : 'Uploading...'}
    showLabel
    color="primary"
    {...props}
  />
);

export const ProcessingSteps = ({ 
  currentStep, 
  steps,
  ...props 
}: { 
  currentStep: number; 
  steps: string[];
} & Partial<ProgressIndicatorProps>) => (
  <ProgressIndicator
    variant="steps"
    value={currentStep}
    steps={steps.map((step, index) => ({
      label: step,
      completed: index < currentStep,
      active: index === currentStep
    }))}
    {...props}
  />
); 