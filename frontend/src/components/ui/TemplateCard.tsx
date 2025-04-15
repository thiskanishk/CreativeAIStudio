import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Tooltip, 
  IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AdTemplate } from '../../data/templates';
import Image from 'next/image';

interface TemplateCardProps {
  template: AdTemplate;
  onSelect: (template: AdTemplate) => void;
  onPreview: (template: AdTemplate) => void;
  isSubscribed?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onPreview,
  isSubscribed = false
}) => {
  const isPremiumLocked = template.isPremium && !isSubscribed;
  
  const handleSelect = () => {
    if (!isPremiumLocked) {
      onSelect(template);
    }
  };
  
  return (
    <Card 
      className={`h-full transition-all duration-300 relative overflow-hidden ${
        isPremiumLocked 
          ? 'opacity-80 grayscale-[30%]' 
          : 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1'
      }`}
      onClick={handleSelect}
      sx={{
        borderRadius: '8px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Premium Badge */}
      {template.isPremium && (
        <Box 
          className="absolute top-0 right-0 z-10 p-1 px-2 m-2 text-xs font-bold text-white bg-amber-500 rounded-full shadow-md"
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <StarIcon fontSize="small" />
          <Typography variant="caption" fontWeight="bold">PREMIUM</Typography>
        </Box>
      )}
      
      {/* Preview Image */}
      <Box sx={{ position: 'relative', paddingTop: '75%', width: '100%' }}>
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            src={template.previewImage || template.thumbnail || '/placeholders/template.jpg'}
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-opacity"
            style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
          />
          
          {/* Lock Overlay for Premium Templates */}
          {isPremiumLocked && (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                color: 'white',
              }}
            >
              <LockIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Upgrade to Premium
              </Typography>
            </Box>
          )}
          
          {/* Preview Button */}
          <Box 
            sx={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
            }}
          >
            <Tooltip title="Preview Template">
              <IconButton 
                size="small" 
                className="bg-white shadow hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(template);
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{ 
            fontSize: '1rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
          }}
        >
          {template.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 2, flexGrow: 1 }}
        >
          {template.description}
        </Typography>
        
        {/* Tags */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px'
          }}
        >
          {(template.tags || []).slice(0, 3).map((tag: string) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.65rem', 
                height: '20px',
                borderRadius: '4px'
              }}
            />
          ))}
          {(template.tags || []).length > 3 && (
            <Chip
              label={`+${(template.tags || []).length - 3}`}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.65rem', 
                height: '20px',
                borderRadius: '4px'
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemplateCard; 