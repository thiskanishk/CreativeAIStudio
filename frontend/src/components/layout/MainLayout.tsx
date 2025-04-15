import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
    handleUserMenuClose();
    router.push('/login');
  };
  
  const navigationItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard',
      active: isActive('/dashboard')
    },
    { 
      text: 'Create Ad', 
      icon: <AddCircleOutlineIcon />, 
      path: '/create-ad',
      active: isActive('/create-ad')
    },
    { 
      text: 'Analytics', 
      icon: <AnalyticsIcon />, 
      path: '/analytics',
      active: isActive('/analytics')
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      active: isActive('/settings')
    },
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box p={2} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h6" fontWeight="bold" color="primary">
          AdCreatorAI
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <Link href={item.path} key={item.text} passHref>
            <ListItem 
              button 
              component="a"
              selected={item.active}
              onClick={() => {
                if (isMobile) {
                  setDrawerOpen(false);
                }
              }}
              sx={{
                borderRadius: '0 24px 24px 0',
                mx: 1,
                mb: 0.5,
                color: item.active ? 'primary.main' : 'text.primary',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: item.active ? 'primary.main' : 'inherit' 
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <Box mt="auto" pb={2} px={2} className="mt-8">
        <Box 
          p={2} 
          bgcolor="primary.50" 
          borderRadius={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <HelpOutlineIcon color="primary" className="mb-2" />
          <Typography variant="subtitle2" fontWeight={500} gutterBottom>
            Need help?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Check our documentation or contact support
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            fullWidth
            component="a"
            href="/help"
          >
            View Help Center
          </Button>
        </Box>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={1}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Link href="/" passHref>
            <Typography
              variant="h6"
              component="a"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 'bold',
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              AdCreatorAI
            </Typography>
          </Link>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large" color="inherit" sx={{ mr: 1 }}>
              <NotificationsIcon />
            </IconButton>
            
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls="user-menu"
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            
            <Menu
              id="user-menu"
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 180 }
              }}
            >
              <Box px={2} py={1}>
                <Typography variant="subtitle2">John Doe</Typography>
                <Typography variant="body2" color="text.secondary">
                  john.doe@example.com
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { router.push('/profile'); handleUserMenuClose(); }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { router.push('/settings'); handleUserMenuClose(); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer (sidebar) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250 
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
              border: 'none',
              backgroundColor: '#f9fafc',
            },
          }}
          open
        >
          <Toolbar />
          {drawer}
        </Drawer>
      )}
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - 250px)` },
          bgcolor: '#f9fafc',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 