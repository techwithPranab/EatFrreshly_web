import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Restaurant,
  ShoppingCart,
  AttachMoney,
  Schedule,
  LocalFireDepartment,
  Star,
  Timer,
  CheckCircle,
  LocalDining,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import Layout from '../components/Layout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MetricCard = ({ title, value, icon, color, change, changeType, loading, subtext }) => (
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
            {loading ? <CircularProgress size={24} /> : value}
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
                {changeType === 'up' ? '+' : '-'}{Math.abs(change)}% from last month
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
          {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 32 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, chartsRes, predictionsRes, activitiesRes] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getChartData(),
        dashboardAPI.getPredictions(),
        dashboardAPI.getActivities(),
      ]);

      setMetrics(metricsRes.data.data);
      setChartData(chartsRes.data.data);
      setPredictions(predictionsRes.data.data);
      setActivities(activitiesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (error) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              🍽️ Restaurant Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's your restaurant performance overview.
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={`₹${(metrics?.today?.revenue || 0).toFixed(2)}`}
              icon={<AttachMoney />}
              color="#3B82F6"
              change={12}
              changeType="up"
              loading={loading}
              subtext="Today's earnings"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Orders"
              value={metrics?.today?.orders || '0'}
              icon={<ShoppingCart />}
              color="#10B981"
              change={8}
              changeType="up"
              loading={loading}
              subtext="Orders placed today"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Customers"
              value={metrics?.overview?.totalCustomers || '0'}
              icon={<People />}
              color="#F59E0B"
              change={15}
              changeType="up"
              loading={loading}
              subtext="Total registered users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Menu Items"
              value={metrics?.overview?.activeMenuItems || '0'}
              icon={<LocalDining />}
              color="#8B5CF6"
              loading={loading}
              subtext={`${metrics?.overview?.activeMenuItems || '0'}/${metrics?.overview?.totalMenuItems || '0'} active`}
            />
          </Grid>
        </Grid>

        {/* Additional Metrics Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Avg Order Value"
              value={`₹${((metrics?.today?.revenue || 0) / Math.max(metrics?.today?.orders, 1)).toFixed(2)}`}
              icon={<AttachMoney />}
              color="#EC4899"
              loading={loading}
              subtext="Average per order"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Avg Rating"
              value={`${(metrics?.overview?.avgRating || 0).toFixed(1)} ⭐`}
              icon={<Star />}
              color="#F97316"
              loading={loading}
              subtext="Customer satisfaction"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Avg Prep Time"
              value={`${metrics?.overview?.avgPrepTime || 0} min`}
              icon={<Timer />}
              color="#06B6D4"
              loading={loading}
              subtext="Average cooking time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Completion Rate"
              value={`${Math.round((metrics?.overview?.completionRate || 0) * 100)}%`}
              icon={<CheckCircle />}
              color="#14B8A6"
              loading={loading}
              subtext="Orders completed"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard
              title="Top Category"
              value={metrics?.overview?.topCategory || 'N/A'}
              icon={<LocalFireDepartment />}
              color="#EF4444"
              loading={loading}
              subtext="Most ordered"
            />
          </Grid>
        </Grid>

        {/* Charts and Analytics */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sales Analytics" id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
          <Tab label="Order Analytics" id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
          <Tab label="Menu Performance" id="dashboard-tab-2" aria-controls="dashboard-tabpanel-2" />
          <Tab label="Recent Activity" id="dashboard-tab-3" aria-controls="dashboard-tabpanel-3" />
        </Tabs>

        {/* Tab 1: Sales Analytics */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Revenue Trend
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData?.salesTrend || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue ($)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Status Distribution
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData?.orderStatus || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                      >
                        {(chartData?.orderStatus || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Orders Over Time
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData?.salesTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#82ca9d"
                        name="Total Orders"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Order Analytics */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Top Categories by Revenue
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData?.topCategories || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Top Categories by Orders
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData?.topCategories || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" name="Orders" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Menu Performance */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              AI Predictions - Top Selling Items
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {predictions?.topSellingItems?.slice(0, 10).map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      '&:hover': { boxShadow: 2 },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box flex={1}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {index + 1}. {item.itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Category: {item.category}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${item.confidence}% confidence`}
                        size="small"
                        color={item.confidence > 80 ? 'success' : item.confidence > 60 ? 'warning' : 'default'}
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1} gap={2}>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Predicted: <strong>{item.predictedSales}</strong> units
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Current: <strong>{item.currentSales}</strong> units
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Growth: <strong>{((item.predictedSales - item.currentSales) / Math.max(item.currentSales, 1) * 100).toFixed(1)}%</strong>
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((item.predictedSales / Math.max(item.currentSales * 2, 1)) * 100, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </TabPanel>

        {/* Tab 4: Recent Activity */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📋 Recent Orders
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {activities?.recentOrders?.slice(0, 8).map((order, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          bgcolor: '#f3f4f6',
                          borderRadius: 1,
                          borderLeft: `4px solid #10B981`,
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {order.userId?.name || order.customer || 'Guest'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{(order.totalAmount || order.amount || 0).toFixed(2)}
                            </Typography>
                          </Box>
                          <Chip
                            label={order.status}
                            size="small"
                            color={
                              order.status === 'completed'
                                ? 'success'
                                : order.status === 'pending'
                                ? 'warning'
                                : 'default'
                            }
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {order.date ? new Date(order.date).toLocaleString() : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  👥 New Customers
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {activities?.recentUsers?.slice(0, 8).map((user, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          bgcolor: '#f3f4f6',
                          borderRadius: 1,
                          borderLeft: `4px solid #F59E0B`,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Joined: {new Date(user.joinDate || user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🍽️ New Menu Items
                </Typography>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {activities?.recentMenuItems?.slice(0, 8).map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          bgcolor: '#f3f4f6',
                          borderRadius: 1,
                          borderLeft: `4px solid #8B5CF6`,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₹{item.price} • {item.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Added: {new Date(item.addedDate || item.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    
  );
};

export default Dashboard;
