import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import AdCreationForm from '../components/forms/AdCreationForm';
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

// Animation variants
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
  
  // Get the createAd function from our hook
  const { createAd, isCreatingAd } = useAds();

  const handleSubmit = async (formData: AdFormData) => {
    setError(null);
    
    try {
      if (!formData.imageFile) {
        setError('Please upload an image or video file');
        return;
      }
      
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
            isVideo: formData.isVideo
          }, 
          mediaFile: formData.imageFile 
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
  };

  const handleGoBack = () => {
    if (processingState !== 'idle') {
      // Show a confirmation dialog if the user tries to leave during processing
      if (window.confirm('Are you sure you want to leave? Your ad creation will be cancelled.')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  // Render the processing overlay
  const renderProcessingOverlay = () => {
    if (processingState === 'idle') return null;
    
    return (
      <Backdrop
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          flexDirection: 'column',
          color: 'white'
        }}
        open={processingState !== 'idle'}
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

        {/* Main content */}
        <Container maxWidth="lg" className="py-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Introduction */}
            <motion.div variants={itemVariants}>
              <Paper className="p-6 mb-6">
                <Typography variant="h6" className="mb-2 font-medium">
                  Let's create your Facebook ad
                </Typography>
                <Typography variant="body1" color="textSecondary" className="mb-4">
                  Follow the steps below to create a professional Facebook ad using our AI tools. 
                  You'll be able to upload your image or video, customize the content, and choose 
                  your preferred style.
                </Typography>
                <Alert severity="info" className="mb-2">
                  For best results, use high-quality images and clear, concise ad copy.
                </Alert>
              </Paper>
            </motion.div>

            {/* Form */}
            <motion.div variants={itemVariants}>
              <Paper className="p-6 mb-6">
                <AdCreationForm 
                  onSubmit={handleSubmit}
                  isSubmitting={processingState !== 'idle'}
                />
              </Paper>
            </motion.div>
            
            {/* Tips and guidelines */}
            <motion.div variants={itemVariants}>
              <Paper className="p-6">
                <Typography variant="h6" className="mb-3 font-medium">
                  Tips for effective Facebook ads
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Typography variant="subtitle2" color="primary" className="mb-1">
                      Keep it simple
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Clear, concise messaging performs better than complicated ads.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary" className="mb-1">
                      Focus on benefits
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tell people how your product or service will help them.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary" className="mb-1">
                      Use high-quality visuals
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sharp, well-lit images or videos capture attention better.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary" className="mb-1">
                      Include a clear call-to-action
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tell people exactly what you want them to do next.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* Success/Error messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          className: "bg-green-600"
        }}
      />
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          className: "bg-red-600"
        }}
      />
    </>
  );
};

export default CreateAdPage; 