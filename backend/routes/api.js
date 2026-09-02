import express from 'express';
import * as userController from '../controllers/userController.js';
import * as productListingController from '../controllers/productListingController.js';
import * as purchaseRequestController from '../controllers/purchaseRequestController.js';
import * as orderController from '../controllers/orderController.js';
import * as chatController from '../controllers/chatController.js';
import * as otpController from '../controllers/otpController.js';
import * as adminController from '../controllers/adminController.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// Review Routes
router.post('/reviews', reviewController.createReview);
router.get('/reviews/farmer/:farmerId', reviewController.getFarmerReviews);

// Admin Routes
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.getUsers);
router.delete('/admin/users/:id', adminController.deleteUser);

// User Routes
router.get('/users', userController.getUsers);
router.post('/users/register', userController.createUser);
router.post('/users/login', userController.loginUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/verify', userController.verifyUser);

// Product Listing Routes
router.get('/listings', productListingController.getListings);
router.get('/listings/farmer/:farmerId', productListingController.getListingsByFarmer);
router.post('/listings', productListingController.createListing);
router.put('/listings/:id', productListingController.updateListing);
router.delete('/listings/:id', productListingController.deleteListing);

// Purchase Request Routes
router.get('/requests/buyer/:buyerId', purchaseRequestController.getRequestsByBuyer);
router.get('/requests/farmer/:farmerId', purchaseRequestController.getRequestsByFarmer);
router.post('/requests', purchaseRequestController.createPurchaseRequest);
router.put('/requests/:id/:action', purchaseRequestController.updatePurchaseRequestStatus);

// Order Routes
router.get('/orders/user/:userId', orderController.getOrdersByUser);
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Chat Routes
router.get('/chat/contacts/:userId', chatController.getContacts);
router.get('/chat/history/:userId/:contactId', chatController.getHistory);
router.post('/chat', chatController.sendMessage);

// OTP Routes
router.post('/otp/generate', otpController.generateOtp);
router.post('/otp/verify', otpController.verifyOtp);

export default router;
