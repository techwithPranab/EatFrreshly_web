import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  LocalOffer as OfferIcon,
  TrendingUp,
  CheckCircle,
  Schedule,
  Lock,
} from '@mui/icons-material';
import api from '../services/api';

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    code: '',
    startDate: '',
    endDate: '',
    minimumOrderValue: '',
    maxUses: '',
    currentUses: 0,
    isActive: true,
    applicableItems: [],
    applicableCategories: []
  });

  const promotionTypes = [
    { value: 'percentage', label: 'Percentage Discount', icon: '📊' },
    { value: 'fixed', label: 'Fixed Amount Discount', icon: '💵' },
    { value: 'bogo', label: 'Buy One Get One', icon: '🎁' },
    { value: 'freeShipping', label: 'Free Shipping', icon: '🚚' }
  ];

  const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages', 'Salads', 'Soups'];

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/admin/promotions');
      setPromotions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch promotions');
      setLoading(false);
    }
  };

  const handleOpenDialog = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        name: promotion.name ?? '',
        description: promotion.description ?? '',
        type: promotion.type ?? 'percentage',
        value: (promotion.value !== undefined && promotion.value !== null) ? promotion.value.toString() : '',
        code: promotion.code ?? '',
        startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
        endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
        minimumOrderValue: (promotion.minimumOrderValue !== undefined && promotion.minimumOrderValue !== null) ? promotion.minimumOrderValue.toString() : '',
        maxUses: (promotion.maxUses !== undefined && promotion.maxUses !== null) ? promotion.maxUses.toString() : '',
        currentUses: promotion.currentUses ?? 0,
        isActive: promotion.isActive !== false,
        applicableItems: Array.isArray(promotion.applicableItems) ? promotion.applicableItems : [],
        applicableCategories: Array.isArray(promotion.applicableCategories) ? promotion.applicableCategories : []
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        code: '',
        startDate: '',
        endDate: '',
        minimumOrderValue: '',
        maxUses: '',
        currentUses: 0,
        isActive: true,
        applicableItems: [],
        applicableCategories: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPromotion(null);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePromoCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    handleInputChange('code', code);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        minimumOrderValue: formData.minimumOrderValue ? parseFloat(formData.minimumOrderValue) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      if (editingPromotion) {
        await api.put(`/admin/promotions/${editingPromotion._id}`, submitData);
        setSuccess('Promotion updated successfully');
      } else {
        await api.post('/admin/promotions', submitData);
        setSuccess('Promotion created successfully');
      }

      handleCloseDialog();
      fetchPromotions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save promotion');
    }
  };

  const handleDelete = async (promotionId) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await api.delete(`/admin/promotions/${promotionId}`);
        setSuccess('Promotion deleted successfully');
        fetchPromotions();
      } catch (error) {
        setError('Failed to delete promotion');
      }
    }
  };

  const togglePromotionStatus = async (promotionId, currentStatus) => {
    try {
      await api.patch(`/admin/promotions/${promotionId}/status`, { isActive: !currentStatus });
      setSuccess(`Promotion ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPromotions();
    } catch (error) {
      setError('Failed to update promotion status');
    }
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess('Promo code copied to clipboard');
  };

  const getStatusColor = (promotion) => {
    if (!promotion.isActive) return 'error';
    
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (now < startDate) return 'warning';
    if (now > endDate) return 'error';
    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) return 'error';
    
    return 'success';
  };

  const getStatusLabel = (promotion) => {
    if (!promotion.isActive) return 'Inactive';
    
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) return 'Limit Reached';
    
    return 'Active';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscount = (type, value) => {
    switch (type) {
      case 'percentage':
        return `${value}% off`;
      case 'fixed':
        return `₹${value} off`;
      case 'bogo':
        return 'Buy One Get One';
      case 'freeShipping':
        return 'Free Shipping';
      default:
        return value;
    }
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon, color, subtext }) => (
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
            {subtext && (
              <Typography variant="caption" color="text.secondary">
                {subtext}
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
            🎉 Promotions Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage restaurant promotions and discount codes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none', px: 3 }}
        >
          Create Promotion
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Promotions Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Promotions"
            value={promotions.length}
            icon={<OfferIcon />}
            color="#3B82F6"
            subtext="All promotions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Promotions"
            value={promotions.filter(p => p.isActive && getStatusLabel(p) === 'Active').length}
            icon={<CheckCircle />}
            color="#10B981"
            subtext="Currently running"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scheduled"
            value={promotions.filter(p => getStatusLabel(p) === 'Scheduled').length}
            icon={<Schedule />}
            color="#F59E0B"
            subtext="Coming soon"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Uses"
            value={promotions.reduce((sum, p) => sum + (p.currentUses || 0), 0)}
            icon={<TrendingUp />}
            color="#8B5CF6"
            subtext="Across all promotions"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="promotions tabs"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="📋 All Promotions" id="promo-tab-0" aria-controls="promo-tabpanel-0" />
        <Tab label="✅ Active" id="promo-tab-1" aria-controls="promo-tabpanel-1" />
        <Tab label="🔔 Scheduled" id="promo-tab-2" aria-controls="promo-tabpanel-2" />
      </Tabs>

      {/* Promotions Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
              <TableCell sx={{ fontWeight: 600 }}>Promotion</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Discount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Valid Period</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tabValue === 0
              ? promotions
              : tabValue === 1
              ? promotions.filter(p => p.isActive && getStatusLabel(p) === 'Active')
              : promotions.filter(p => getStatusLabel(p) === 'Scheduled')
            ).map((promotion) => (
              <TableRow key={promotion._id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {promotion.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {promotion.description?.substring(0, 40)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: '#e0e7ff',
                        color: '#3B82F6',
                        padding: '4px 8px',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {promotion.code}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => copyPromoCode(promotion.code)}
                      sx={{ '&:hover': { backgroundColor: '#f0f0f0' } }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={promotionTypes.find(t => t.value === promotion.type)?.label || 'Unknown'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDiscount(promotion.type, promotion.value)}
                  </Typography>
                  {promotion.minimumOrderValue && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Min: ${promotion.minimumOrderValue}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {promotion.currentUses || 0}
                      {promotion.maxUses && ` / ${promotion.maxUses}`}
                    </Typography>
                    {promotion.maxUses && (
                      <LinearProgress
                        variant="determinate"
                        value={(promotion.currentUses / promotion.maxUses) * 100}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'No start'}
                    <br />
                    {promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'No end'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={
                      getStatusLabel(promotion) === 'Active' ? <CheckCircle /> :
                      getStatusLabel(promotion) === 'Scheduled' ? <Schedule /> :
                      <Lock />
                    }
                    label={getStatusLabel(promotion)}
                    color={
                      getStatusColor(promotion) === 'success' ? 'success' :
                      getStatusColor(promotion) === 'warning' ? 'warning' :
                      'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(promotion)}
                      sx={{ color: '#3B82F6', '&:hover': { backgroundColor: '#e0e7ff' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => togglePromotionStatus(promotion._id, promotion.isActive)}
                      color={promotion.isActive ? 'error' : 'success'}
                      sx={{ '&:hover': { backgroundColor: '#fee2e2' } }}
                    >
                      {promotion.isActive ? <VisibilityOffIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(promotion._id)}
                      color="error"
                      sx={{ '&:hover': { backgroundColor: '#fee2e2' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          {editingPromotion ? '✏️ Edit Promotion' : '➕ Create New Promotion'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Promotion Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Summer Special"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Discount Type"
                >
                  {promotionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
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
                rows={2}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your promotion..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Value"
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                helperText={formData.type === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount in dollars'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Promo Code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                />
                <Button
                  onClick={generatePromoCode}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Generate
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Order Value"
                type="number"
                value={formData.minimumOrderValue}
                onChange={(e) => handleInputChange('minimumOrderValue', e.target.value)}
                helperText="Leave empty for no minimum"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Uses"
                type="number"
                value={formData.maxUses}
                onChange={(e) => handleInputChange('maxUses', e.target.value)}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPromotion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PromotionsManagement;
