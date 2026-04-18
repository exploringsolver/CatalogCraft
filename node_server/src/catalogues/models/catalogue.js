// src/catalogue/models/catalogue.js
const mongoose = require('../../../services/mongoose');

const catalogueSchema = new mongoose.Schema({
  product_name: String,
  description: String,
  brand: String,
  color: String,
  size: String,
  mrp: Number,
  selling_price: Number,
  gst_percentage: Number,
  ean: String,
  csin: String,
  asin: String,
  upc: String,
  product_image_1: String,
  product_image_2: String,
  product_image_3: String,
  product_image_4: String,
  product_image_5: String,
  standardized: {
    type: Boolean,
    default: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
});

const Catalogue = mongoose.model('Catalogue', catalogueSchema);
module.exports = Catalogue;
