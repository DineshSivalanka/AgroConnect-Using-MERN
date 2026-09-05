import MarketPrice from '../models/MarketPrice.js';

// Get market prices with optional filtering
export const getMarketPrices = async (req, res) => {
  try {
    const { cropName, marketName, state, district, limit = 20 } = req.query;
    
    let query = {};
    if (cropName) query.cropName = { $regex: cropName, $options: 'i' };
    if (marketName) query.marketName = { $regex: marketName, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    if (district) query.district = { $regex: district, $options: 'i' };

    const prices = await MarketPrice.find(query)
      .sort({ dateFetched: -1 })
      .limit(parseInt(limit));
      
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed mock market data (for MVP / demonstration)
export const seedMarketPrices = async (req, res) => {
  try {
    const mockData = [
      { cropName: 'Wheat', marketName: 'Azadpur Mandi', state: 'Delhi', district: 'North Delhi', minPrice: 2100, maxPrice: 2300, modalPrice: 2200 },
      { cropName: 'Rice', marketName: 'Karnal Mandi', state: 'Haryana', district: 'Karnal', minPrice: 2900, maxPrice: 3200, modalPrice: 3000 },
      { cropName: 'Tomato', marketName: 'Nashik Market', state: 'Maharashtra', district: 'Nashik', minPrice: 1500, maxPrice: 2500, modalPrice: 2000 },
      { cropName: 'Onion', marketName: 'Lasalgaon Mandi', state: 'Maharashtra', district: 'Nashik', minPrice: 1200, maxPrice: 1800, modalPrice: 1500 },
      { cropName: 'Potato', marketName: 'Agra Mandi', state: 'Uttar Pradesh', district: 'Agra', minPrice: 800, maxPrice: 1200, modalPrice: 1000 },
    ];
    
    await MarketPrice.insertMany(mockData);
    res.status(201).json({ message: 'Mock data seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
