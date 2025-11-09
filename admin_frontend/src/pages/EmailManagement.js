import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Preview,
  Send,
  Email,
  TrendingUp,
  People,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EmailManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({});
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'custom',
    subject: '',
    htmlContent: '',
    textContent: '',
    variables: [],
    tags: [],
    isActive: true
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTemplates(),
        fetchStats(),
        fetchSubscribers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/admin/email/templates');
      if (response.data.success) {
        setTemplates(response.data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/email/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/admin/email/subscribers?limit=100');
      if (response.data.success) {
        setSubscribers(response.data.data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      type: 'custom',
      subject: '',
      htmlContent: '',
      textContent: '',
      variables: [],
      tags: [],
      isActive: true
    });
    setDialogOpen(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || '',
      variables: template.variables || [],
      tags: template.tags || [],
      isActive: template.isActive
    });
    setDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (selectedTemplate) {
        // Update existing template
        await api.put(`/admin/email/templates/${selectedTemplate._id}`, templateForm);
        showSnackbar('Template updated successfully');
      } else {
        // Create new template
        await api.post('/admin/email/templates', templateForm);
        showSnackbar('Template created successfully');
      }
      
      setDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      showSnackbar('Failed to save template', 'error');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/admin/email/templates/${templateId}`);
        showSnackbar('Template deleted successfully');
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        showSnackbar('Failed to delete template', 'error');
      }
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      const response = await api.post(`/admin/email/templates/${template._id}/preview`);
      if (response.data.success) {
        setSelectedTemplate({
          ...template,
          preview: response.data.data
        });
        setPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error previewing template:', error);
      showSnackbar('Failed to preview template', 'error');
    }
  };

  const handleSendTestEmail = async (template) => {
    const testEmail = prompt('Enter test email address:');
    if (testEmail) {
      try {
        await api.post(`/admin/email/templates/${template._id}/test`, {
          testEmail
        });
        showSnackbar('Test email sent successfully');
      } catch (error) {
        console.error('Error sending test email:', error);
        showSnackbar('Failed to send test email', 'error');
      }
    }
  };

  const handleSendTestNewsletter = async () => {
    const testEmail = prompt('Enter test email address (leave empty for default test list):');
    try {
      await api.post('/admin/email/newsletter/send-test', {
        email: testEmail || undefined
      });
      showSnackbar('Test newsletter sent successfully');
    } catch (error) {
      console.error('Error sending test newsletter:', error);
      showSnackbar('Failed to send test newsletter', 'error');
    }
  };

  const StatsCard = ({ title, value, icon, color = 'primary' }) => (
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

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Email Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTemplate}
        >
          Create Template
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Emails Sent"
            value={stats.email?.totalSent || 0}
            icon={<Email sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Open Rate"
            value={`${stats.email?.openRate?.toFixed(1) || 0}%`}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Subscribers"
            value={stats.subscribers?.activeSubscribers || 0}
            icon={<People sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Click Rate"
            value={`${stats.email?.clickRate?.toFixed(1) || 0}%`}
            icon={<Schedule sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Email Templates" />
          <Tab label="Subscribers" />
          <Tab label="Newsletter" />
        </Tabs>

        {/* Email Templates Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={template.type} 
                        size="small" 
                        color="primary" 
                      />
                    </TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      <Chip 
                        label={template.isActive ? 'Active' : 'Inactive'} 
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Preview />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleSendTestEmail(template)}
                      >
                        <Send />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteTemplate(template._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Subscribers Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscribed Date</TableCell>
                  <TableCell>Preferences</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber._id}>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>{subscriber.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={subscriber.isActive ? 'Active' : 'Inactive'} 
                        color={subscriber.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {subscriber.preferences?.newsletter && 
                          <Chip label="Newsletter" size="small" />}
                        {subscriber.preferences?.promotions && 
                          <Chip label="Promotions" size="small" />}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Newsletter Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Newsletter Management</Typography>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSendTestNewsletter}
            >
              Send Test Newsletter
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Newsletters are automatically sent every Monday at 9:00 AM. 
            Use the test button to preview the current newsletter content.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Newsletter Statistics
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last 30 days performance
                  </Typography>
                  <Box mt={2}>
                    <Typography>
                      Total Sent: {stats.email?.totalSent || 0}
                    </Typography>
                    <Typography>
                      Delivery Rate: {stats.email?.deliveryRate?.toFixed(1) || 0}%
                    </Typography>
                    <Typography>
                      Open Rate: {stats.email?.openRate?.toFixed(1) || 0}%
                    </Typography>
                    <Typography>
                      Click Rate: {stats.email?.clickRate?.toFixed(1) || 0}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Subscriber Growth
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Subscriber metrics
                  </Typography>
                  <Box mt={2}>
                    <Typography>
                      Total Subscribers: {stats.subscribers?.totalSubscribers || 0}
                    </Typography>
                    <Typography>
                      Active: {stats.subscribers?.activeSubscribers || 0}
                    </Typography>
                    <Typography>
                      New This Month: {stats.subscribers?.newSubscribers || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Template Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="order-confirmation">Order Confirmation</MenuItem>
                    <MenuItem value="order-completion">Order Completion</MenuItem>
                    <MenuItem value="newsletter">Newsletter</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="HTML Content"
                  multiline
                  rows={10}
                  value={templateForm.htmlContent}
                  onChange={(e) => setTemplateForm({ ...templateForm, htmlContent: e.target.value })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent>
          {selectedTemplate?.preview && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Subject: {selectedTemplate.preview.subject}
              </Typography>
              <Box
                dangerouslySetInnerHTML={{ __html: selectedTemplate.preview.htmlContent }}
                sx={{ border: 1, borderColor: 'grey.300', p: 2, borderRadius: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailManagement;
