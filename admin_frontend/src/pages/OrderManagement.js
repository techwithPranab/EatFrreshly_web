import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Alert,
  Box,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle,
  Schedule,
  LocalShipping,
  Cancel,
  TrendingUp,
  Timer,
  AttachMoney,
} from '@mui/icons-material';
import api from '../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      console.log('Fetched orders:', response.data);
      setOrders(response.data.data.orders || []); // Ensure orders is always an array
      //setOrders(Array.isArray(response.data.orders) ? response.data : response.data.orders || []);
      console.log('Orders state updated:', orders);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/admin/orders/${orderId}`);
        setSuccess('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        setError('Failed to delete order');
      }
    }
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/admin/orders/${selectedOrder._id}`, { status: newStatus });
      setSuccess('Order status updated successfully');
      handleCloseDialog();
      fetchOrders();
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle />;
      case 'pending':
      case 'processing':
        return <Schedule />;
      case 'shipped':
        return <LocalShipping />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Stat Card Component
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
            📦 Order Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track customer orders
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={<TrendingUp />}
            color="#3B82F6"
            change="All time orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={orders.filter(o => o.status === 'completed' || o.status === 'delivered').length}
            icon={<CheckCircle />}
            color="#10B981"
            change={`${((orders.filter(o => o.status === 'completed' || o.status === 'delivered').length / Math.max(orders.length, 1)) * 100).toFixed(0)}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
            icon={<Schedule />}
            color="#F59E0B"
            change="In progress"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cancelled"
            value={orders.filter(o => o.status === 'cancelled').length}
            icon={<Cancel />}
            color="#EF4444"
            change={`${((orders.filter(o => o.status === 'cancelled').length / Math.max(orders.length, 1)) * 100).toFixed(1)}%`}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="order tabs"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="📋 All Orders" id="order-tab-0" aria-controls="order-tabpanel-0" />
        <Tab label="⏳ Pending" id="order-tab-1" aria-controls="order-tabpanel-1" />
        <Tab label="✅ Completed" id="order-tab-2" aria-controls="order-tabpanel-2" />
        <Tab label="🚚 Shipped" id="order-tab-3" aria-controls="order-tabpanel-3" />
      </Tabs>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
              <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tabValue === 0
              ? orders
              : tabValue === 1
              ? orders.filter(o => o.status === 'pending' || o.status === 'processing')
              : tabValue === 2
              ? orders.filter(o => o.status === 'completed' || o.status === 'delivered')
              : orders.filter(o => o.status === 'shipped')
            ).map((order) => (
              <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#3B82F6' }}>
                    #{order.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.userId?.name || order.customerName || '-'}</Typography>
                  {order.userId?.email && (
                    <Typography variant="caption" color="text.secondary">{order.userId.email}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                    ₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(order)}
                      sx={{ color: '#3B82F6', '&:hover': { backgroundColor: '#e0e7ff' } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ color: '#6B7280', '&:hover': { backgroundColor: '#f3f4f6' } }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(order._id)}
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

      {/* Update Status Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          📝 Update Order Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Order #{selectedOrder?.orderNumber}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedOrder?.userId?.name || selectedOrder?.customerName}
            </Typography>

            {/* Order Summary */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Items</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedOrder?.items?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{(selectedOrder?.totalPrice || 0).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Order Status"
              >
                <MenuItem value="pending">⏳ Pending</MenuItem>
                <MenuItem value="processing">⏸️ Processing</MenuItem>
                <MenuItem value="shipped">🚚 Shipped</MenuItem>
                <MenuItem value="delivered">✅ Delivered</MenuItem>
                <MenuItem value="cancelled">❌ Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;
