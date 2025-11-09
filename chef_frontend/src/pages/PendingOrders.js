import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Visibility,
  PlayArrow,
  Person,
  RestaurantMenu
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import chefApi from '../services/api';
import { toast } from 'react-toastify';

const PendingOrders = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [acceptDialog, setAcceptDialog] = useState({
    open: false,
    order: null,
    assignToChef: '',
    loading: false
  });
  const [viewDialog, setViewDialog] = useState({
    open: false,
    order: null
  });
  const [chefs, setChefs] = useState([]);
  
  const { isChefManager } = useAuth();

  useEffect(() => {
    fetchOrders();
    if (isChefManager) {
      fetchChefs();
    }
  }, [page, rowsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await chefApi.orders.getPendingOrders({
        page: page + 1,
        limit: rowsPerPage
      });

      if (response.success) {
        setOrders(response.data.orders);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchChefs = async () => {
    try {
      const response = await chefApi.chef.getAllChefs({ limit: 50 });
      if (response.success) {
        setChefs(response.data.users.filter(user => user.role === 'chef' && user.isActive));
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
    }
  };

  const handleAcceptOrder = (order) => {
    setAcceptDialog({
      open: true,
      order,
      assignToChef: '',
      loading: false
    });
  };

  const handleAcceptConfirm = async () => {
    try {
      setAcceptDialog(prev => ({ ...prev, loading: true }));
      
      const data = {};
      if (isChefManager && acceptDialog.assignToChef) {
        data.assignToChef = acceptDialog.assignToChef;
      }

      const response = await chefApi.orders.acceptOrder(acceptDialog.order._id, data);
      
      if (response.success) {
        toast.success('Order accepted successfully');
        setAcceptDialog({ open: false, order: null, assignToChef: '', loading: false });
        fetchOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      setAcceptDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCloseDialog = () => {
    setAcceptDialog({ open: false, order: null, assignToChef: '', loading: false });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      default: return 'default';
    }
  };

  // Mobile Card Component
  const OrderCard = ({ order }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div">
            Order #{order.orderNumber}
          </Typography>
          <Chip
            label={order.status}
            color={getStatusColor(order.status)}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Customer: {order.userId?.name || 'Unknown'}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          Items: {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          {order.items.slice(0, 2).map(item => item.name).join(', ')}
          {order.items.length > 2 && ` +${order.items.length - 2} more`}
        </Typography>
        
        <Typography variant="h6" color="primary" gutterBottom>
          {formatCurrency(order.totalPrice)}
        </Typography>
        
        <Typography variant="caption" color="textSecondary">
          Ordered: {new Date(order.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => setViewDialog({ open: true, order })}
        >
          View Details
        </Button>
        {user?.role === 'chef_manager' && (
          <Button
            size="small"
            color="primary"
            startIcon={<PlayArrow />}
            onClick={() => setAcceptDialog({ open: true, order, assignToChef: '', loading: false })}
          >
            Accept
          </Button>
        )}
      </CardActions>
    </Card>
  );

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
        Pending Orders
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        {isChefManager 
          ? 'Review and assign pending orders to available chefs'
          : 'Accept orders that are ready for preparation'
        }
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Responsive Content */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {orders.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No pending orders found
              </Typography>
            </Paper>
          ) : (
            orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          )}
          
          {/* Mobile Pagination */}
          {total > rowsPerPage && (
            <Box display="flex" justifyContent="center" mt={2}>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      ) : (
        // Desktop Table View
        <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order Time</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No pending orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.userId?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.userId?.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.items.slice(0, 2).map(item => item.name).join(', ')}
                          {order.items.length > 2 && ` +${order.items.length - 2} more`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" color="primary">
                        {formatCurrency(order.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => setViewDialog({ open: true, order })}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Accept Order">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleAcceptOrder(order)}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
      )}

      {/* Accept Order Dialog */}
      <Dialog 
        open={acceptDialog.open} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Accept Order: {acceptDialog.order?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {acceptDialog.order && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Customer:</strong> {acceptDialog.order.userId?.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Items:</strong> {acceptDialog.order.items.length}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Total:</strong> {formatCurrency(acceptDialog.order.totalPrice)}
              </Typography>
              
              {acceptDialog.order.specialInstructions && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Special Instructions:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {acceptDialog.order.specialInstructions}
                  </Typography>
                </Box>
              )}

              {isChefManager && chefs.length > 0 && (
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel>Assign to Chef (Optional)</InputLabel>
                  <Select
                    value={acceptDialog.assignToChef}
                    onChange={(e) => setAcceptDialog(prev => ({ 
                      ...prev, 
                      assignToChef: e.target.value 
                    }))}
                    label="Assign to Chef (Optional)"
                  >
                    <MenuItem value="">Auto-assign to available chef</MenuItem>
                    {chefs.map((chef) => (
                      <MenuItem key={chef._id} value={chef._id}>
                        {chef.name} ({chef.activeTasks || 0} active tasks)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={acceptDialog.loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAcceptConfirm} 
            variant="contained"
            disabled={acceptDialog.loading}
            startIcon={acceptDialog.loading ? <CircularProgress size={16} /> : <PlayArrow />}
          >
            Accept Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, order: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order #{viewDialog.order?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {viewDialog.order && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body2">
                  Name: {viewDialog.order.userId?.name}<br />
                  Email: {viewDialog.order.userId?.email}<br />
                  Phone: {viewDialog.order.userId?.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Information
                </Typography>
                <Typography variant="body2">
                  Status: {viewDialog.order.status}<br />
                  Order Time: {new Date(viewDialog.order.createdAt).toLocaleString()}<br />
                  Total: {formatCurrency(viewDialog.order.totalPrice)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Items
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDialog.order.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, order: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingOrders;
