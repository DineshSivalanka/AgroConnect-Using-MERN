import express from 'express';
import ProductListing from '../models/ProductListing.js';

// Get all listings
export const getListings = async (req, res) => {
  try {
    const listings = await ProductListing.find().populate('farmer', 'name phone location averageRating reviewCount');
    res.status(200).json(listings);
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
    const newListing = new ProductListing(req.body);
    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a listing
export const updateListing = async (req, res) => {
  try {
    const listing = await ProductListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await ProductListing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
