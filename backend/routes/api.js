import express from 'express';
import * as userController from '../controllers/userController.js';
import * as productListingController from '../controllers/productListingController.js';
import * as purchaseRequestController from '../controllers/purchaseRequestController.js';
import * as orderController from '../controllers/orderController.js';
import * as chatController from '../controllers/chatController.js';
import * as adminController from '../controllers/adminController.js';
import * as reviewController from '../controllers/reviewController.js';
import * as marketPriceController from '../controllers/marketPriceController.js';
import { verifyToken, isFarmer, isBuyer, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Review Routes
router.post('/reviews', verifyToken, reviewController.createReview);
router.get('/reviews/farmer/:farmerId', reviewController.getFarmerReviews);

// Admin Routes
router.get('/admin/stats', verifyToken, adminController.getStats);
router.get('/admin/users', verifyToken, adminController.getUsers);
router.delete('/admin/users/:id', verifyToken, adminController.deleteUser);

// User Routes
router.get('/users', verifyToken, userController.getUsers);
router.get('/users/me', verifyToken, userController.getCurrentUser);
router.post('/users/register', userController.createUser);
router.post('/users/login', userController.loginUser);
router.get('/users/:id', verifyToken, userController.getUserById);
router.put('/users/:id', verifyToken, userController.updateUser);
router.put('/users/:id/verify', verifyToken, userController.verifyUser);

// Product Listing Routes
router.get('/listings', productListingController.getListings);
router.get('/listings/farmer/:farmerId', productListingController.getListingsByFarmer);
router.post('/listings', verifyToken, isFarmer, productListingController.createListing);
router.put('/listings/:id', verifyToken, isFarmer, productListingController.updateListing);
router.delete('/listings/:id', verifyToken, isFarmer, productListingController.deleteListing);

// Purchase Request Routes
router.get('/requests/buyer/:buyerId', verifyToken, purchaseRequestController.getRequestsByBuyer);
router.get('/requests/farmer/:farmerId', verifyToken, purchaseRequestController.getRequestsByFarmer);
router.post('/requests', verifyToken, purchaseRequestController.createPurchaseRequest);
router.put('/requests/:id/:action', verifyToken, purchaseRequestController.updatePurchaseRequestStatus);

// Order Routes
router.get('/orders/user/:userId', verifyToken, orderController.getOrdersByUser);
router.get('/orders', verifyToken, orderController.getOrders);
router.post('/orders', verifyToken, orderController.createOrder);
router.put('/orders/:id/status', verifyToken, orderController.updateOrderStatus);

// Chat Routes
router.get('/chat/contacts/:userId', verifyToken, chatController.getContacts);
router.get('/chat/history/:userId/:contactId', verifyToken, chatController.getHistory);
router.post('/chat', verifyToken, chatController.sendMessage);

// Market Price Routes
router.get('/market-prices', marketPriceController.getMarketPrices);
router.post('/market-prices/seed', marketPriceController.seedMarketPrices);

export default router;
