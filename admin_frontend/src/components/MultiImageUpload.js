import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  Alert,
  Card,
  CardMedia,
  CardActions,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import api from '../services/api';

const MultiImageUpload = ({ 
  images = [], 
  onImagesChange, 
  folderName = 'default',
  maxImages = 10,
  showPreview = true,
  maxFileSize = 5000000 // 5MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Multiple file upload
  const handleMultipleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Cannot upload ${files.length} files. Maximum ${maxImages} images allowed. Currently have ${images.length} images.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    const slug = generateSlug(folderName);
    const folder = `RestaurentApp/Menu/${slug}`;
    const uploadedImages = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size
        if (file.size > maxFileSize) {
          setError(`File ${file.name} is too large. Maximum size is ${maxFileSize / 1000000}MB`);
          continue;
        }

        // Convert file to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        const response = await api.post('/cloudinary/upload', {
          image: base64,
          folder: folder,
          menuName: `${slug}-${Date.now()}-${i}`
        });

        if (response.data.success) {
          uploadedImages.push({
            url: response.data.url,
            public_id: response.data.public_id,
            name: file.name,
            size: file.size
          });
        }

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      const updatedImages = [...images, ...uploadedImages];
      onImagesChange(updatedImages);
      setSuccess(`Successfully uploaded ${uploadedImages.length} images`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload some images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete image
  const handleDeleteImage = async (index, publicId) => {
    try {
      if (publicId) {
        await api.delete(`/cloudinary/delete/${publicId}`);
      }
      
      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
      setSuccess('Image deleted successfully');
      setError('');
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete image');
    }
  };

  // Preview image
  const handlePreviewImage = (image) => {
    setPreviewImage(image);
    setPreviewOpen(true);
  };

  // Download image
  const handleDownloadImage = (image, index) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `menu-image-${index + 1}.${image.format || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Image Gallery ({images.length}/{maxImages})
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Upload Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultipleFileUpload}
          style={{ display: 'none' }}
          id="multiple-file-upload"
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="multiple-file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<AddIcon />}
            disabled={uploading || images.length >= maxImages}
          >
            Upload Images
          </Button>
        </label>

        {images.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all images?')) {
                onImagesChange([]);
                setSuccess('All images deleted');
              }
            }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Image Grid */}
      {showPreview && images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.url}
                  alt={`Uploaded image ${index + 1}`}
                  sx={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => handlePreviewImage(image)}
                />
                <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewImage(image)}
                      title="Preview"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadImage(image, index)}
                      title="Download"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteImage(index, image.public_id)}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
                
                {/* Image Info */}
                <Box sx={{ p: 1, pt: 0 }}>
                  {image.format && (
                    <Chip label={image.format.toUpperCase()} size="small" sx={{ mr: 0.5 }} />
                  )}
                  {image.bytes && (
                    <Chip 
                      label={`${(image.bytes / 1024).toFixed(1)}KB`} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Images State */}
      {images.length === 0 && (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.50'
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No images uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the upload buttons above to add images
          </Typography>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box>
              <img
                src={previewImage.url}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {previewImage.width && (
                  <Chip label={`${previewImage.width}x${previewImage.height}`} />
                )}
                {previewImage.format && (
                  <Chip label={previewImage.format.toUpperCase()} />
                )}
                {previewImage.bytes && (
                  <Chip label={`${(previewImage.bytes / 1024).toFixed(1)}KB`} />
                )}
                {previewImage.created_at && (
                  <Chip label={new Date(previewImage.created_at).toLocaleDateString()} />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {previewImage && (
            <Button 
              onClick={() => handleDownloadImage(previewImage, 0)}
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiImageUpload;
