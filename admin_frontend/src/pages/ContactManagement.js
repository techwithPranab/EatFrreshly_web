import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  ContactMail,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Info
} from '@mui/icons-material';
import api from '../services/api';

const ContactManagement = () => {
  const [contactInfo, setContactInfo] = useState({
    address: '',
    phone: '',
    email: '',
    businessHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: true }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/contact-info');
      if (response.data && response.data.data) {
        setContactInfo(response.data.data);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setError('Failed to fetch contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'businessHours') {
        const [day, property] = child.split('.');
        setContactInfo(prev => ({
          ...prev,
          businessHours: {
            ...prev.businessHours,
            [day]: {
              ...prev.businessHours[day],
              [property]: value
            }
          }
        }));
      } else if (parent === 'socialMedia') {
        setContactInfo(prev => ({
          ...prev,
          socialMedia: {
            ...prev.socialMedia,
            [child]: value
          }
        }));
      }
    } else {
      setContactInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.put('/admin/contact-info', contactInfo);

      setSuccess('Contact information updated successfully!');
    } catch (error) {
      console.error('Error updating contact info:', error);
      setError(error.response?.data?.message || 'Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

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
            📞 Contact Information Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage restaurant contact details displayed in the footer
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Contact Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <ContactMail sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Basic Contact Information
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={contactInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    variant="outlined"
                    placeholder="Enter restaurant address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={contactInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    variant="outlined"
                    placeholder="+1 (555) 123-4567"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    variant="outlined"
                    placeholder="info@restaurant.com"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Media */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Social Media Links
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    value={contactInfo.socialMedia.facebook}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    variant="outlined"
                    placeholder="https://facebook.com/restaurant"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={contactInfo.socialMedia.instagram}
                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                    variant="outlined"
                    placeholder="https://instagram.com/restaurant"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={contactInfo.socialMedia.twitter}
                    onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                    variant="outlined"
                    placeholder="https://twitter.com/restaurant"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={contactInfo.socialMedia.linkedin}
                    onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                    variant="outlined"
                    placeholder="https://linkedin.com/company/restaurant"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Hours */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Business Hours
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {daysOfWeek.map((day) => (
                  <Grid item xs={12} sm={6} md={4} key={day.key}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {day.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={!contactInfo.businessHours[day.key].closed}
                              onChange={(e) => handleInputChange(`businessHours.${day.key}.closed`, !e.target.checked)}
                            />
                          }
                          label="Open"
                          sx={{ mr: 0 }}
                        />
                      </Box>
                      {!contactInfo.businessHours[day.key].closed && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small"
                            label="Open"
                            type="time"
                            value={contactInfo.businessHours[day.key].open}
                            onChange={(e) => handleInputChange(`businessHours.${day.key}.open`, e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                          <TextField
                            size="small"
                            label="Close"
                            type="time"
                            value={contactInfo.businessHours[day.key].close}
                            onChange={(e) => handleInputChange(`businessHours.${day.key}.close`, e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                        </Box>
                      )}
                      {contactInfo.businessHours[day.key].closed && (
                        <Typography variant="body2" color="text.secondary">
                          Closed
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Info sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Additional Information
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Additional Info"
                multiline
                rows={4}
                value={contactInfo.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                variant="outlined"
                placeholder="Any additional information you want to display in the footer..."
                helperText="This information will be displayed in the footer contact section"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={saving}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              {saving ? 'Saving...' : 'Save Contact Information'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactManagement;
