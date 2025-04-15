import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

type DialogType = 'warning' | 'danger' | 'info';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: DialogType;
  loading?: boolean;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * A reusable confirmation dialog component for actions that require user confirmation.
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  content,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning',
  loading = false,
  fullWidth = true,
  maxWidth = 'sm'
}) => {
  // Determine icon and colors based on dialog type
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <DeleteIcon fontSize="large" color="error" />,
          confirmColor: 'error' as const,
          confirmVariant: 'contained' as const
        };
      case 'info':
        return {
          icon: <InfoIcon fontSize="large" color="info" />,
          confirmColor: 'primary' as const,
          confirmVariant: 'contained' as const
        };
      case 'warning':
      default:
        return {
          icon: <WarningIcon fontSize="large" color="warning" />,
          confirmColor: 'warning' as const,
          confirmVariant: 'contained' as const
        };
    }
  };

  const { icon, confirmColor, confirmVariant } = getTypeStyles();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      aria-labelledby="confirmation-dialog-title"
    >
      <DialogTitle id="confirmation-dialog-title" sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>{icon}</Box>
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
        {!loading && (
          <IconButton
            aria-label="close"
            onClick={onCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        {typeof content === 'string' ? (
          <DialogContentText>{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onCancel} 
          color="inherit" 
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant={confirmVariant}
          autoFocus
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 