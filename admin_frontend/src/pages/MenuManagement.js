import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Alert,
  Chip,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  LinearProgress,
  CardContent,
  Card,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Restaurant,
  LocalOffer,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';
import api from '../services/api';
import MultiImageUpload from '../components/MultiImageUpload';

// TabPanel component for managing tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: '',
    imageUrl: '',
    images: [],
    ingredients: '',
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    },
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: ''
  });

  const categories = [
    'Starters',
    'Main Course',
    'Salads',
    'Drinks',
    'Desserts'
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/menu');
      console.log('API Response:', response.data); // Debug log
      
      // Handle different response formats
      let items = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response
          items = response.data;
        } else if (response.data.data && Array.isArray(response.data.data.menuItems)) {
          // Nested response with pagination: { data: { menuItems: [], pagination: {} } }
          items = response.data.data.menuItems;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nested response: { data: [] }
          items = response.data.data;
        } else if (Array.isArray(response.data.menuItems)) {
          // Direct menuItems property
          items = response.data.menuItems;
        }
      }
      
      setMenuItems(items);
      setError('');
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError(`Failed to fetch menu items: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price?.toString() || '',
        discountedPrice: item.discountedPrice ? item.discountedPrice.toString() : '',
        category: item.category,
        imageUrl: item.imageUrl || '',
        images: item.images || [],
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients || '',
        nutritionalInfo: {
          calories: item.nutritionalInfo?.calories !== undefined ? item.nutritionalInfo.calories.toString() : '',
          protein: item.nutritionalInfo?.protein !== undefined ? item.nutritionalInfo.protein.toString() : '',
          carbs: item.nutritionalInfo?.carbs !== undefined ? item.nutritionalInfo.carbs.toString() : '',
          fat: item.nutritionalInfo?.fat !== undefined ? item.nutritionalInfo.fat.toString() : '',
          fiber: item.nutritionalInfo?.fiber !== undefined ? item.nutritionalInfo.fiber.toString() : ''
        },
        isAvailable: item.isAvailable !== false,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false,
        preparationTime: item.preparationTime?.toString() || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: '',
        imageUrl: '',
        images: [],
        ingredients: '',
        nutritionalInfo: {
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: ''
        },
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        preparationTime: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setTabValue(0);
    setError('');
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        ingredients: formData.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing),
        imageUrl: formData.imageUrl || (formData.images.length > 0 ? formData.images[0].url : ''),
        images: formData.images,
        nutritionalInfo: {
          calories: formData.nutritionalInfo.calories ? parseInt(formData.nutritionalInfo.calories) : undefined,
          protein: formData.nutritionalInfo.protein ? parseInt(formData.nutritionalInfo.protein) : undefined,
          carbs: formData.nutritionalInfo.carbs ? parseInt(formData.nutritionalInfo.carbs) : undefined,
          fat: formData.nutritionalInfo.fat ? parseInt(formData.nutritionalInfo.fat) : undefined,
          fiber: formData.nutritionalInfo.fiber ? parseInt(formData.nutritionalInfo.fiber) : undefined
        },
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined
      };

      if (editingItem) {
        await api.put(`/admin/menu/${editingItem._id}`, submitData);
      } else {
        await api.post('/admin/menu', submitData);
      }

      handleCloseDialog();
      fetchMenuItems();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/admin/menu/${id}`);
        fetchMenuItems();
      } catch (error) {
        setError('Failed to delete menu item');
      }
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/menu/${id}/toggle`);
      fetchMenuItems();
    } catch (error) {
      setError('Failed to update availability');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    formDataUpload.append('folderName', formData.name || 'default-menu-item');

    try {
      const response = await api.post('/admin/upload-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.url) {
        handleInputChange('imageUrl', response.data.url);
      }
    } catch (error) {
      setError('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  // StatCard Component
  const StatCard = ({ title, value, icon, color, change }) => (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
              {value}
            </Typography>
            {change && (
              <Typography variant="caption" color="text.secondary">
                {change}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            🍽️ Menu Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage menu items, pricing, and dietary information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add New Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={menuItems.length}
            icon={<Restaurant />}
            color="#3B82F6"
            change="Menu items"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available"
            value={menuItems.filter(item => item.isAvailable).length}
            icon={<CheckCircle />}
            color="#10B981"
            change={`${((menuItems.filter(item => item.isAvailable).length / Math.max(menuItems.length, 1)) * 100).toFixed(0)}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vegetarian"
            value={menuItems.filter(item => item.isVegetarian).length}
            icon={<LocalOffer />}
            color="#8B5CF6"
            change="Vegetarian items"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="With Discount"
            value={menuItems.filter(item => item.discountedPrice).length}
            icon={<TrendingUp />}
            color="#F59E0B"
            change="Discounted items"
          />
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
              <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dietary</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Calories</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(menuItems) && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                  <TableCell style={{ verticalAlign: 'top', width: '30%' }}>
                    <Box display="flex" alignItems="flex-start">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8, objectFit: 'cover' }} />
                      )}
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word', width: '100%' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.category}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                        ₹{item.price}
                      </Typography>
                      {item.discountedPrice && (
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#6B7280' }}>
                          ₹{item.discountedPrice}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {item.isVegetarian && <Chip label="🥬 Veg" size="small" sx={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 600 }} />}
                      {item.isVegan && <Chip label="🌱 Vegan" size="small" sx={{ backgroundColor: '#dcfce7', color: '#14532d', fontWeight: 600 }} />}
                      {item.isGlutenFree && <Chip label="🌾 GF" size="small" sx={{ backgroundColor: '#fef3c7', color: '#78350f', fontWeight: 600 }} />}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.nutritionalInfo?.calories || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.isAvailable ? 'Available' : 'Unavailable'}
                      color={item.isAvailable ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                        sx={{ color: '#3B82F6', '&:hover': { backgroundColor: '#e0e7ff' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item._id)}
                        color="error"
                        sx={{ '&:hover': { backgroundColor: '#fee2e2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {loading ? 'Loading menu items...' : 'No menu items found. Click "Add New Item" to create your first menu item.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog with Tabs */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', borderBottom: 1, borderColor: 'divider' }}>
          {editingItem ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="menu item tabs">
              <Tab label="Basic Info" />
              <Tab label="Images" />
              <Tab label="Nutrition & Options" />
            </Tabs>
          </Box>

          {/* Tab 1: Basic Information */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    variant="outlined"
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Discounted Price"
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                    variant="outlined"
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Full Width Description */}
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  variant="outlined"
                  sx={{ width: '100%' }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ingredients (comma separated)"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    variant="outlined"
                    helperText="Separate multiple ingredients with commas"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Preparation Time (minutes)"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab 2: Images */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ minHeight: '60vh', maxHeight: '90vh', overflowY: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                {/* Multiple Image Upload Section */}
                <Grid item xs={12}>
                  {/* <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Menu Images Gallery</Typography> */}
                  <MultiImageUpload
                    images={formData.images}
                    onImagesChange={(newImages) => handleInputChange('images', newImages)}
                    folderName={formData.name || 'default-menu-item'}
                    maxImages={8}
                    showPreview={true}
                  />
                </Grid>
                
                {/* Single Image Upload (Legacy/Main Image) */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Main Image</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formData.imageUrl && (
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={formData.imageUrl}
                          alt="Menu item"
                          style={{
                            width: '100%',
                            maxWidth: 200,
                            height: 'auto',
                            borderRadius: 8,
                            border: '2px solid #e5e7eb',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{ maxWidth: 200 }}
                        >
                          {formData.imageUrl ? 'Change Main Image' : 'Upload Main Image'}
                        </Button>
                      </label>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab 3: Nutrition Info & Dietary Options */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 3 }}>
              <Grid container spacing={2}>
                {/* Nutrition Info */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Nutrition Information (per serving)</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Calories"
                    type="number"
                    value={formData.nutritionalInfo.calories}
                    onChange={(e) => handleInputChange('nutritionalInfo.calories', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Protein (g)"
                    type="number"
                    value={formData.nutritionalInfo.protein}
                    onChange={(e) => handleInputChange('nutritionalInfo.protein', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Carbs (g)"
                    type="number"
                    value={formData.nutritionalInfo.carbs}
                    onChange={(e) => handleInputChange('nutritionalInfo.carbs', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Fat (g)"
                    type="number"
                    value={formData.nutritionalInfo.fat}
                    onChange={(e) => handleInputChange('nutritionalInfo.fat', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Fiber (g)"
                    type="number"
                    value={formData.nutritionalInfo.fiber}
                    onChange={(e) => handleInputChange('nutritionalInfo.fiber', e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                {/* Dietary Options */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>Dietary Options</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isAvailable}
                          onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                        />
                      }
                      label="Available"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isVegetarian}
                          onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
                        />
                      }
                      label="Vegetarian"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isVegan}
                          onChange={(e) => handleInputChange('isVegan', e.target.checked)}
                        />
                      }
                      label="Vegan"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isGlutenFree}
                          onChange={(e) => handleInputChange('isGlutenFree', e.target.checked)}
                        />
                      }
                      label="Gluten-Free"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MenuManagement;
