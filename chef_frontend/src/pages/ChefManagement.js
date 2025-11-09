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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  People,
  PersonAdd,
  Block,
  CheckCircle,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import chefApi from '../services/api';
import { toast } from 'react-toastify';

const ChefManagement = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chefStats, setChefStats] = useState({
    totalChefs: 0,
    activeChefs: 0,
    inactiveChefs: 0,
    averageRating: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'chef',
    isActive: true,
    specialties: '',
    experience: ''
  });
  const { user, isChefManager } = useAuth();

  useEffect(() => {
    if (!isChefManager) {
      toast.error('Access denied. Chef Manager role required.');
      return;
    }
    fetchChefs();
    fetchChefStats();
  }, [isChefManager]);

  const fetchChefs = async () => {
    try {
      setLoading(true);
      const response = await chefApi.chef.getAllChefs();
      if (response.success) {
        setChefs(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
      toast.error('Failed to load chefs');
    } finally {
      setLoading(false);
    }
  };

  const fetchChefStats = async () => {
    try {
      const response = await chefApi.chef.getChefStats();
      if (response.success) {
        // Map backend response to frontend expected format
        setChefStats({
          totalChefs: response.data.overview.totalChefs || 0,
          activeChefs: response.data.overview.activeChefs || 0,
          inactiveChefs: response.data.overview.inactiveChefs || 0,
          averageRating: 0 // Not provided by backend, set to 0
        });
      }
    } catch (error) {
      console.error('Error fetching chef stats:', error);
    }
  };

  const handleAddChef = async () => {
    try {
      const response = await chefApi.chef.createChef(formData);
      if (response.success) {
        toast.success('Chef added successfully');
        setAddDialogOpen(false);
        resetForm();
        fetchChefs();
        fetchChefStats();
      }
    } catch (error) {
      console.error('Error adding chef:', error);
      toast.error('Failed to add chef');
    }
  };

  const handleUpdateChef = async () => {
    try {
      const response = await chefApi.chef.updateChef(selectedChef._id, formData);
      if (response.success) {
        toast.success('Chef updated successfully');
        setEditDialogOpen(false);
        setSelectedChef(null);
        resetForm();
        fetchChefs();
        fetchChefStats();
      }
    } catch (error) {
      console.error('Error updating chef:', error);
      toast.error('Failed to update chef');
    }
  };

  const handleDeleteChef = async () => {
    try {
      const response = await chefApi.chef.deleteChef(selectedChef._id);
      if (response.success) {
        toast.success('Chef deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedChef(null);
        fetchChefs();
        fetchChefStats();
      }
    } catch (error) {
      console.error('Error deleting chef:', error);
      toast.error('Failed to delete chef');
    }
  };

  const handleToggleChefStatus = async (chefId, currentStatus) => {
    try {
      const response = await chefApi.chef.updateChef(chefId, {
        isActive: !currentStatus
      });
      if (response.success) {
        toast.success(`Chef ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchChefs();
        fetchChefStats();
      }
    } catch (error) {
      console.error('Error toggling chef status:', error);
      toast.error('Failed to update chef status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'chef',
      isActive: true,
      specialties: '',
      experience: ''
    });
  };

  const openEditDialog = (chef) => {
    setSelectedChef(chef);
    setFormData({
      name: chef.name,
      email: chef.email,
      phone: chef.phone || '',
      role: chef.role,
      isActive: chef.isActive,
      specialties: chef.specialties || '',
      experience: chef.experience || ''
    });
    setEditDialogOpen(true);
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

  if (!isChefManager) {
    return (
      <Box>
        <Alert severity="error">
          Access denied. Chef Manager role required to manage chefs.
        </Alert>
      </Box>
    );
  }

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
          Chef Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchChefs();
              fetchChefStats();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              resetForm();
              setAddDialogOpen(true);
            }}
          >
            Add Chef
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Chefs"
            value={chefStats.totalChefs || 0}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Chefs"
            value={chefStats.activeChefs || 0}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Chefs"
            value={chefStats.inactiveChefs || 0}
            icon={<Block sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={chefStats.averageRating || 0}
            icon={<PersonAdd sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Specialties</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chefs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No chefs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                chefs.map((chef) => (
                  <TableRow key={chef._id}>
                    <TableCell>{chef.name}</TableCell>
                    <TableCell>{chef.email}</TableCell>
                    <TableCell>{chef.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={chef.role}
                        color={chef.role === 'chef_manager' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={chef.isActive ? 'Active' : 'Inactive'}
                        color={chef.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{chef.specialties || 'N/A'}</TableCell>
                    <TableCell>{chef.experience || 'N/A'}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedChef(chef);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Chef">
                          <IconButton
                            color="default"
                            size="small"
                            onClick={() => openEditDialog(chef)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={chef.isActive ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            color={chef.isActive ? 'warning' : 'success'}
                            size="small"
                            onClick={() => handleToggleChefStatus(chef._id, chef.isActive)}
                          >
                            {chef.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Chef">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              setSelectedChef(chef);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Delete />
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
      </Paper>

      {/* Add Chef Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Chef</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="chef">Chef</MenuItem>
                <MenuItem value="chef_manager">Chef Manager</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Specialties"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              placeholder="e.g., Italian cuisine, Pastry, Grill"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 5 years in fine dining"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddChef} variant="contained">
            Add Chef
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Chef Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Chef</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="chef">Chef</MenuItem>
                <MenuItem value="chef_manager">Chef Manager</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Specialties"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              placeholder="e.g., Italian cuisine, Pastry, Grill"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 5 years in fine dining"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateChef} variant="contained">
            Update Chef
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chef Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chef Details</DialogTitle>
        <DialogContent>
          {selectedChef && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Name:</strong> {selectedChef.name}</Typography>
                  <Typography><strong>Email:</strong> {selectedChef.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedChef.phone || 'N/A'}</Typography>
                  <Typography><strong>Role:</strong> {selectedChef.role}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Status:</strong> {selectedChef.isActive ? 'Active' : 'Inactive'}</Typography>
                  <Typography><strong>Specialties:</strong> {selectedChef.specialties || 'N/A'}</Typography>
                  <Typography><strong>Experience:</strong> {selectedChef.experience || 'N/A'}</Typography>
                  <Typography><strong>Created:</strong> {new Date(selectedChef.createdAt).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete chef "{selectedChef?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteChef} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChefManagement;
