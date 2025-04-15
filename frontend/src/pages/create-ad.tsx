import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  Snackbar, 
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Fade,
  Backdrop,
  CircularProgress,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Lazy load components to improve initial load time
const AdCreationForm = lazy(() => import('../components/forms/AdCreationForm'));
// Create a temporary TemplateGallery component since the import is missing
import { AdTemplate } from '../data/templates';
const TemplateGallery: React.FC<{ onSelectTemplate: (template: AdTemplate) => void }> = ({ onSelectTemplate }) => (
  <div>Template Gallery Component</div>
);
import { useAds } from '../hooks/useAds';

// Define our local interface for form data
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

// Animation variants - define outside component to prevent recreation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const CreateAdPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'uploading' | 'generating' | 'success'>('idle');
  const [progressValue, setProgressValue] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<Partial<AdFormData>>({});
  
  // Get the templateId from URL query params
  const { templateId } = router.query;
  
  // Get the createAd function from our hook
  const { createAd, isCreatingAd } = useAds();

  // Memoize steps to prevent re-creation on each render
  const steps = useMemo(() => ['Select Template', 'Customize Ad', 'Review & Create'], []);

  // If templateId is provided in the URL, skip to the customize step
  useEffect(() => {
    let isMounted = true;
    
    if (templateId && typeof templateId === 'string') {
      // Logic to fetch and set the selected template based on templateId
      // This would typically be handled by a function from your templates service
      import('../data/templates').then(({ getTemplateById }) => {
        if (!isMounted) return;
        
        const template = getTemplateById(templateId);
        if (template) {
          handleSelectTemplate(template);
          setCurrentStep(1); // Skip to customize step
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [templateId]);

  // Handle template selection with useCallback to avoid recreation on each render
  const handleSelectTemplate = useCallback((template: AdTemplate) => {
    setSelectedTemplate(template);
    
    // Pre-populate form with template settings
    if (template.settings) {
      setInitialFormValues({
        adStyle: template.settings.adStyle || '',
        adFormat: template.settings.adFormat || '',
        title: template.settings.titleSuggestions?.[0] || '',
        description: template.settings.descriptionSuggestions?.[0] || '',
        callToAction: template.settings.callToAction || '',
        primaryColor: template.settings.primaryColor || '#1877F2',
      });
    }
    
    // Move to next step
    setCurrentStep(1);
  }, []);

  const handleSubmit = useCallback(async (formData: AdFormData) => {
    setError(null);
    
    try {
      if (!formData.imageFile) {
        setError('Please upload an image or video file');
        return;
      }
      
      // Set to review step
      setCurrentStep(2);
      
      // Start the upload/creation process simulation
      setProcessingState('uploading');
      
      // Simulate upload progress
      const uploadTimer = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 100) {
            clearInterval(uploadTimer);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      
      // After "upload" is complete, move to generation phase
      setTimeout(() => {
        clearInterval(uploadTimer);
        setProgressValue(0);
        setProcessingState('generating');
        
        // Simulate generation progress
        const generationTimer = setInterval(() => {
          setProgressValue(prev => {
            if (prev >= 100) {
              clearInterval(generationTimer);
              return 100;
            }
            return prev + 2;
          });
        }, 100);
        
        // Actual API call
        createAd({ 
          data: {
            title: formData.title,
            description: formData.description,
            callToAction: formData.callToAction,
            adStyle: formData.adStyle,
            adFormat: formData.adFormat,
            primaryColor: formData.primaryColor,
            isVideo: formData.isVideo,
            templateId: selectedTemplate?.id // Pass the template ID if one was selected
          }, 
          mediaFile: formData.imageFile as File
        })
          .then(newAd => {
            // Show success state and cleanup
            clearInterval(generationTimer);
            setProgressValue(100);
            setProcessingState('success');
            setSuccessMessage('Ad created successfully!');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          })
          .catch(err => {
            clearInterval(generationTimer);
            console.error('Error creating ad:', err);
            setError('Failed to create ad. Please try again.');
            setProcessingState('idle');
          });
      }, 3000);
      
    } catch (err) {
      console.error('Error creating ad:', err);
      setError('Failed to create ad. Please try again.');
      setProcessingState('idle');
    }
  }, [createAd, router, selectedTemplate]);

  const handleGoBack = useCallback(() => {
    if (processingState !== 'idle') {
      // Show a confirmation dialog if the user tries to leave during processing
      if (window.confirm('Are you sure you want to leave? Your ad creation will be cancelled.')) {
        router.back();
      }
    } else if (currentStep > 0) {
      // Go back to previous step
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  }, [processingState, currentStep, router]);

  const handleCloseSnackbar = useCallback(() => {
    setSuccessMessage(null);
    setError(null);
  }, []);

  // Render the processing overlay - using a regular function
  const renderProcessingOverlay = () => {
    if (processingState === 'idle') return null;
    
    // Boolean to control Backdrop visibility
    const isProcessing = processingState === 'uploading' || processingState === 'generating' || processingState === 'success';
    
    return (
      <Backdrop
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          flexDirection: 'column',
          color: 'white'
        }}
        open={isProcessing}
      >
        {processingState === 'success' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-center"
          >
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Ad Created Successfully!
            </Typography>
            <Typography variant="body1">
              Redirecting to dashboard...
            </Typography>
          </motion.div>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: 3 }}>
              {processingState === 'uploading' ? 'Uploading Media...' : 'Generating Ad...'}
            </Typography>
            <Box sx={{ width: '80%', maxWidth: 400, mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                color={processingState === 'uploading' ? 'primary' : 'secondary'}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Typography variant="body1">
              {processingState === 'uploading' 
                ? 'Uploading and processing your media file...' 
                : 'Our AI is creating your ad. This may take a moment...'}
            </Typography>
          </>
        )}
      </Backdrop>
    );
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Paper elevation={0} className="p-6 mb-6">
                <TemplateGallery onSelectTemplate={handleSelectTemplate} />
              </Paper>
            </motion.div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Paper elevation={0} className="p-6 mb-6">
                {selectedTemplate && (
                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                      Template: {selectedTemplate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTemplate.description}
                    </Typography>
                  </Box>
                )}
                <Suspense fallback={<Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress /></Box>}>
                  <AdCreationForm 
                    onSubmit={handleSubmit} 
                    isSubmitting={isCreatingAd} 
                    initialData={initialFormValues}
                  />
                </Suspense>
              </Paper>
            </motion.div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Paper elevation={0} className="p-6 mb-6 text-center">
                <Typography variant="h5" gutterBottom>
                  Creating Your Ad
                </Typography>
                <Typography variant="body1" paragraph>
                  Please wait while we process your ad...
                </Typography>
              </Paper>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Create Ad - Facebook Ad Creator</title>
        <meta name="description" content="Create a new Facebook ad with AI" />
      </Head>

      {renderProcessingOverlay()}

      <Box className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <Box className="bg-white border-b">
          <Container maxWidth="lg">
            <Box py={2} display="flex" alignItems="center">
              <button 
                onClick={handleGoBack}
                className="mr-4 p-1 rounded-full hover:bg-gray-100"
                aria-label="Go back"
                disabled={isCreatingAd}
              >
                <ArrowBackIcon />
              </button>
              <Typography variant="h5" component="h1" className="font-bold">
                Create New Ad
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Stepper */}
        <Container maxWidth="lg" className="py-4">
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>

        {/* Main content */}
        <Container maxWidth="lg" className="py-4">
          {renderStepContent()}
        </Container>
        
        {/* Error and success messages */}
        <Snackbar 
          open={!!error || !!successMessage} 
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={error ? "error" : "success"} 
            sx={{ width: '100%' }}
          >
            {error || successMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default CreateAdPage; 