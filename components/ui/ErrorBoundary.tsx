import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Alert, Paper, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <BugReportIcon sx={{ fontSize: 64, color: 'error.main' }} />
              
              <Typography variant="h5" color="error">
                Something went wrong
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                We're sorry, but something unexpected happened. This error has been logged and we'll look into it.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Error Details:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
                    {this.state.error.message}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto', mt: 1 }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                {this.state.retryCount < this.maxRetries && (
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                  >
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </Stack>

              {this.state.retryCount >= this.maxRetries && (
                <Typography variant="body2" color="text.secondary">
                  If the problem persists, please contact support or try reloading the page.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return (error: Error) => {
    throw error;
  };
};

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}; 