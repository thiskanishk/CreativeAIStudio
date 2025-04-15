import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Tabs, 
  Tab, 
  Button as MuiButton, 
  InputBase, 
  Paper,
  Fab,
  CircularProgress,
  Pagination,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Fade,
  Skeleton,
  Card,
  CardContent,
  Badge,
  Tooltip,
  Divider,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch
} from '@mui/material';
import { motion } from 'framer-motion';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import DateRangeIcon from '@mui/icons-material/DateRange';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import GridViewIcon from '@mui/icons-material/GridView';
import UpdateIcon from '@mui/icons-material/Update';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import AdPreviewCard from '../components/ui/AdPreviewCard';
import { useAds } from '../hooks/useAds';
import { useThemeContext } from '../context/ThemeContext';
import { formatFileSize } from '../utils/image';

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
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

const Dashboard = () => {
  const router = useRouter();
  const { mode, toggleColorMode } = useThemeContext();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showRecent, setShowRecent] = useState(true);
  const [filters, setFilters] = useState({
    showDrafts: true,
    showProcessing: true,
    showReady: true,
    showFailed: true,
  });

  // Use our ads hook
  const { 
    ads, 
    isLoadingAds, 
    deleteAd, 
    isDeletingAd,
    downloadAd,
    isDownloadingAd,
    shareAd,
    isSharingAd
  } = useAds();

  // Recently viewed IDs (would normally come from local storage or API)
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    // Load recently viewed from localStorage
    const savedRecent = localStorage.getItem('recentlyViewedAds');
    if (savedRecent) {
      try {
        setRecentlyViewed(JSON.parse(savedRecent));
      } catch (e) {
        console.error('Error parsing recently viewed ads', e);
      }
    }
  }, []);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1);
  };

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Handle sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (option: 'newest' | 'oldest' | 'az' | 'za') => {
    setSortOption(option);
    handleSortMenuClose();
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked,
    });
    setCurrentPage(1);
  };

  // Toggle view mode (grid/list)
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Create new ad
  const handleCreateNew = () => {
    router.push('/create-ad');
  };

  // View ad details
  const handleViewAd = (adId: string) => {
    // Add to recently viewed
    const updatedRecent = [adId, ...recentlyViewed.filter(id => id !== adId)].slice(0, 5);
    setRecentlyViewed(updatedRecent);
    localStorage.setItem('recentlyViewedAds', JSON.stringify(updatedRecent));
    
    router.push(`/ad/${adId}`);
  };

  // Edit ad
  const handleEditAd = (id: string) => {
    router.push(`/edit-ad/${id}`);
  };
  
  // Download ad
  const handleDownloadAd = async (id: string) => {
    await downloadAd(id);
  };
  
  // Share ad
  const handleShareAd = async (id: string) => {
    await shareAd(id);
  };

  // Open delete dialog
  const handleDeleteDialogOpen = (id: string) => {
    setSelectedAdId(id);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // Delete ad
  const handleConfirmDelete = async () => {
    if (selectedAdId) {
      await deleteAd(selectedAdId);
      handleDeleteDialogClose();
      
      // Remove from recently viewed if present
      if (recentlyViewed.includes(selectedAdId)) {
        const updatedRecent = recentlyViewed.filter(id => id !== selectedAdId);
        setRecentlyViewed(updatedRecent);
        localStorage.setItem('recentlyViewedAds', JSON.stringify(updatedRecent));
      }
    }
  };

  // Calculate total storage used
  const calculateTotalStorage = () => {
    if (!ads) return 0;
    
    // This is just a placeholder. In a real app, you'd get actual file sizes
    const avgSize = 1.5 * 1024 * 1024; // 1.5MB average
    return ads.length * avgSize;
  };

  // Filter and sort ads based on tab, search query, and sort option
  const getFilteredAds = () => {
    if (!ads) return [];
    
    let filtered = [...ads];
    
    // Filter by tab
    if (tabValue === 1) { // Images
      filtered = filtered.filter(ad => ad.adType === 'image');
    } else if (tabValue === 2) { // Videos
      filtered = filtered.filter(ad => ad.adType === 'video');
    } else if (tabValue === 3) { // Drafts
      filtered = filtered.filter(ad => ad.status === 'draft');
    }
    
    // Filter by status checkboxes
    filtered = filtered.filter(ad => {
      if (ad.status === 'draft' && !filters.showDrafts) return false;
      if (ad.status === 'processing' && !filters.showProcessing) return false;
      if (ad.status === 'ready' && !filters.showReady) return false;
      if (ad.status === 'failed' && !filters.showFailed) return false;
      return true;
    });
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(query) || 
        ad.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredAds = getFilteredAds();
  
  // Calculate pagination
  const adsPerPage = viewMode === 'grid' ? 6 : 5;
  const pageCount = Math.ceil(filteredAds.length / adsPerPage);
  const displayedAds = filteredAds.slice(
    (currentPage - 1) * adsPerPage,
    currentPage * adsPerPage
  );

  // Get recently viewed ads
  const getRecentlyViewedAds = () => {
    if (!ads) return [];
    return recentlyViewed
      .map(id => ads.find(ad => ad.id === id))
      .filter(ad => ad !== undefined) as typeof ads;
  };

  const recentAds = getRecentlyViewedAds();

  // Get the sort icon and label
  const getSortLabel = () => {
    switch (sortOption) {
      case 'newest':
        return { icon: <DateRangeIcon />, label: 'Newest First' };
      case 'oldest':
        return { icon: <DateRangeIcon />, label: 'Oldest First' };
      case 'az':
        return { icon: <SortByAlphaIcon />, label: 'A to Z' };
      case 'za':
        return { icon: <SortByAlphaIcon />, label: 'Z to A' };
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Facebook Ad Creator</title>
        <meta name="description" content="Manage your Facebook ad creations" />
      </Head>

      <Box className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <Box className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <Container maxWidth="xl">
            <Box py={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="h1" className="font-bold">
                My Ad Creations
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                  <IconButton onClick={toggleColorMode} size="small" className="bg-gray-100 dark:bg-gray-700">
                    {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <MuiButton
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Create New Ad
                </MuiButton>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Main content */}
        <Container maxWidth="xl" className="py-6">
          {/* Recently Viewed Section (Collapsible) */}
          {recentAds.length > 0 && showRecent && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Paper className="p-4">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <HistoryIcon color="primary" />
                    <Typography variant="h6">Recently Viewed</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setShowRecent(false)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Grid container spacing={2}>
                  {recentAds.map((ad) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={`recent-${ad.id}`}>
                      <Card 
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleViewAd(ad.id)}
                      >
                        <Box className="relative aspect-video">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                          <Chip 
                            label={ad.status.charAt(0).toUpperCase() + ad.status.slice(1)} 
                            size="small"
                            color={
                              ad.status === 'ready' ? 'success' : 
                              ad.status === 'draft' ? 'warning' : 
                              ad.status === 'failed' ? 'error' : 'info'
                            }
                            className="absolute bottom-2 right-2"
                          />
                        </Box>
                        <CardContent className="p-2">
                          <Typography variant="body2" noWrap>{ad.title}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}
          
          {/* Filters and Search */}
          <Box mb={4} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              className="bg-white dark:bg-gray-800 rounded-md"
              sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              <Tab label="All" />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ImageIcon fontSize="small" />
                    <span>Images</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <VideocamIcon fontSize="small" />
                    <span>Videos</span>
                  </Box>
                } 
              />
              <Tab label="Drafts" />
            </Tabs>

            <Box display="flex" gap={2}>
              <Paper
                component="form"
                className="flex items-center px-2 w-full max-w-xs"
                elevation={1}
                onSubmit={(e) => e.preventDefault()}
              >
                <InputBase
                  placeholder="Search ads..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="ml-1 flex-1"
                />
                <IconButton type="submit" className="p-1" aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Paper>

              <IconButton 
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" 
                aria-label="filter"
                size="small"
                onClick={handleFilterMenuOpen}
              >
                <Badge 
                  badgeContent={
                    Object.values(filters).filter(v => !v).length
                  } 
                  color="primary"
                  invisible={Object.values(filters).every(v => v)}
                >
                  <FilterListIcon />
                </Badge>
              </IconButton>
              
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterMenuClose}
              >
                <Box sx={{ width: 200, p: 2 }}>
                  <Typography variant="subtitle2" className="mb-2">Filter by Status</Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.showDrafts} 
                          onChange={handleFilterChange} 
                          name="showDrafts" 
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Draft</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.showProcessing} 
                          onChange={handleFilterChange} 
                          name="showProcessing" 
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Processing</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.showReady} 
                          onChange={handleFilterChange} 
                          name="showReady" 
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Ready</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={filters.showFailed} 
                          onChange={handleFilterChange} 
                          name="showFailed" 
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Failed</Typography>}
                    />
                  </FormGroup>
                </Box>
              </Menu>

              <IconButton 
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" 
                aria-label="sort"
                size="small"
                onClick={handleSortMenuOpen}
              >
                {getSortLabel().icon}
              </IconButton>
              
              <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={handleSortMenuClose}
              >
                <MenuItem 
                  selected={sortOption === 'newest'} 
                  onClick={() => handleSortChange('newest')}
                >
                  Newest First
                </MenuItem>
                <MenuItem 
                  selected={sortOption === 'oldest'} 
                  onClick={() => handleSortChange('oldest')}
                >
                  Oldest First
                </MenuItem>
                <MenuItem 
                  selected={sortOption === 'az'} 
                  onClick={() => handleSortChange('az')}
                >
                  A to Z
                </MenuItem>
                <MenuItem 
                  selected={sortOption === 'za'} 
                  onClick={() => handleSortChange('za')}
                >
                  Z to A
                </MenuItem>
              </Menu>
              
              <Tooltip title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}>
                <IconButton 
                  className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  aria-label="change view"
                  size="small"
                  onClick={toggleViewMode}
                >
                  {viewMode === 'grid' ? <CalendarViewWeekIcon /> : <GridViewIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Stats Row */}
          {!isLoadingAds && ads && (
            <Box mb={4}>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Card className="position-relative overflow-hidden transition-all hover:shadow-md">
                    <Box className="absolute top-0 right-0 h-full w-1 bg-primary-500" />
                    <CardContent>
                      <Typography variant="overline" className="text-gray-500 dark:text-gray-400">
                        Total Ads
                      </Typography>
                      <Typography variant="h4" className="font-bold text-primary-600 dark:text-primary-400">
                        {ads.length}
                      </Typography>
                      
                      <Box className="mt-2 flex items-center text-sm text-gray-400">
                        <Typography variant="caption">
                          {formatFileSize(calculateTotalStorage())} storage used
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card className="position-relative overflow-hidden transition-all hover:shadow-md">
                    <Box className="absolute top-0 right-0 h-full w-1 bg-blue-500" />
                    <CardContent>
                      <Typography variant="overline" className="text-gray-500 dark:text-gray-400">
                        Images
                      </Typography>
                      <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                        {ads.filter(ad => ad.adType === 'image').length}
                      </Typography>
                      
                      <Box className="mt-2 flex items-center text-sm text-gray-400">
                        <ImageIcon fontSize="small" className="mr-1" />
                        <Typography variant="caption">
                          {(ads.filter(ad => ad.adType === 'image').length / ads.length * 100).toFixed(0)}% of total
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card className="position-relative overflow-hidden transition-all hover:shadow-md">
                    <Box className="absolute top-0 right-0 h-full w-1 bg-purple-500" />
                    <CardContent>
                      <Typography variant="overline" className="text-gray-500 dark:text-gray-400">
                        Videos
                      </Typography>
                      <Typography variant="h4" className="font-bold text-purple-600 dark:text-purple-400">
                        {ads.filter(ad => ad.adType === 'video').length}
                      </Typography>
                      
                      <Box className="mt-2 flex items-center text-sm text-gray-400">
                        <VideocamIcon fontSize="small" className="mr-1" />
                        <Typography variant="caption">
                          {(ads.filter(ad => ad.adType === 'video').length / ads.length * 100).toFixed(0)}% of total
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card className="position-relative overflow-hidden transition-all hover:shadow-md">
                    <Box className="absolute top-0 right-0 h-full w-1 bg-amber-500" />
                    <CardContent>
                      <Typography variant="overline" className="text-gray-500 dark:text-gray-400">
                        Drafts
                      </Typography>
                      <Typography variant="h4" className="font-bold text-amber-600 dark:text-amber-400">
                        {ads.filter(ad => ad.status === 'draft').length}
                      </Typography>
                      
                      <Box className="mt-2 flex items-center text-sm text-gray-400">
                        <UpdateIcon fontSize="small" className="mr-1" />
                        <Typography variant="caption">
                          {ads.filter(ad => ad.status === 'processing').length} currently processing
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Results Summary */}
          {!isLoadingAds && (
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="textSecondary">
                {filteredAds.length} {filteredAds.length === 1 ? 'result' : 'results'} {searchQuery ? `for "${searchQuery}"` : ''}
              </Typography>
              
              {searchQuery && (
                <Chip 
                  label={`Clear search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery('')}
                  size="small"
                />
              )}
            </Box>
          )}

          {/* Content */}
          <Box className="relative min-h-[500px]">
            {isLoadingAds ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item}>
                    <Paper className="h-full">
                      <Skeleton variant="rectangular" height={200} />
                      <Box p={2}>
                        <Skeleton variant="text" height={30} width="70%" />
                        <Skeleton variant="text" height={20} width="40%" />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : displayedAds.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Grid container spacing={3}>
                      {displayedAds.map((ad) => (
                        <Grid item xs={12} sm={6} md={4} key={ad.id}>
                          <motion.div variants={itemVariants}>
                            <AdPreviewCard 
                              id={ad.id}
                              title={ad.title}
                              imageUrl={ad.imageUrl}
                              createdAt={ad.createdAt}
                              adType={ad.adType}
                              status={ad.status}
                              onView={() => handleViewAd(ad.id)}
                              onEdit={() => handleEditAd(ad.id)}
                              onDelete={() => handleDeleteDialogOpen(ad.id)}
                              onDownload={() => handleDownloadAd(ad.id)}
                              onShare={() => handleShareAd(ad.id)}
                            />
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </motion.div>
                ) : (
                  <Paper className="overflow-hidden">
                    {displayedAds.map((ad, index) => (
                      <React.Fragment key={ad.id}>
                        <Box 
                          className="p-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => handleViewAd(ad.id)}
                        >
                          <Box 
                            className="w-16 h-16 rounded overflow-hidden flex-shrink-0"
                            style={{ backgroundImage: `url(${ad.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          >
                            <Chip
                              label={ad.adType}
                              size="small"
                              color={ad.adType === 'video' ? 'secondary' : 'primary'}
                              className="m-1"
                            />
                          </Box>
                          
                          <Box className="flex-grow min-w-0">
                            <Typography variant="subtitle1" noWrap>{ad.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Created: {new Date(ad.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Chip 
                            label={ad.status} 
                            size="small"
                            color={
                              ad.status === 'ready' ? 'success' : 
                              ad.status === 'draft' ? 'warning' : 
                              ad.status === 'failed' ? 'error' : 'info'
                            }
                          />
                          
                          <Box className="flex gap-1">
                            <Tooltip title="View">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewAd(ad.id); }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditAd(ad.id); }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteDialogOpen(ad.id); }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        {index < displayedAds.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Paper>
                )}
                
                {/* Pagination */}
                {pageCount > 1 && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      count={pageCount}
                      page={currentPage}
                      onChange={(_event, page) => setCurrentPage(page)}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            ) : (
              <Fade in={true} timeout={800}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="400px"
                  textAlign="center"
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Box className="w-32 h-32 mb-4 opacity-60 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {searchQuery ? (
                      <SearchIcon sx={{ fontSize: 48 }} className="text-gray-400" />
                    ) : (
                      <AddIcon sx={{ fontSize: 48 }} className="text-gray-400" />
                    )}
                  </Box>
                  <Typography variant="h6" className="mb-2">
                    {searchQuery ? "No ads match your search" : "No ads yet"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" className="mb-4 max-w-md">
                    {searchQuery
                      ? "Try adjusting your search terms or filters to find what you're looking for."
                      : "Create your first AI-powered Facebook ad to get started."}
                  </Typography>
                  {!searchQuery && (
                    <MuiButton
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleCreateNew}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      Create New Ad
                    </MuiButton>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Container>

        {/* Floating action button (mobile) */}
        <Box
          position="fixed"
          bottom={24}
          right={24}
          zIndex={1000}
          className="sm:hidden"
        >
          <Fab
            color="primary"
            aria-label="create new ad"
            onClick={handleCreateNew}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" className="flex justify-between items-center">
            <span>Delete Ad</span>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleDeleteDialogClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this ad? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <MuiButton onClick={handleDeleteDialogClose} color="primary" disabled={isDeletingAd}>
              Cancel
            </MuiButton>
            <MuiButton
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeletingAd}
              startIcon={isDeletingAd ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {isDeletingAd ? 'Deleting...' : 'Delete'}
            </MuiButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Dashboard; 