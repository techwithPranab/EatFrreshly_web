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
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
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
    image: '',
    images: [],
    ingredients: '',
    nutritionInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  });

  const categories = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Salads',
    'Soups',
    'Vegetarian',
    'Vegan',
    'Gluten-Free'
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
      setMenuItems(response.data || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch menu items');
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
        image: item.image || '',
        images: item.images || [],
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients || '',
        nutritionInfo: {
          calories: item.nutritionInfo?.calories !== undefined ? item.nutritionInfo.calories.toString() : '',
          protein: item.nutritionInfo?.protein !== undefined ? item.nutritionInfo.protein.toString() : '',
          carbs: item.nutritionInfo?.carbs !== undefined ? item.nutritionInfo.carbs.toString() : '',
          fat: item.nutritionInfo?.fat !== undefined ? item.nutritionInfo.fat.toString() : ''
        },
        isAvailable: item.isAvailable !== false,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: '',
        image: '',
        images: [],
        ingredients: '',
        nutritionInfo: {
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        },
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false
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
        image: formData.image || (formData.images.length > 0 ? formData.images[0].url : ''),
        images: formData.images,
        nutritionInfo: {
          calories: formData.nutritionInfo.calories ? parseInt(formData.nutritionInfo.calories) : undefined,
          protein: formData.nutritionInfo.protein || undefined,
          carbs: formData.nutritionInfo.carbs || undefined,
          fat: formData.nutritionInfo.fat || undefined
        }
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
      await api.patch(`/admin/menu/${id}/availability`, {
        isAvailable: !currentStatus
      });
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
        handleInputChange('image', response.data.url);
      }
    } catch (error) {
      setError('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell>Dietary</TableCell>
              <TableCell align="right">Calories</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell style={{ verticalAlign: 'top', width: '30%' }}>
                  <Box display="flex" alignItems="flex-start">
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }} />
                    )}
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word', width: '100%' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">₹{item.price}</TableCell>
                <TableCell>
                  {item.isVegetarian && <Chip label="Vegetarian" size="small" color="success" sx={{ mr: 0.5 }} />}
                  {item.isVegan && <Chip label="Vegan" size="small" color="success" sx={{ mr: 0.5 }} />}
                  {item.isGlutenFree && <Chip label="Gluten-Free" size="small" color="info" />}
                </TableCell>
                <TableCell align="right">{item.nutritionInfo?.calories || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={item.isAvailable ? 'Available' : 'Unavailable'}
                    color={item.isAvailable ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    size="small"
                    onClick={() => toggleAvailability(item._id, item.isAvailable)}
                    color={item.isAvailable ? "error" : "success"}
                  >
                    {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
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
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Discounted Price"
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ingredients (comma separated)"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab 2: Images */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 2 }}>
              <Grid container spacing={3}>
                {/* Multiple Image Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Menu Images Gallery</Typography>
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
                  <Typography variant="h6" sx={{ mb: 2 }}>Main Image (Legacy)</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formData.image && (
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={formData.image}
                          alt="Menu item"
                          style={{
                            width: '100%',
                            maxWidth: 300,
                            height: 'auto',
                            borderRadius: 4,
                            border: '1px solid #ddd'
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
                          sx={{ maxWidth: 300 }}
                        >
                          {formData.image ? 'Change Main Image' : 'Upload Main Image'}
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
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 2 }}>
              <Grid container spacing={2}>
                {/* Nutrition Info */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Nutrition Information</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Calories"
                    type="number"
                    value={formData.nutritionInfo.calories}
                    onChange={(e) => handleInputChange('nutritionInfo.calories', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Protein (g)"
                    value={formData.nutritionInfo.protein}
                    onChange={(e) => handleInputChange('nutritionInfo.protein', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Carbs (g)"
                    value={formData.nutritionInfo.carbs}
                    onChange={(e) => handleInputChange('nutritionInfo.carbs', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Fat (g)"
                    value={formData.nutritionInfo.fat}
                    onChange={(e) => handleInputChange('nutritionInfo.fat', e.target.value)}
                  />
                </Grid>

                {/* Dietary Options */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Dietary Options</Typography>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MenuManagement;
