import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Collapse,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Timer,
  Assignment,
  Refresh,
  Visibility,
  Edit
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import chefApi from '../services/api';
import { toast } from 'react-toastify';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchMyOrders();
    fetchStats();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await chefApi.orders.getAssignedOrders({ chefId: user._id });
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      toast.error('Failed to load assigned orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await chefApi.chef.getChefStats(user._id);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching chef stats:', error);
    }
  };

  const handleUpdateOrderStatus = async () => {
    try {
      const response = await chefApi.orders.updateOrderStatus(selectedOrder._id, {
        status: newStatus,
        notes: notes
      });
      if (response.success) {
        toast.success('Order status updated successfully');
        setUpdateDialogOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
        setNotes('');
        fetchMyOrders();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleRowExpand = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          My Assigned Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchMyOrders();
            fetchStats();
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned"
            value={stats.assigned || 0}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress || 0}
            icon={<Timer sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed || 0}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.total || 0}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Expand</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Assigned At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No assigned orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRowExpand(order._id)}
                        >
                          {expandedRows[order._id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>#{order._id.slice(-6)}</TableCell>
                      <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                      <TableCell>{order.items?.length || 0} items</TableCell>
                      <TableCell>
                        <Chip
                          label={order.priority || 'normal'}
                          color={getPriorityColor(order.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>₹{order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        {order.assignedAt ? new Date(order.assignedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => {
                                setSelectedOrder(order);
                                setDetailsDialogOpen(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton
                              color="default"
                              size="small"
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                                setNotes(order.notes || '');
                                setUpdateDialogOpen(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={expandedRows[order._id]} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                              Order Items
                            </Typography>
                            <List dense>
                              {order.items?.map((item, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={`${item.menuItem?.name || 'Unknown Item'} x${item.quantity}`}
                                    secondary={`₹${(item.price * item.quantity).toFixed(2)} - ${item.specialInstructions || 'No special instructions'}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Order ID:</strong> #{selectedOrder._id.slice(-6)}</Typography>
                  <Typography><strong>Customer:</strong> {selectedOrder.customer?.name}</Typography>
                  <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
                  <Typography><strong>Total:</strong> ₹{selectedOrder.totalPrice?.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                  <Typography><strong>Assigned:</strong> {selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleString() : 'N/A'}</Typography>
                  <Typography><strong>Priority:</strong> {selectedOrder.priority || 'normal'}</Typography>
                </Grid>
              </Grid>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Items:</Typography>
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${item.menuItem?.name} x${item.quantity}`}
                      secondary={`₹${(item.price * item.quantity).toFixed(2)} - ${item.specialInstructions || 'No special instructions'}`}
                    />
                  </ListItem>
                ))}
              </List>
              {selectedOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">Notes:</Typography>
                  <Typography>{selectedOrder.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Order Status Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the order..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateOrderStatus} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyOrders;
