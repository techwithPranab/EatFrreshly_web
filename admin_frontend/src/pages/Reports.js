import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
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
  Paper,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Download as DownloadIcon,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  LocalFireDepartment,
  AccessTime,
  Star,
} from '@mui/icons-material';
import api from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [timeRange, setTimeRange] = useState('30');
  const [tabValue, setTabValue] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [revenueStats, setRevenueStats] = useState({});

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setReportType(['sales', 'customers', 'menu', 'operational'][newValue]);
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, timeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [salesResponse, topItemsResponse, userGrowthResponse, categoryResponse, orderStatsResponse] = 
        await Promise.all([
          api.get(`/admin/reports/sales?timeRange=${timeRange}`),
          api.get(`/admin/reports/top-items?timeRange=${timeRange}`),
          api.get(`/admin/reports/user-growth?timeRange=${timeRange}`),
          api.get(`/admin/reports/category-performance?timeRange=${timeRange}`),
          api.get(`/admin/reports/order-stats?timeRange=${timeRange}`)
        ]);

      setSalesData(salesResponse.data.dailySales || []);
      setTopItems(topItemsResponse.data.topItems || []);
      setUserGrowth(userGrowthResponse.data.userGrowth || []);
      setCategoryPerformance(categoryResponse.data.categoryPerformance || []);
      setOrderStats(orderStatsResponse.data.orderStats || {});
      setRevenueStats(salesResponse.data.revenueStats || {});
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch report data');
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await api.get(`/admin/reports/export?type=${reportType}&timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${timeRange}days.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Failed to export report');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Enhanced Metric Card Component
  const MetricCard = ({ title, value, icon, color, change, changeType, subtext }) => (
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
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {changeType === 'up' ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: changeType === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {changeType === 'up' ? '+' : '-'}{Math.abs(change)}%
                </Typography>
              </Box>
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

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            📊 Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive restaurant performance analysis and insights
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportReport}
          sx={{ textTransform: 'none', px: 3 }}
        >
          Export Report
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(revenueStats.total || 0)}
            icon={<AttachMoney />}
            color="#3B82F6"
            change={getPercentageChange(revenueStats.total, revenueStats.previous)}
            changeType={getPercentageChange(revenueStats.total, revenueStats.previous) >= 0 ? 'up' : 'down'}
            subtext={`vs previous ${timeRange} days`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={orderStats.totalOrders || 0}
            icon={<ShoppingCart />}
            color="#10B981"
            subtext={`Avg: ${formatCurrency(orderStats.averageOrderValue || 0)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Customers"
            value={orderStats.activeUsers || 0}
            icon={<People />}
            color="#F59E0B"
            change={getPercentageChange(orderStats.activeUsers, orderStats.previousActiveUsers)}
            changeType="up"
            subtext={`${orderStats.newCustomers || 0} new customers`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completion Rate"
            value={`${(orderStats.completionRate || 0).toFixed(1)}%`}
            icon={<AccessTime />}
            color="#8B5CF6"
            subtext={`${orderStats.completedOrders || 0} completed`}
          />
        </Grid>
      </Grid>

      {/* Tabs for Different Report Views */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="report tabs"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="💰 Sales Analytics" id="report-tab-0" aria-controls="report-tabpanel-0" />
        <Tab label="👥 Customer Analytics" id="report-tab-1" aria-controls="report-tabpanel-1" />
        <Tab label="🍽️ Menu Performance" id="report-tab-2" aria-controls="report-tabpanel-2" />
        <Tab label="⚙️ Operational Metrics" id="report-tab-3" aria-controls="report-tabpanel-3" />
      </Tabs>

      {/* Tab 0: Sales Analytics */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Top 5 Selling Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topItems.slice(0, 5).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              {index + 1}. {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(item.revenue)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Daily Orders vs Revenue
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis yAxisId="left" tickFormatter={(value) => `₹${value}`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Value']} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="orders" fill="#10B981" name="Orders" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab 1: Customer Analytics */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  User Growth
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip labelFormatter={formatDate} />
                    <Legend />
                    <Line type="monotone" dataKey="newUsers" stroke="#F59E0B" name="New Users" strokeWidth={2} />
                    <Line type="monotone" dataKey="totalUsers" stroke="#3B82F6" name="Total Users" strokeWidth={2} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#10B981" name="Active Users" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Customer Insights
                </Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">Repeat Customers</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{orderStats.repeatCustomers || 0}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">Avg Customer Lifetime Value</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{formatCurrency(orderStats.customerLTV || 0)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">Customer Retention</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{(orderStats.retentionRate || 0).toFixed(1)}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Churn Rate</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{(orderStats.churnRate || 0).toFixed(1)}%</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab 2: Menu Performance */}
      {tabValue === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Category Performance (Revenue)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
                    <YAxis dataKey="category" type="category" width={80} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Top Performing Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Sold</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Rating</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topItems.slice(0, 8).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">{item.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">{item.quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                              <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                              <Typography variant="body2">{item.averageRating || 'N/A'}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab 3: Operational Metrics */}
      {tabValue === 3 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: orderStats.completedOrders || 0, fill: '#10B981' },
                        { name: 'Pending', value: orderStats.pendingOrders || 0, fill: '#F59E0B' },
                        { name: 'Cancelled', value: orderStats.cancelledOrders || 0, fill: '#EF4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {[{ fill: '#10B981' }, { fill: '#F59E0B' }, { fill: '#EF4444' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Operational KPIs
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Avg Preparation Time</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{orderStats.avgPrepTime || 0} min</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.min((orderStats.avgPrepTime / 60) * 100, 100)} />
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Avg Delivery Time</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{orderStats.avgDeliveryTime || 0} min</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.min((orderStats.avgDeliveryTime / 60) * 100, 100)} />
                  </Box>
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Customer Satisfaction</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Star sx={{ color: '#F59E0B' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{(orderStats.avgRating || 0).toFixed(1)}/5.0</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Reports;
