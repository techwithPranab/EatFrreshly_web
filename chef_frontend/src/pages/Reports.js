import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Timer,
  People,
  Kitchen,
  Assignment,
  CheckCircle,
  Warning,
  Download
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import chefApi from '../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('kitchen_performance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date()
  });
  const [reportData, setReportData] = useState(null);
  const [chefPerformance, setChefPerformance] = useState([]);
  const [kitchenStats, setKitchenStats] = useState({});
  const { user, isChefManager } = useAuth();

  useEffect(() => {
    if (!isChefManager) {
      toast.error('Access denied. Chef Manager role required.');
      return;
    }
    fetchReportData();
  }, [reportType, dateRange, isChefManager]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        reportType,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      };

      const response = await chefApi.reports.getKitchenReport(params);
      if (response.success) {
        setReportData(response.data);
        setChefPerformance((response.data.chefPerformance || []).map(chef => ({
          _id: chef._id,
          name: chef.name,
          ordersCompleted: chef.completedTasks || 0,
          avgPrepTime: Math.round(chef.avgPreparationTime || 0),
          efficiencyRating: chef.completionRate || 0,
          isActive: true // This would need to be fetched separately
        })));
        
        // Map backend overview data to frontend expected format
        const overview = response.data.overview || {};
        setKitchenStats({
          totalOrders: overview.totalTasks || 0,
          completedOrders: overview.completedTasks || 0,
          avgPrepTime: Math.round(overview.avgPreparationTime || 0),
          activeChefs: 0, // This would need to be calculated separately
          completionRate: overview.completionRate || 0,
          onTimeRate: 0, // This would need to be calculated
          peakHourEfficiency: 0, // This would need to be calculated
          qualityScore: 0, // This would need to be calculated
          totalRevenue: 0, // This would need to be calculated
          avgOrderValue: 0, // This would need to be calculated
          popularItem: 'N/A' // This would need to be calculated
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const params = {
        reportType,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        format: 'excel'
      };
      
      const response = await chefApi.reports.exportReport(params);
      if (response.success) {
        // Handle file download
        toast.success('Report exported successfully');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

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

  if (!isChefManager) {
    return (
      <Box>
        <Alert severity="error">
          Access denied. Chef Manager role required to view reports.
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
            Kitchen Reports
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </Box>

        {/* Report Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="kitchen_performance">Kitchen Performance</MenuItem>
                  <MenuItem value="chef_performance">Chef Performance</MenuItem>
                  <MenuItem value="order_analytics">Order Analytics</MenuItem>
                  <MenuItem value="efficiency_report">Efficiency Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={fetchReportData}
                startIcon={<Assessment />}
              >
                Generate
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Kitchen Stats Overview */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={kitchenStats.totalOrders || 0}
              icon={<Assignment sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Orders"
              value={kitchenStats.completedOrders || 0}
              icon={<CheckCircle sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Prep Time"
              value={`${kitchenStats.avgPrepTime || 0} min`}
              icon={<Timer sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Chefs"
              value={kitchenStats.activeChefs || 0}
              icon={<People sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Chef Performance Table */}
        {reportType === 'chef_performance' && (
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Chef Performance</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Chef Name</TableCell>
                    <TableCell>Orders Completed</TableCell>
                    <TableCell>Avg Prep Time</TableCell>
                    <TableCell>Efficiency Rating</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chefPerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body1" color="textSecondary">
                          No chef performance data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    chefPerformance.map((chef) => (
                      <TableRow key={chef._id}>
                        <TableCell>{chef.name}</TableCell>
                        <TableCell>{chef.ordersCompleted || 0}</TableCell>
                        <TableCell>{chef.avgPrepTime || 0} min</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography>{chef.efficiencyRating || 0}%</Typography>
                            {chef.efficiencyRating >= 90 && (
                              <CheckCircle color="success" sx={{ ml: 1 }} />
                            )}
                            {chef.efficiencyRating < 70 && (
                              <Warning color="warning" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={chef.isActive ? 'Active' : 'Inactive'}
                            color={chef.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Kitchen Performance Metrics */}
        {reportType === 'kitchen_performance' && (
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Kitchen Performance Metrics</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Order Completion Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {kitchenStats.completionRate || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    On-Time Delivery Rate
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {kitchenStats.onTimeRate || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Peak Hour Performance
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {kitchenStats.peakHourEfficiency || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Quality Score
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {kitchenStats.qualityScore || 0}/10
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Order Analytics */}
        {reportType === 'order_analytics' && (
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Order Analytics</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ₹{kitchenStats.totalRevenue || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Average Order Value
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    ₹{kitchenStats.avgOrderValue || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Most Popular Item
                  </Typography>
                  <Typography variant="h6" color="text.primary">
                    {kitchenStats.popularItem || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Box>
    );
  };

  export default Reports;
