const ContactInfo = require('../../models/ContactInfo');

// Get contact info
const getContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.getContactInfo();
    res.status(200).json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    });
  }
};

// Update contact info
const updateContactInfo = async (req, res) => {
  try {
    const {
      address,
      phone,
      email,
      businessHours,
      socialMedia,
      additionalInfo
    } = req.body;

    const contactInfo = await ContactInfo.getContactInfo();

    // Update fields
    if (address !== undefined) contactInfo.address = address;
    if (phone !== undefined) contactInfo.phone = phone;
    if (email !== undefined) contactInfo.email = email;
    if (businessHours !== undefined) contactInfo.businessHours = businessHours;
    if (socialMedia !== undefined) contactInfo.socialMedia = socialMedia;
    if (additionalInfo !== undefined) contactInfo.additionalInfo = additionalInfo;

    await contactInfo.save();

    res.status(200).json({
      success: true,
      message: 'Contact information updated successfully',
      data: contactInfo
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information'
    });
  }
};

module.exports = {
  getContactInfo,
  updateContactInfo
};
