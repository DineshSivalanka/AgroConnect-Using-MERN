import mongoose from 'mongoose';

const productOrderSchema = new mongoose.Schema({
  purchaseRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseRequest',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductListing',
    required: true
  },
  quantity: {
    type: Number,
    required: false
  },
  agreedPrice: {
    type: Number,
    required: false
  },
  totalAmount: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['PLACED', 'PAID', 'DELIVERED'],
    default: 'PLACED'
  },
  deliveryOtp: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

const ProductOrder = mongoose.model('ProductOrder', productOrderSchema);
export default ProductOrder;
