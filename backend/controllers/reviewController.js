import Review from '../models/Review.js';
import User from '../models/User.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { farmerId, orderId, rating, comment } = req.body;
    const buyerId = req.body.buyerId;

    // Check if review already exists
    const existingReview = await Review.findOne({ buyer: buyerId, order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    const review = new Review({
      farmer: farmerId,
      buyer: buyerId,
      order: orderId,
      rating,
      comment
    });

    await review.save();

    // Recalculate average rating for the farmer
    const allReviews = await Review.find({ farmer: farmerId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (totalRating / allReviews.length).toFixed(1);
    
    // Update farmer user profile
    await User.findByIdAndUpdate(farmerId, {
      averageRating: parseFloat(averageRating),
      reviewCount: allReviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get reviews for a specific farmer
export const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('buyer', 'name')
      .sort('-createdAt');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
