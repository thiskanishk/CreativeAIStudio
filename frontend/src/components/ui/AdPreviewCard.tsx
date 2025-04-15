import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, Typography, IconButton, Chip, Box, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface AdPreviewCardProps {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  adType: 'image' | 'video';
  status: 'draft' | 'ready' | 'processing' | 'failed';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onView?: (id: string) => void;
}

const AdPreviewCard: React.FC<AdPreviewCardProps> = ({
  id,
  title,
  imageUrl,
  createdAt,
  adType,
  status,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onView,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case 'draft': return 'warning';
      case 'ready': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card 
      className="h-full transition-all duration-300 relative overflow-hidden"
      sx={{
        transform: isHovered ? 'translateY(-8px)' : 'none',
        boxShadow: isHovered ? '0 12px 20px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.08)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video w-full">
        <Image 
          src={imageUrl} 
          alt={title}
          fill
          className="object-cover"
        />
        
        {/* Type indicator */}
        <Chip 
          label={adType === 'video' ? 'Video' : 'Image'} 
          size="small"
          color={adType === 'video' ? 'secondary' : 'primary'}
          className="absolute top-2 left-2"
        />
        
        {/* Status indicator */}
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)} 
          size="small"
          color={getStatusColor()}
          className="absolute top-2 right-2"
        />
        
        {/* Overlay actions - visible on hover */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {onView && (
            <Tooltip title="Preview">
              <IconButton 
                onClick={() => onView(id)} 
                className="text-white hover:text-primary-300"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton 
                onClick={() => onEdit(id)} 
                className="text-white hover:text-primary-300"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onDownload && status === 'ready' && (
            <Tooltip title="Download">
              <IconButton 
                onClick={() => onDownload(id)} 
                className="text-white hover:text-primary-300"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onShare && status === 'ready' && (
            <Tooltip title="Share">
              <IconButton 
                onClick={() => onShare(id)} 
                className="text-white hover:text-primary-300"
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
      
      <CardContent>
        <Box className="flex justify-between items-start">
          <Box>
            <Typography variant="h6" component="h3" className="font-medium line-clamp-1" title={title}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {formatDate(createdAt)}
            </Typography>
          </Box>
          
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                onClick={() => onDelete(id)}
                className="text-gray-400 hover:text-red-500"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdPreviewCard; 