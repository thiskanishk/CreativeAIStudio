import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Typography, Container, Grid, Box, Card, CardContent } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const features = [
  {
    title: 'AI-Enhanced Images',
    description: 'Upload your product photos and let our AI enhance them with background removal and color correction.'
  },
  {
    title: 'Creative Generation',
    description: 'Generate professional-looking image and video ads with customizable styles and branding.'
  },
  {
    title: 'Smart Ad Copy',
    description: 'Get AI-powered suggestions for compelling ad copy that drives engagement.'
  },
  {
    title: 'Video Ads with Effects',
    description: 'Create animated video ads with Ken Burns effect, music, and optional voiceover.'
  },
  {
    title: 'Campaign Management',
    description: 'Organize your creatives in campaigns and track their performance.'
  },
  {
    title: 'Export & Share',
    description: 'Download your ads or share them directly with a public link.'
  }
];

const pricingPlans = [
  {
    title: 'Free',
    price: '$0',
    features: [
      '5 creatives per month',
      'Standard definition output',
      'Basic styles',
      'Ad copy suggestions',
      'Watermark on exports'
    ],
    buttonText: 'Start Free',
    buttonLink: '/register',
    highlighted: false
  },
  {
    title: 'Pro',
    price: '$19',
    period: '/month',
    features: [
      'Unlimited creatives',
      'HD & Full HD output',
      'All styles and effects',
      'No watermark',
      'Video ads with music',
      'Voiceover narration',
      'Priority rendering'
    ],
    buttonText: 'Get Pro',
    buttonLink: '/register?plan=pro',
    highlighted: true
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>AI-Powered Facebook Ad Creator</title>
        <meta name="description" content="Create stunning Facebook ads with AI enhancement" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container-app py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              AdCreatorAI
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-primary-600">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary">
              Sign Up Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-app py-20">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" component="h1" className="text-4xl md:text-5xl font-bold mb-4">
                Create Amazing Facebook Ads with AI
              </Typography>
              <Typography variant="h6" component="p" className="text-lg opacity-90 mb-8">
                Transform your product photos into stunning Facebook ads in seconds using our AI-powered creative generation.
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn btn-secondary bg-white text-primary-600 hover:bg-gray-100">
                  Start Creating for Free
                </Link>
                <Link href="#features" className="btn btn-outline border-white text-white hover:bg-primary-500">
                  Learn More
                </Link>
              </div>
            </Grid>
            <Grid item xs={12} md={6} className="mt-8 md:mt-0">
              <div className="relative bg-white rounded-xl shadow-lg p-4">
                <div className="aspect-w-16 aspect-h-9 relative h-64">
                  <Image
                    src="/hero-preview.png"
                    alt="AI Ad Creator Preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <Typography variant="h2" component="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Create Professional Ads in Minutes
            </Typography>
            <Typography variant="body1" className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes it easy to create high-quality Facebook ads without design skills.
            </Typography>
          </div>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className="h-full transition-transform hover:scale-105">
                  <CardContent className="p-6">
                    <Typography variant="h5" component="h3" className="font-bold mb-3">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <Typography variant="h2" component="h2" className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </Typography>
            <Typography variant="body1" className="text-gray-600 max-w-2xl mx-auto">
              Create stunning Facebook ads in just a few simple steps.
            </Typography>
          </div>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <Typography variant="h5" component="h3" className="font-bold mb-2">
                  Upload Images
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Upload your product photos and our AI will enhance them automatically.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <Typography variant="h5" component="h3" className="font-bold mb-2">
                  Customize
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Add your ad text, choose a style, and customize branding elements.
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <Typography variant="h5" component="h3" className="font-bold mb-2">
                  Generate & Export
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Our AI creates your ad and you can download it or share it directly.
                </Typography>
              </div>
            </Grid>
          </Grid>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <Typography variant="h2" component="h2" className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="body1" className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works for your needs, with no complicated tiers.
            </Typography>
          </div>
          
          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={6} lg={5} key={index}>
                <Card 
                  className={`h-full border-2 ${plan.highlighted ? 'border-primary-500' : 'border-gray-200'}`}
                  elevation={plan.highlighted ? 8 : 1}
                >
                  {plan.highlighted && (
                    <div className="bg-primary-500 text-white text-center py-2 font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-8">
                    <Typography variant="h4" component="h3" className="font-bold mb-2">
                      {plan.title}
                    </Typography>
                    <div className="mb-6">
                      <Typography variant="h3" component="p" className="font-bold">
                        {plan.price}
                        <span className="text-gray-500 text-base font-normal">{plan.period}</span>
                      </Typography>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckCircleIcon className="text-primary-500 mr-2 h-5 w-5 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.buttonLink}
                      className={`w-full btn ${
                        plan.highlighted ? 'btn-primary' : 'btn-outline'
                      } flex justify-center`}
                    >
                      {plan.buttonText}
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container-app text-center">
          <Typography variant="h3" component="h2" className="font-bold mb-4">
            Ready to Create Your First Ad?
          </Typography>
          <Typography variant="body1" className="opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our AI to create stunning Facebook ads that convert.
          </Typography>
          <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center">
            Get Started Free <ArrowForwardIcon className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Typography variant="h6" component="h4" className="font-bold mb-4">
                AdCreatorAI
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                The AI-powered platform for creating stunning Facebook ads in minutes.
              </Typography>
            </div>
            <div>
              <Typography variant="h6" component="h4" className="font-bold mb-4">
                Product
              </Typography>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <Typography variant="h6" component="h4" className="font-bold mb-4">
                Support
              </Typography>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <Typography variant="h6" component="h4" className="font-bold mb-4">
                Legal
              </Typography>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <Typography variant="body2">
              &copy; {new Date().getFullYear()} AdCreatorAI. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
} 