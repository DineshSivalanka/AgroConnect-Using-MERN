import User from '../models/User.js';
import ProductListing from '../models/ProductListing.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import ChatMessage from '../models/ChatMessage.js';

import ProductOrder from '../models/ProductOrder.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'FARMER' });
    const totalBuyers = await User.countDocuments({ role: 'BUYER' });
    const totalListings = await ProductListing.countDocuments();
    const totalRequests = await PurchaseRequest.countDocuments();
    const totalMessages = await ChatMessage.countDocuments();

    // Chart Data 1: Orders by Status
    const ordersByStatusRaw = await ProductOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const ordersByStatus = ordersByStatusRaw.map(item => ({
      name: item._id,
      value: item.count
    }));

    // Chart Data 2: Products by Category
    const productsByCategoryRaw = await ProductListing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const productsByCategory = productsByCategoryRaw.map(item => ({
      name: item._id || 'Uncategorized',
      value: item.count
    }));

    // Leaderboard: Top 5 Farmers by Rating
    const topFarmers = await User.find({ role: 'FARMER', reviewCount: { $gt: 0 } })
      .sort('-averageRating -reviewCount')
      .limit(5)
      .select('name location averageRating reviewCount');

    res.status(200).json({
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalListings,
      totalRequests,
      totalMessages,
      ordersByStatus,
      productsByCategory,
      topFarmers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('createdAt');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real application, you might want to delete all related data (listings, requests, etc.)
    // For now, we'll just delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
