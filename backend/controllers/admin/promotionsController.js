const Promotion = require('../../models/Promotion');

const promotionsController = {
  // Get all promotions
  async getPromotions(req, res) {
    try {
      const promotions = await Promotion.find().sort({ createdAt: -1 });
      res.json(promotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({ message: 'Failed to fetch promotions', error: error.message });
    }
  },

  // Create new promotion
  async createPromotion(req, res) {
    try {
      const promotion = new Promotion(req.body);
      await promotion.save();
      res.status(201).json(promotion);
    } catch (error) {
      console.error('Error creating promotion:', error);
      res.status(400).json({ message: 'Failed to create promotion', error: error.message });
    }
  },

  // Update promotion
  async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findByIdAndUpdate(id, req.body, { new: true });
      
      if (!promotion) {
        return res.status(404).json({ message: 'Promotion not found' });
      }
      
      res.json(promotion);
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(400).json({ message: 'Failed to update promotion', error: error.message });
    }
  },

  // Delete promotion
  async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotion = await Promotion.findByIdAndDelete(id);
      
      if (!promotion) {
        return res.status(404).json({ message: 'Promotion not found' });
      }
      
      res.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      res.status(500).json({ message: 'Failed to delete promotion', error: error.message });
    }
  },

  // Toggle promotion status
  async togglePromotionStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const promotion = await Promotion.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      );
      
      if (!promotion) {
        return res.status(404).json({ message: 'Promotion not found' });
      }
      
      res.json(promotion);
    } catch (error) {
      console.error('Error updating promotion status:', error);
      res.status(400).json({ message: 'Failed to update promotion status', error: error.message });
    }
  },

  // Validate promotion code
  async validatePromotion(req, res) {
    try {
      const { code } = req.params;
      const promotion = await Promotion.findOne({ 
        code: code.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });
      
      if (!promotion) {
        return res.status(404).json({ message: 'Invalid or expired promotion code' });
      }

      // Check if promotion has reached max uses
      if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
        return res.status(400).json({ message: 'Promotion code has reached maximum uses' });
      }
      
      res.json({
        valid: true,
        promotion: {
          _id: promotion._id,
          name: promotion.name,
          type: promotion.type,
          value: promotion.value,
          minimumOrderValue: promotion.minimumOrderValue
        }
      });
    } catch (error) {
      console.error('Error validating promotion:', error);
      res.status(500).json({ message: 'Failed to validate promotion', error: error.message });
    }
  }
};

module.exports = promotionsController;
