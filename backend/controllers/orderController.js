import express from 'express';
import ProductOrder from '../models/ProductOrder.js';

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await ProductOrder.find()
      .populate('buyer', 'name phone')
      .populate('farmer', 'name phone')
      .populate('listing', 'productName expectedPrice');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by user (either buyer or farmer)
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await ProductOrder.find({
      $or: [{ buyer: userId }, { farmer: userId }]
    })
      .populate('buyer', 'name phone location')
      .populate('farmer', 'name phone location')
      .populate('listing', 'productName expectedPrice unit imageUrl')
      .sort('-createdAt');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create an order (usually when a purchase request is accepted)
export const createOrder = async (req, res) => {
  try {
    const newOrder = new ProductOrder(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await ProductOrder.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
