const express = require('express');
const { v2: cloudinary } = require('cloudinary');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image directly
router.post('/upload', authenticateToken, async (req, res) => {
  try {
    const { image, folder, menuName } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image data is required' 
      });
    }

    const uploadOptions = {
      folder: folder || 'RestaurentApp/Menu/default',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto:good' }
      ],
      overwrite: true,
      invalidate: true,
      resource_type: 'image'
    };

    if (menuName) {
      uploadOptions.public_id = menuName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    const result = await cloudinary.uploader.upload(image, uploadOptions);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      version: result.version
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image' 
    });
  }
});

// Delete image
router.delete('/delete/:public_id', authenticateToken, async (req, res) => {
  try {
    const { public_id } = req.params;
    
    const result = await cloudinary.uploader.destroy(public_id);
    
    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image' 
    });
  }
});

module.exports = router;
