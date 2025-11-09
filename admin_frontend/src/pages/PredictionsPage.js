import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Chip, Grid, LinearProgress } from '@mui/material';
import { dashboardAPI } from '../services/api';
import Layout from '../components/Layout';

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getPredictions();
      setPredictions(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          AI Predictions
        </Typography>
      </Box>
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Top Selling Items
            </Typography>
            <Grid container spacing={2}>
              {predictions?.topSellingItems?.map((item, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">{item.itemName}</Typography>
                      <Chip label={`${item.confidence}% confidence`} size="small" color={item.confidence > 70 ? 'success' : 'warning'} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Predicted: {item.predictedSales} units
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current: {item.currentSales} units
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.min((item.predictedSales / Math.max(item.currentSales * 2, 1)) * 100, 100)} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
            {/* Add more prediction visualizations as needed */}
            {/* Example: Show predicted revenue and trends if available */}
            {predictions?.predictedRevenue && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Predicted Revenue
                </Typography>
                <Typography variant="h5" color="primary">
                  ${predictions.predictedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}
            {Array.isArray(predictions?.trends) && predictions.trends.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Trends
                </Typography>
                <Grid container spacing={2}>
                  {predictions.trends.map((trend, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2">{trend.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{trend.description}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {/* Show prediction date and model info if available */}
            {predictions?.predictionDate && (
              <Box mt={4}>
                <Typography variant="body2" color="text.secondary">
                  Prediction Date: {new Date(predictions.predictionDate).toLocaleString()}
                </Typography>
              </Box>
            )}
            {predictions?.modelInfo && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Model: {predictions.modelInfo.name} (v{predictions.modelInfo.version})
                </Typography>
                {predictions.modelInfo.description && (
                  <Typography variant="caption" color="text.secondary">
                    {predictions.modelInfo.description}
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PredictionsPage;
