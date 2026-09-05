import mongoose from 'mongoose';

const productListingSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: false
  },
  unit: {
    type: String,
    required: false
  },
  quality: {
    type: String,
    required: false
  },
  expectedPrice: {
    type: Number,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  availableDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    default: 'AVAILABLE'
  },
  category: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

const ProductListing = mongoose.model('ProductListing', productListingSchema);
export default ProductListing;
