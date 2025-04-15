import React, { useState, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Slider,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import StyleIcon from '@mui/icons-material/Style';
import PublishIcon from '@mui/icons-material/Publish';

import Button from '../ui/Button';
import { isValidImage, getImageDimensions, resizeImage, formatFileSize } from '../../utils/image';

// Define ad styles
const AD_STYLES = [
  { id: 'professional', name: 'Professional', description: 'Clean, corporate look suitable for business ads' },
  { id: 'vibrant', name: 'Vibrant', description: 'Bold, colorful style to grab attention' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, elegant design with lots of whitespace' },
  { id: 'retro', name: 'Retro', description: 'Vintage look with classic design elements' },
  { id: 'futuristic', name: 'Futuristic', description: 'Modern, tech-inspired aesthetic' },
];

// Define ad formats
const AD_FORMATS = [
  { id: 'square', name: 'Square (1:1)', dimensions: '1080 x 1080 px' },
  { id: 'portrait', name: 'Portrait (4:5)', dimensions: '1080 x 1350 px' },
  { id: 'landscape', name: 'Landscape (16:9)', dimensions: '1920 x 1080 px' },
  { id: 'story', name: 'Story (9:16)', dimensions: '1080 x 1920 px' },
];

interface AdFormData {
  title: string;
  description: string;
  callToAction: string;
  adStyle: string;
  adFormat: string;
  primaryColor: string;
  imageFile?: File | null;
  isVideo: boolean;
}

interface AdCreationFormProps {
  initialData?: Partial<AdFormData>;
  onSubmit: (data: AdFormData) => void;
  isSubmitting?: boolean;
}

const AdCreationForm: React.FC<AdCreationFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<AdFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    callToAction: initialData?.callToAction || 'Shop Now',
    adStyle: initialData?.adStyle || 'professional',
    adFormat: initialData?.adFormat || 'square',
    primaryColor: initialData?.primaryColor || '#4f46e5',
    imageFile: initialData?.imageFile || null,
    isVideo: initialData?.isVideo || false,
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step tracking
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Upload Media', 'Ad Content', 'Style & Format', 'Review'];
  
  // Tab state for style selection
  const [styleTab, setStyleTab] = useState(0);
  
  // Preview image state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Image dimensions
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  
  // File info
  const [fileInfo, setFileInfo] = useState<{name: string, size: string, type: string} | null>(null);
  
  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const isVideoFile = file.type.startsWith('video/');
      
      // Validate the file
      if (!isVideoFile && !isValidImage(file)) {
        setErrors(prev => ({ 
          ...prev, 
          imageFile: 'Invalid file type. Please upload a JPEG, PNG, GIF or WebP image.'
        }));
        return;
      }
      
      try {
        // If it's an image, get dimensions and resize if necessary
        if (!isVideoFile) {
          // Get image dimensions
          const dimensions = await getImageDimensions(file);
          setImageDimensions(dimensions);
          
          // Check if image is too large and needs resizing
          let processedFile = file;
          if (file.size > 5 * 1024 * 1024) { // 5MB
            // Resize large images to reduce file size while maintaining quality
            const resizedBlob = await resizeImage(
              file,
              Math.min(dimensions.width, 2048), // max width 2048px
              Math.min(dimensions.height, 2048), // max height 2048px
              file.type,
              0.85
            );
            
            // Convert Blob to File to maintain compatibility
            processedFile = new File(
              [resizedBlob], 
              file.name, 
              { type: resizedBlob.type }
            );
          }
          
          setFormData(prev => ({
            ...prev,
            imageFile: processedFile,
            isVideo: isVideoFile
          }));
        } else {
          // For video files, just use the original
          setFormData(prev => ({
            ...prev,
            imageFile: file,
            isVideo: isVideoFile
          }));
        }
        
        // Store file info
        setFileInfo({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type
        });
        
        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        
        // Clear any previous error
        setErrors(prev => ({ ...prev, imageFile: '' }));
        
        // Auto-advance to next step after successful upload
        setActiveStep(1);
      } catch (error) {
        console.error('Error processing file:', error);
        setErrors(prev => ({ 
          ...prev, 
          imageFile: 'Error processing file. Please try again.'
        }));
      }
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when field is edited
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  // Handle Select change events specifically
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error when field is edited
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  // Handle style tab change
  const handleStyleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setStyleTab(newValue);
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 125) {
      newErrors.description = 'Description must be 125 characters or less';
    }
    
    if (!formData.callToAction.trim()) {
      newErrors.callToAction = 'Call to action is required';
    }
    
    if (!formData.imageFile) {
      newErrors.imageFile = 'Please upload an image or video';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      if (validateForm()) {
        onSubmit(formData);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };
  
  // Render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Upload Media
        return (
          <Box className="py-6">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer hover:bg-gray-50 ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                {previewUrl ? (
                  <>
                    {formData.isVideo ? (
                      <video 
                        src={previewUrl} 
                        className="max-h-64 mb-4 rounded shadow-sm" 
                        controls
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 mb-4 rounded shadow-sm" 
                      />
                    )}
                    
                    {fileInfo && (
                      <div className="text-sm text-gray-600 mt-2">
                        <p><strong>File:</strong> {fileInfo.name}</p>
                        <p><strong>Size:</strong> {fileInfo.size}</p>
                        <p><strong>Type:</strong> {fileInfo.type}</p>
                        {imageDimensions && (
                          <p><strong>Dimensions:</strong> {imageDimensions.width} x {imageDimensions.height}px</p>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      color="primary" 
                      startIcon={<CloudUploadIcon />}
                      className="mt-4"
                    >
                      Replace {formData.isVideo ? 'Video' : 'Image'}
                    </Button>
                  </>
                ) : (
                  <>
                    <CloudUploadIcon className="text-gray-400" style={{ fontSize: 64 }} />
                    <Typography variant="h6" className="font-medium">
                      Drag & drop or click to upload
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 max-w-md">
                      Upload an image or video for your ad. For best results, use high-quality images 
                      with a minimum resolution of 1080x1080px.
                    </Typography>
                    <div className="flex items-center justify-center space-x-4 mt-4">
                      <div className="flex items-center">
                        <ImageIcon className="text-primary-500 mr-2" />
                        <span className="text-sm">Images: JPEG, PNG, WebP</span>
                      </div>
                      <div className="flex items-center">
                        <VideoLibraryIcon className="text-primary-500 mr-2" />
                        <span className="text-sm">Videos: MP4, WebM, MOV</span>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      startIcon={<CloudUploadIcon />}
                      className="mt-4"
                    >
                      Select File
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {errors.imageFile && (
              <Alert severity="error" className="mt-4">
                {errors.imageFile}
              </Alert>
            )}
            
            <Typography variant="body2" className="text-gray-500 mt-4">
              By uploading, you confirm that you have the right to use this media in advertising.
            </Typography>
          </Box>
        );
        
      case 1: // Ad Content
        return (
          <Box className="py-6">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Ad Title"
                  name="title"
                  fullWidth
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title || 'Enter a short, attention-grabbing headline'}
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Ad Description"
                  name="description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={
                    errors.description || 
                    `${formData.description.length}/125 characters. Describe your product or service concisely.`
                  }
                  InputProps={{
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.callToAction}>
                  <InputLabel id="cta-label">Call to Action</InputLabel>
                  <Select
                    labelId="cta-label"
                    name="callToAction"
                    value={formData.callToAction}
                    onChange={handleSelectChange}
                    label="Call to Action"
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="Shop Now">Shop Now</MenuItem>
                    <MenuItem value="Learn More">Learn More</MenuItem>
                    <MenuItem value="Sign Up">Sign Up</MenuItem>
                    <MenuItem value="Get Quote">Get Quote</MenuItem>
                    <MenuItem value="Contact Us">Contact Us</MenuItem>
                    <MenuItem value="Book Now">Book Now</MenuItem>
                    <MenuItem value="Download">Download</MenuItem>
                  </Select>
                  {errors.callToAction && (
                    <FormHelperText>{errors.callToAction}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2: // Style & Format
        return (
          <Box className="py-6">
            <Tabs 
              value={styleTab} 
              onChange={handleStyleTabChange} 
              variant="fullWidth" 
              className="mb-4"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<StyleIcon />} label="Visual Style" id="tab-0" />
              <Tab icon={<FormatColorTextIcon />} label="Format & Color" id="tab-1" />
            </Tabs>
            
            {styleTab === 0 ? (
              <Grid container spacing={3}>
                {AD_STYLES.map(style => (
                  <Grid item xs={12} sm={6} key={style.id}>
                    <Paper 
                      elevation={formData.adStyle === style.id ? 3 : 1}
                      onClick={() => setFormData(prev => ({ ...prev, adStyle: style.id }))}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        formData.adStyle === style.id ? 'border-2 border-primary-500' : ''
                      }`}
                    >
                      <Typography variant="h6">{style.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {style.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Format</Typography>
                  <Grid container spacing={2}>
                    {AD_FORMATS.map(format => (
                      <Grid item xs={6} sm={3} key={format.id}>
                        <Paper 
                          elevation={formData.adFormat === format.id ? 3 : 1}
                          onClick={() => setFormData(prev => ({ ...prev, adFormat: format.id }))}
                          className={`p-3 cursor-pointer text-center transition-all hover:shadow-md ${
                            formData.adFormat === format.id ? 'border-2 border-primary-500' : ''
                          }`}
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>{format.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format.dimensions}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Brand Color</Typography>
                  <Box className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={formData.primaryColor}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        primaryColor: e.target.value 
                      }))}
                      className="w-12 h-12 rounded-full cursor-pointer"
                      style={{ border: 'none' }}
                    />
                    <Typography>
                      {formData.primaryColor.toUpperCase()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        );
        
      case 3: // Review
        return (
          <Box className="py-6">
            <Alert severity="info" className="mb-6">
              Review your ad details before submitting. Our AI will generate your ad based on these specifications.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" className="mb-3">Ad Content</Typography>
                  
                  <Box className="mb-3">
                    <Typography variant="subtitle2" color="textSecondary">Title</Typography>
                    <Typography>{formData.title || '(Not set)'}</Typography>
                  </Box>
                  
                  <Box className="mb-3">
                    <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                    <Typography>{formData.description || '(Not set)'}</Typography>
                  </Box>
                  
                  <Box className="mb-3">
                    <Typography variant="subtitle2" color="textSecondary">Call to Action</Typography>
                    <Typography>{formData.callToAction}</Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper className="p-4">
                  <Typography variant="h6" className="mb-3">Style & Format</Typography>
                  
                  <Box className="mb-3">
                    <Typography variant="subtitle2" color="textSecondary">Ad Style</Typography>
                    <Typography>
                      {AD_STYLES.find(s => s.id === formData.adStyle)?.name || formData.adStyle}
                    </Typography>
                  </Box>
                  
                  <Box className="mb-3">
                    <Typography variant="subtitle2" color="textSecondary">Format</Typography>
                    <Typography>
                      {AD_FORMATS.find(f => f.id === formData.adFormat)?.name || formData.adFormat}
                    </Typography>
                  </Box>
                  
                  <Box className="mb-3">
                    <Typography variant="subtitle2" color="textSecondary">Media Type</Typography>
                    <Typography>
                      {formData.isVideo ? 'Video' : 'Image'}
                    </Typography>
                  </Box>
                  
                  <Box className="flex items-center">
                    <Typography variant="subtitle2" color="textSecondary" className="mr-2">
                      Primary Color:
                    </Typography>
                    <div 
                      className="w-6 h-6 rounded-full mr-2" 
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <Typography>{formData.primaryColor.toUpperCase()}</Typography>
                  </Box>
                </Paper>
              </Grid>
              
              {previewUrl && (
                <Grid item xs={12} className="mt-4">
                  <Typography variant="subtitle1" gutterBottom>Uploaded Media:</Typography>
                  <div className="relative w-full max-w-xs mx-auto aspect-square rounded-lg overflow-hidden border">
                    {formData.isVideo ? (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Grid>
              )}
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box>
        {renderStepContent()}
        
        <Divider className="my-4" />
        
        <Box className="flex justify-between mt-6">
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0}
            variant="outline"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            isLoading={isSubmitting && activeStep === steps.length - 1}
            variant="primary"
            endIcon={activeStep === steps.length - 1 ? <PublishIcon /> : undefined}
          >
            {activeStep === steps.length - 1 ? 'Create Ad' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdCreationForm; 