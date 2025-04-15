import React from 'react';
import { 
  Backdrop, 
  CircularProgress, 
  Typography, 
  Box, 
  LinearProgress, 
  Paper,
  Fade
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { motion } from 'framer-motion';

export type LoadingState = 'idle' | 'loading' | 'processing' | 'success' | 'error';

interface LoadingOverlayProps {
  state: LoadingState;
  open: boolean;
  progress?: number;
  message?: string;
  successMessage?: string;
  errorMessage?: string;
  onClose?: () => void;
}

/**
 * A reusable loading overlay component that provides visual feedback during operations
 * with support for progress indication, success and error states.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  state,
  open,
  progress = 0,
  message = 'Loading...',
  successMessage = 'Operation successful!',
  errorMessage = 'An error occurred',
  onClose
}) => {
  if (state === 'idle' && !open) return null;

  // Determine what content to show based on state
  const renderContent = () => {
    switch (state) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Paper 
              elevation={3}
              sx={{ 
                p: 4, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                maxWidth: 400
              }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom align="center">
                {successMessage}
              </Typography>
            </Paper>
          </motion.div>
        );
      
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Paper 
              elevation={3}
              sx={{ 
                p: 4, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                maxWidth: 400
              }}
            >
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom align="center">
                {errorMessage}
              </Typography>
            </Paper>
          </motion.div>
        );
      
      case 'loading':
      case 'processing':
      default:
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              maxWidth: 400
            }}
          >
            {progress > 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {message}
                </Typography>
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 10, borderRadius: 5 }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {progress.toFixed(0)}% Complete
                </Typography>
              </>
            ) : (
              <>
                <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="h6">
                  {message}
                </Typography>
              </>
            )}
          </Box>
        );
    }
  };

  return (
    <Backdrop
      sx={{ 
        zIndex: theme => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      open={open}
      onClick={state === 'success' || state === 'error' ? onClose : undefined}
    >
      <Fade in={open}>
        {renderContent()}
      </Fade>
    </Backdrop>
  );
};

export default LoadingOverlay; 