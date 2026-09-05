import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  marketName: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  minPrice: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number,
    required: true
  },
  modalPrice: {
    type: Number,
    required: true
  },
  dateFetched: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a compound index to quickly find the latest price for a crop in a specific market
marketPriceSchema.index({ cropName: 1, marketName: 1, dateFetched: -1 });

export default mongoose.model('MarketPrice', marketPriceSchema);
