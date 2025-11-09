import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Grid,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Restaurant,
  People,
  Assessment,
  Campaign,
  PsychologyAlt,
  AccountCircle,
  Logout,
  Facebook,
  Twitter,
  LinkedIn,
  Email,
  MailOutline,
  ContactMail
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Menu Management', icon: <Restaurant />, path: '/menu' },
  { text: 'User Management', icon: <People />, path: '/users' },
  { text: 'Order Management', icon: <Assessment />, path: '/orders' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Promotions', icon: <Campaign />, path: '/promotions' },
  { text: 'Email Management', icon: <MailOutline />, path: '/email' },
  { text: 'Contact Management', icon: <ContactMail />, path: '/contact' },
  { text: 'AI Predictions', icon: <PsychologyAlt />, path: '/dashboard/predictions' },
];

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleMenuClose();
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          🍽️ Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  '&:hover': {
                    backgroundColor: '#bbdefb',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#1976d2' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ color: location.pathname === item.path ? '#1976d2' : 'inherit' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Header - Full Width */}
      <AppBar
        position="static"
        sx={{
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Healthy Restaurant Admin
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>{user?.name}</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content Area with Sidebar */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ 
            width: { sm: drawerWidth }, 
            flexShrink: { sm: 0 },
            height: '100%',
            overflow: 'hidden'
          }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                position: 'relative',
                height: '100%',
                overflow: 'auto'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ p: 3, flexGrow: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>

      {/* Footer - Full Width */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 3,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          width: '100%',
        }}
      >
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            {/* About Section */}
            <Grid item xs={12} sm={6} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                🍽️ About
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Healthy Restaurant Admin Panel - Manage your restaurant operations efficiently and effectively.
              </Typography>
            </Grid>

            {/* Social Links */}
            <Grid item xs={12} sm={6} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <Twitter fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <LinkedIn fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <Email fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Bottom Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Healthy Restaurant. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="#" underline="hover" variant="body2" color="text.secondary" sx={{ '&:hover': { color: '#1976d2' } }}>
                Privacy Policy
              </Link>
              <Link href="#" underline="hover" variant="body2" color="text.secondary" sx={{ '&:hover': { color: '#1976d2' } }}>
                Terms of Service
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
