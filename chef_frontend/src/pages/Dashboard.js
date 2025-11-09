import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment,
  Timer,
  TrendingUp,
  Kitchen,
  PendingActions,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import chefApi from '../services/api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isChefManager } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const response = await chefApi.dashboard.getDashboardData();
      console.log('Dashboard API response:', response);

      if (response.success) {
        setStats(response.data);
        setRecentTasks(response.data.recentTasks || []);
        console.log('Dashboard data loaded successfully:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'in_progress': return 'primary';
      case 'ready': return 'success';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.name}
        </Typography>
        <Chip
          icon={<DashboardIcon />}
          label={`${isChefManager ? 'Chef Manager' : 'Chef'} Dashboard`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Active Tasks"
            value={stats?.overview?.totalTasks || 0}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="primary"
            subtitle="All kitchen tasks"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats?.statusBreakdown?.pending || 0}
            icon={<PendingActions sx={{ fontSize: 40 }} />}
            color="warning"
            subtitle="Awaiting assignment"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats?.statusBreakdown?.in_progress || 0}
            icon={<Timer sx={{ fontSize: 40 }} />}
            color="info"
            subtitle="Currently cooking"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Today"
            value={stats?.overview?.completedTasks || 0}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            color="success"
            subtitle={`${stats?.overview?.completionRate || 0}% completion rate`}
          />
        </Grid>
      </Grid>

      {/* Priority Breakdown for Chef Manager */}
      {isChefManager && stats?.activePriorityBreakdown && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Urgent Tasks"
              value={stats.activePriorityBreakdown.urgent || 0}
              icon={<Warning sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="High Priority"
              value={stats.activePriorityBreakdown.high || 0}
              icon={<TrendingUp sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Normal Priority"
              value={stats.activePriorityBreakdown.normal || 0}
              icon={<Kitchen sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Low Priority"
              value={stats.activePriorityBreakdown.low || 0}
              icon={<Assignment sx={{ fontSize: 40 }} />}
              color="default"
            />
          </Grid>
        </Grid>
      )}

      {/* Recent Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {isChefManager ? 'Recent Kitchen Tasks' : 'My Active Tasks'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/kitchen')}
              >
                View All
              </Button>
            </Box>
            
            {recentTasks.length === 0 ? (
              <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                No active tasks at the moment
              </Typography>
            ) : (
              <List>
                {recentTasks.map((task, index) => (
                  <React.Fragment key={task._id}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => navigate(`/kitchen/${task._id}`)}
                    >
                      <ListItemIcon>
                        <Kitchen />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {task.orderNumber}
                            </Typography>
                            <Chip
                              label={task.status}
                              size="small"
                              color={getStatusColor(task.status)}
                            />
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Customer: {task.customerName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Items: {task.items?.length || 0} | 
                              Chef: {task.assignedChef?.name || 'Unassigned'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Quick Actions</Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<PendingActions />}
                onClick={() => navigate('/orders/pending')}
                fullWidth
              >
                View Pending Orders
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Kitchen />}
                onClick={() => navigate('/kitchen')}
                fullWidth
              >
                Kitchen Tasks
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                onClick={() => navigate('/orders/assigned')}
                fullWidth
              >
                My Orders
              </Button>
              
              {isChefManager && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/reports')}
                    fullWidth
                  >
                    View Reports
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Kitchen />}
                    onClick={() => navigate('/users')}
                    fullWidth
                  >
                    Manage Chefs
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
