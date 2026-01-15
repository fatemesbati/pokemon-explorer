import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string; // Message to display below spinner
  size?: number; // Size of spinner in pixels
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 60 
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"  // Prevents layout shift
      gap={2}
    >
      {/* Circular Progress Spinner */}
      <CircularProgress size={size} />
      
      {/* Loading Message */}
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;