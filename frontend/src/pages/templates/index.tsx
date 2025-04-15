import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  TextField, 
  MenuItem, 
  InputAdornment,
  Chip,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CloseIcon from '@mui/icons-material/Close';
// Temporary Layout component until the real one is created
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);
import TemplateCard from '../../components/ui/TemplateCard';
import { templates, AdTemplate } from '../../data/templates';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';

interface CategoryTabProps {
  label: string;
  value: string;
  count: number;
}

const TemplateGallery: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<AdTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock user subscription status - in a real app, this would come from an auth context
  const isSubscribed = false;

  // Get all unique categories from templates
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  // Create category tabs with counts
  const categoryTabs: CategoryTabProps[] = categories.map(cat => ({
    label: cat === 'all' ? 'All Templates' : cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat,
    count: cat === 'all' ? templates.length : templates.filter(t => t.category === cat).length
  }));

  // Filter and sort templates based on current selections
  useEffect(() => {
    let filtered = [...templates];
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort templates
    switch(sortBy) {
      case 'newest':
        // In a real app, this would sort by creation date
        filtered = [...filtered].reverse();
        break;
      case 'popular':
        // In a real app, this would sort by popularity metrics
        filtered = [...filtered].sort((a, b) => (b.tags.length - a.tags.length));
        break;
      case 'alphabetical':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    setTemplates(filtered);
  }, [category, searchQuery, sortBy, templates]);

  const handleSelectTemplate = (template: AdTemplate) => {
    // Navigate to the ad creation page with the selected template
    router.push({
      pathname: '/create-ad',
      query: { 
        templateId: template.id
      }
    });
  };

  const handlePreviewTemplate = (template: AdTemplate) => {
    setPreviewTemplate(template);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <Head>
        <title>AI Ad Templates | Facebook Ad Creator</title>
        <meta name="description" content="Browse and use our AI-powered ad templates to create stunning Facebook ads in seconds" />
      </Head>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' } 
            }}
          >
            AI Ad Template Gallery
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' } 
            }}
          >
            Choose from our curated collection of AI-powered templates to create compelling Facebook ads instantly
          </Typography>
        </Box>
        
        {/* Search and Filter Bar */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2, 
            mb: 4,
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between'
          }}
        >
          {/* Search Input */}
          <TextField 
            placeholder="Search templates..."
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: '8px' }
            }}
            sx={{ maxWidth: { md: '400px' } }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Sort Dropdown */}
            <TextField
              select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: '150px' }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="alphabetical">A-Z</MenuItem>
            </TextField>
          </Box>
        </Box>
        
        {/* Category Tabs */}
        <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={category}
            onChange={(_, value) => setCategory(value)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : undefined}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }
            }}
          >
            {categoryTabs.map(cat => (
              <Tab 
                key={cat.value} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{cat.label}</Typography>
                    <Chip 
                      label={cat.count} 
                      size="small" 
                      sx={{ 
                        height: '20px', 
                        fontSize: '0.7rem',
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.1)'
                      }} 
                    />
                  </Box>
                } 
                value={cat.value} 
              />
            ))}
          </Tabs>
        </Box>
        
        {/* Template Grid */}
        <Grid container spacing={3}>
          {templates.length > 0 ? (
            templates.map(template => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                <TemplateCard
                  template={template}
                  onSelect={handleSelectTemplate}
                  onPreview={handlePreviewTemplate}
                  isSubscribed={isSubscribed}
                />
              </Grid>
            ))
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                py: 8, 
                textAlign: 'center' 
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No templates found matching your criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchQuery('');
                  setCategory('all');
                  setSortBy('newest');
                }}
                sx={{ mt: 2 }}
              >
                Reset Filters
              </Button>
            </Box>
          )}
        </Grid>
        
        {/* Template Preview Modal */}
        <Dialog
          open={isModalOpen}
          onClose={closePreviewModal}
          maxWidth="md"
          fullWidth
          aria-labelledby="template-preview-title"
        >
          <DialogTitle id="template-preview-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {previewTemplate?.name}
            <IconButton
              aria-label="close"
              onClick={closePreviewModal}
              sx={{ color: theme => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {previewTemplate && (
              <Grid container spacing={3}>
                {/* Preview Image */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: 'relative', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                    <Image
                      src={previewTemplate.previewImage || '/placeholders/template.jpg'}
                      alt={previewTemplate.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </Box>
                </Grid>
                
                {/* Template Details */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Template Details
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Category
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {previewTemplate.category.charAt(0).toUpperCase() + previewTemplate.category.slice(1)}
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {previewTemplate.description}
                  </Typography>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Suggested Elements
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {previewTemplate.settings?.titleSuggestions && (
                      <Typography component="li" variant="body2" color="text.secondary">
                        <strong>Title styles:</strong> {previewTemplate.settings.titleSuggestions.join(', ')}
                      </Typography>
                    )}
                    {previewTemplate.settings?.descriptionTips && (
                      <Typography component="li" variant="body2" color="text.secondary">
                        <strong>Description focus:</strong> {previewTemplate.settings.descriptionTips.join(', ')}
                      </Typography>
                    )}
                    {previewTemplate.settings?.callToActionOptions && (
                      <Typography component="li" variant="body2" color="text.secondary">
                        <strong>CTAs:</strong> {previewTemplate.settings.callToActionOptions.join(', ')}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {previewTemplate.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small"
                        sx={{ borderRadius: '4px' }}
                      />
                    ))}
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={() => {
                      closePreviewModal();
                      handleSelectTemplate(previewTemplate);
                    }}
                    disabled={previewTemplate.isPremium && !isSubscribed}
                  >
                    {previewTemplate.isPremium && !isSubscribed 
                      ? 'Upgrade to Use This Template' 
                      : 'Use This Template'}
                  </Button>
                </Grid>
              </Grid>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default TemplateGallery; 