import express from 'express';
import ProductListing from '../models/ProductListing.js';

// Get all listings with search, filter, and pagination
export const getListings = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, location, page = 1, limit = 10 } = req.query;
    let query = { status: 'AVAILABLE' }; // Only show available by default for buyers

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    
    if (minPrice || maxPrice) {
      query.expectedPrice = {};
      if (minPrice) query.expectedPrice.$gte = Number(minPrice);
      if (maxPrice) query.expectedPrice.$lte = Number(maxPrice);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const listings = await ProductListing.find(query)
      .populate('farmer', 'name phone location averageRating reviewCount')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
      
    const total = await ProductListing.countDocuments(query);

    res.status(200).json({
      listings,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get listings by farmer
export const getListingsByFarmer = async (req, res) => {
  try {
    const listings = await ProductListing.find({ farmer: req.params.farmerId }).populate('farmer', 'name phone location averageRating reviewCount');
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new listing
export const createListing = async (req, res) => {
  try {
    const newListing = new ProductListing({
      ...req.body,
      farmer: req.dbUser._id // Enforce ownership
    });
    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a listing
export const updateListing = async (req, res) => {
  try {
    // Make sure listing belongs to the user
    const listing = await ProductListing.findOneAndUpdate(
      { _id: req.params.id, farmer: req.dbUser._id },
      req.body,
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await ProductListing.findOneAndDelete({ _id: req.params.id, farmer: req.dbUser._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
