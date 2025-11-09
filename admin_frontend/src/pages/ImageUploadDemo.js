import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert
} from '@mui/material';
import MultiImageUpload from '../components/MultiImageUpload';

const ImageUploadDemo = () => {
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState('');

  const handleImagesChange = (newImages) => {
    setImages(newImages);
    setSuccess(`Updated gallery with ${newImages.length} images`);
  };

  const handleSave = () => {
    console.log('Saving images:', images);
    setSuccess('Images saved successfully! Check console for details.');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Multi-Image Upload Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Test the multi-image upload component with Cloudinary integration.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Images
          </Typography>
          
          <MultiImageUpload
            images={images}
            onImagesChange={handleImagesChange}
            folderName="demo-upload"
            maxImages={10}
            showPreview={true}
            maxFileSize={5000000} // 5MB
          />
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Images Data
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Images: {images.length}
              </Typography>
            </Box>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(images, null, 2)}
            </pre>
            <Button 
              variant="contained" 
              onClick={handleSave}
              sx={{ mt: 2 }}
            >
              Save Images
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ImageUploadDemo;
