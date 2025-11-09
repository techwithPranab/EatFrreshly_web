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
  CardActions,
  useMediaQuery,
  useTheme,
  Stack,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  CheckCircle,
  Timer,
  Assignment,
  Kitchen,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import chefApi from '../services/api';
import { toast } from 'react-toastify';

const KitchenTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0
  });
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await chefApi.kitchen.getKitchenTasks();
      if (response.success) {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching kitchen tasks:', error);
      toast.error('Failed to load kitchen tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await chefApi.kitchen.getKitchenStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching kitchen stats:', error);
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      const response = await chefApi.kitchen.updateTaskStatus(taskId, {
        status: 'in_progress',
        chefId: user._id
      });
      if (response.success) {
        toast.success('Task started successfully');
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await chefApi.kitchen.updateTaskStatus(taskId, {
        status: 'completed',
        completedAt: new Date()
      });
      if (response.success) {
        toast.success('Task completed successfully');
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleUpdateTask = async () => {
    try {
      const response = await chefApi.kitchen.updateTaskStatus(selectedTask._id, {
        status: newStatus,
        notes: notes
      });
      if (response.success) {
        toast.success('Task updated successfully');
        setUpdateDialogOpen(false);
        setSelectedTask(null);
        setNewStatus('');
        setNotes('');
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
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
            <Typography variant={isMobile ? "h5" : "h4"} component="div" color={`${color}.main`}>
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

  // Task Card Component for Mobile
  const TaskCard = ({ task }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h6" component="div">
            Task #{task._id.slice(-6)}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={task.priority || 'normal'}
              color={getPriorityColor(task.priority)}
              size="small"
            />
            <Chip
              label={task.status}
              color={getStatusColor(task.status)}
              size="small"
            />
          </Stack>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Order Items:</strong>
        </Typography>
        {task.orderItems?.map((item, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 1 }}>
            • {item.menuItem?.name} x{item.quantity}
          </Typography>
        ))}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Assigned Chef:</strong> {task.assignedChef?.name || 'Unassigned'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Box display="flex" gap={1} flexWrap="wrap">
          {task.status === 'assigned' && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => handleStartTask(task._id)}
            >
              Start
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleCompleteTask(task._id)}
            >
              Complete
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<Assignment />}
            onClick={() => {
              setSelectedTask(task);
              setNewStatus(task.status);
              setNotes(task.notes || '');
              setUpdateDialogOpen(true);
            }}
          >
            Update
          </Button>
        </Box>
      </CardActions>
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Kitchen Tasks
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchTasks();
            fetchStats();
          }}
          size={isMobile ? "small" : "medium"}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.statusBreakdown?.pending || 0}
            icon={<Timer sx={{ fontSize: isMobile ? 30 : 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.statusBreakdown?.in_progress || 0}
            icon={<Assignment sx={{ fontSize: isMobile ? 30 : 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.statusBreakdown?.completed || 0}
            icon={<CheckCircle sx={{ fontSize: isMobile ? 30 : 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total"
            value={stats.overview?.totalTasks || 0}
            icon={<Kitchen sx={{ fontSize: isMobile ? 30 : 40 }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Tasks Display - Responsive */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {tasks.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No kitchen tasks found
              </Typography>
            </Paper>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))
          )}
        </Box>
      ) : (
        // Desktop Table View
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task ID</TableCell>
                  <TableCell>Order Items</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Chef</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No kitchen tasks found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>#{task._id.slice(-6)}</TableCell>
                      <TableCell>
                        {task.orderItems?.map((item, index) => (
                          <Typography key={index} variant="body2">
                            {item.menuItem?.name} x{item.quantity}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority || 'normal'}
                          color={getPriorityColor(task.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {task.assignedChef?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {task.status === 'assigned' && (
                            <Tooltip title="Start Task">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleStartTask(task._id)}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                          )}
                          {task.status === 'in_progress' && (
                            <Tooltip title="Complete Task">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleCompleteTask(task._id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Update Task">
                            <IconButton
                              color="default"
                              size="small"
                              onClick={() => {
                                setSelectedTask(task);
                                setNewStatus(task.status);
                                setNotes(task.notes || '');
                                setUpdateDialogOpen(true);
                              }}
                            >
                              <Assignment />
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
      )}

      {/* Update Task Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Task</DialogTitle>
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
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
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
              placeholder="Add any notes about the task..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KitchenTasks;
