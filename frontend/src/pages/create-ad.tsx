import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Lazy load components to improve initial load time
const AdCreationForm = lazy(() => import('../components/forms/AdCreationForm'));
// Import our new UX enhancement components
import LoadingOverlay, { LoadingState } from '../components/ui/LoadingOverlay';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import FeedbackToast from '../components/ui/FeedbackToast';

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
  const [processingState, setProcessingState] = useState<LoadingState>('idle');
  const [progressValue, setProgressValue] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<Partial<AdFormData>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Get the templateId from URL query params
  const { templateId } = router.query;
  
  // Get the createAd function from our hook
  const { createAd, isCreatingAd } = useAds();

  // Memoize steps to prevent re-creation on each render
  const steps = ['Select Template', 'Customize Ad', 'Review & Create'];

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
        } else {
          // Template not found
          FeedbackToast.error('Template not found', 'Error');
        }
      }).catch(error => {
        if (isMounted) {
          console.error('Error loading template:', error);
          FeedbackToast.error('Failed to load template', 'Error');
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
    
    // Show feedback toast
    FeedbackToast.success(`Template "${template.name}" selected`, 'Template Selected');
  }, []);

  const handleSubmit = useCallback(async (formData: AdFormData) => {
    try {
      if (!formData.imageFile) {
        FeedbackToast.error('Please upload an image or video file', 'Missing Media');
        return;
      }
      
      // Set to review step
      setCurrentStep(2);
      
      // Start the upload/creation process
      setProcessingState('loading');
      setProgressValue(0);
      
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
        setProcessingState('processing');
        
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
            FeedbackToast.success('Your ad has been created successfully!', 'Ad Created');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          })
          .catch(err => {
            clearInterval(generationTimer);
            console.error('Error creating ad:', err);
            setProcessingState('error');
            FeedbackToast.error('Failed to create ad. Please try again.', 'Error');
          });
      }, 3000);
      
    } catch (err) {
      console.error('Error creating ad:', err);
      setProcessingState('error');
      FeedbackToast.error('An unexpected error occurred. Please try again.', 'Error');
    }
  }, [createAd, router, selectedTemplate]);

  const handleGoBack = useCallback(() => {
    if (processingState !== 'idle') {
      // Show a confirmation dialog if the user tries to leave during processing
      setShowExitDialog(true);
    } else if (currentStep > 0) {
      // Go back to previous step
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  }, [processingState, currentStep, router]);

  const handleExitConfirm = useCallback(() => {
    setShowExitDialog(false);
    router.back();
  }, [router]);

  const handleExitCancel = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  const handleProcessingComplete = useCallback(() => {
    if (processingState === 'success') {
      router.push('/dashboard');
    } else if (processingState === 'error') {
      setProcessingState('idle');
    }
  }, [processingState, router]);

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

      {/* Enhanced Loading Overlay */}
      <LoadingOverlay 
        state={processingState}
        open={processingState !== 'idle'}
        progress={progressValue}
        message={processingState === 'loading' ? 'Uploading media...' : 'Generating your ad...'}
        successMessage="Ad created successfully!"
        errorMessage="Failed to create ad. Please try again."
        onClose={handleProcessingComplete}
      />

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        open={showExitDialog}
        title="Cancel Ad Creation?"
        content="Your ad creation is in progress. If you leave now, all progress will be lost. Are you sure you want to exit?"
        confirmLabel="Exit"
        cancelLabel="Stay"
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        type="warning"
      />

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
      </Box>
    </>
  );
};

export default CreateAdPage; 