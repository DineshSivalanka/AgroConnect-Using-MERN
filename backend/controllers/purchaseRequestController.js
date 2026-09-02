import express from 'express';
import PurchaseRequest from '../models/PurchaseRequest.js';

// Get requests by buyer
export const getRequestsByBuyer = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({ buyer: req.params.buyerId })
      .populate('buyer', 'name phone location')
      .populate({ path: 'listing', populate: { path: 'farmer', select: 'name phone location' }});
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import ProductListing from '../models/ProductListing.js';

// Get requests by farmer
export const getRequestsByFarmer = async (req, res) => {
  try {
    const listings = await ProductListing.find({ farmer: req.params.farmerId });
    const listingIds = listings.map(l => l._id);
    
    const requests = await PurchaseRequest.find({ listing: { $in: listingIds } })
      .populate('buyer', 'name phone location')
      .populate({ path: 'listing', populate: { path: 'farmer', select: 'name phone location' }});
      
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new purchase request
export const createPurchaseRequest = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.listing && payload.listing.id) payload.listing = payload.listing.id;
    if (payload.buyer && payload.buyer.id) payload.buyer = payload.buyer.id;
    const newRequest = new PurchaseRequest(payload);
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update request status
import ProductOrder from '../models/ProductOrder.js';

export const updatePurchaseRequestStatus = async (req, res) => {
  try {
    const action = req.params.action;
    let status = 'PENDING';
    if (action === 'accept') status = 'ACCEPTED';
    else if (action === 'reject') status = 'REJECTED';
    else status = req.body.status || 'PENDING';
    
    const request = await PurchaseRequest.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('listing');
    if (!request) return res.status(404).json({ message: 'Purchase request not found' });
    
    // Automatically create a ProductOrder when a request is accepted
    if (status === 'ACCEPTED') {
      const order = new ProductOrder({
        purchaseRequest: request._id,
        buyer: request.buyer,
        farmer: request.listing.farmer,
        listing: request.listing._id,
        quantity: request.quantity,
        agreedPrice: request.offeredPrice,
        totalAmount: request.quantity * request.offeredPrice,
        status: 'PLACED'
      });
      await order.save();
    }
    
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
