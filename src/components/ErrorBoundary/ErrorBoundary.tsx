import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for development
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            py={4}
          >
            <Paper
              elevation={3}
              sx={{ p: 4, textAlign: "center", borderRadius: 2 }}
            >
              {/* Error Icon */}
              <ErrorOutlineIcon
                sx={{ fontSize: 80, color: "error.main", mb: 2 }}
              />

              {/* Main Error Message */}
              <Typography variant="h4" gutterBottom>
                Oops! Something went wrong
              </Typography>

              {/* User-friendly explanation */}
              <Typography variant="body1" color="text.secondary" paragraph>
                We're sorry for the inconvenience. An unexpected error occurred.
              </Typography>

              {/* Technical Error Details */}
              {/* Only show in development - remove in production for security */}
              {this.state.error && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                  }}
                >
                  {this.state.error.message}
                </Typography>
              )}

              {/* Recovery Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ mt: 3 }}
              >
                Return to Home
              </Button>
            </Paper>
          </Box>
        </Container>
      );
    }

    // No error - render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
