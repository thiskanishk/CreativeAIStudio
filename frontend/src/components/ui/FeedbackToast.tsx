import React from 'react';
import { toast, ToastOptions, Id } from 'react-toastify';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  title?: string;
  message: string;
  autoClose?: number | false;
  onClose?: () => void;
}

// Default toast configuration
const defaultToastOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  className: 'enhanced-toast',
};

// Custom toast component for better UI
const ToastContent: React.FC<ToastProps & { toastId: Id }> = ({ type, title, message, toastId }) => {
  // Configure icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Get background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'success.light';
      case 'error':
        return 'error.light';
      case 'warning':
        return 'warning.light';
      case 'info':
      default:
        return 'info.light';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        borderLeft: 4,
        borderColor: `${type}.main`,
        overflow: 'hidden',
        p: 1.5,
        backgroundColor: getBackgroundColor(),
        opacity: 0.95,
        minWidth: '300px',
        boxShadow: 2,
      }}
    >
      <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'flex-start', pt: 0.5 }}>
        {getIcon()}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {title && (
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
        )}
        <Typography variant="body2">{message}</Typography>
      </Box>
      <IconButton
        size="small"
        aria-label="close"
        onClick={() => toast.dismiss(toastId)}
        sx={{ ml: 1, mt: -0.5 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

/**
 * Enhanced toast notification system with better styling and accessibility
 */
export const FeedbackToast = {
  /**
   * Show a success toast notification
   */
  success: (
    message: string,
    title?: string,
    options?: Partial<ToastOptions>
  ): Id => {
    return toast((props) => (
      <ToastContent
        type="success"
        title={title}
        message={message}
        toastId={props.toastId}
      />
    ), {
      ...defaultToastOptions,
      ...options,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (
    message: string,
    title?: string,
    options?: Partial<ToastOptions>
  ): Id => {
    return toast((props) => (
      <ToastContent
        type="error"
        title={title}
        message={message}
        toastId={props.toastId}
      />
    ), {
      ...defaultToastOptions,
      ...options,
      autoClose: options?.autoClose ?? 8000, // Longer default for errors
    });
  },

  /**
   * Show an info toast notification
   */
  info: (
    message: string,
    title?: string,
    options?: Partial<ToastOptions>
  ): Id => {
    return toast((props) => (
      <ToastContent
        type="info"
        title={title}
        message={message}
        toastId={props.toastId}
      />
    ), {
      ...defaultToastOptions,
      ...options,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (
    message: string,
    title?: string,
    options?: Partial<ToastOptions>
  ): Id => {
    return toast((props) => (
      <ToastContent
        type="warning"
        title={title}
        message={message}
        toastId={props.toastId}
      />
    ), {
      ...defaultToastOptions,
      ...options,
      autoClose: options?.autoClose ?? 6000, // Slightly longer for warnings
    });
  },

  /**
   * Update an existing toast
   */
  update: (
    id: Id,
    type: ToastType,
    message: string,
    title?: string,
    options?: Partial<ToastOptions>
  ): void => {
    toast.update(id, {
      render: (props) => (
        <ToastContent
          type={type}
          title={title}
          message={message}
          toastId={props.toastId}
        />
      ),
      ...options,
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: toast.dismiss,

  /**
   * Dismiss all toasts
   */
  dismissAll: toast.dismiss,
};

export default FeedbackToast; 