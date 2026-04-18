require('dotenv').config();
const mongoose = require('./services/mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');

const User = require('./src/users/models/user');
const Category = require('./src/catalogues/models/categories');
const Catalogue = require('./src/catalogues/models/catalogue');
const SellerCatalogue = require('./src/catalogues/models/sellerCatalogue');

async function seed() {
  if (!config.dbUrlMongoDB) {
    throw new Error('Missing dbUrlMongoDB in .env');
  }

  await mongoose.connect(config.dbUrlMongoDB);
  console.log('Connected. Seeding...');

  // Wipe existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Catalogue.deleteMany({}),
    SellerCatalogue.deleteMany({}),
  ]);

  // --- Categories ---
  const categoryNames = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Living'];
  const categories = await Category.insertMany(
    categoryNames.map((c) => ({ category: c }))
  );
  const [electronics, clothing, food, home] = categories;
  console.log('Categories created:', categoryNames.join(', '));

  // --- Users ---
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const sellerPassword = await bcrypt.hash('Seller@1234', 12);

  const [admin, seller1, seller2] = await User.insertMany([
    {
      email: 'admin@catalogcraft.com',
      name: 'Admin User',
      number: '9000000001',
      role: 'ADMIN',
      password: adminPassword,
    },
    {
      email: 'seller1@catalogcraft.com',
      name: 'Ravi Sharma',
      number: '9000000002',
      role: 'SELLER',
      password: sellerPassword,
    },
    {
      email: 'seller2@catalogcraft.com',
      name: 'Priya Mehta',
      number: '9000000003',
      role: 'SELLER',
      password: sellerPassword,
    },
  ]);
  console.log('Users created: admin@catalogcraft.com, seller1@catalogcraft.com, seller2@catalogcraft.com');

  // --- Catalogues ---
  const catalogues = await Catalogue.insertMany([
    {
      product_name: 'Wireless Bluetooth Headphones',
      description: 'Over-ear noise cancelling headphones with 30hr battery life.',
      brand: 'SoundMax',
      color: 'Midnight Black',
      size: 'One Size',
      mrp: 4999,
      selling_price: 3499,
      gst_percentage: 18,
      ean: '8901234567890',
      csin: 'CSN-ELEC-001',
      category: electronics._id,
      standardized: true,
    },
    {
      product_name: 'USB-C Fast Charger 65W',
      description: 'GaN technology charger compatible with laptops, tablets, and phones.',
      brand: 'ChargePro',
      color: 'White',
      size: 'Compact',
      mrp: 1999,
      selling_price: 1499,
      gst_percentage: 18,
      ean: '8901234567891',
      csin: 'CSN-ELEC-002',
      category: electronics._id,
      standardized: true,
    },
    {
      product_name: 'Smart LED Desk Lamp',
      description: 'Touch-controlled desk lamp with adjustable color temperature.',
      brand: 'LumaTech',
      color: 'White',
      size: '45cm',
      mrp: 1299,
      selling_price: 899,
      gst_percentage: 12,
      ean: '8901234567892',
      csin: 'CSN-HOME-001',
      category: home._id,
      standardized: true,
    },
    {
      product_name: 'Men\'s Cotton Polo T-Shirt',
      description: 'Classic fit polo in breathable 100% cotton.',
      brand: 'ThreadCo',
      color: 'Navy Blue',
      size: 'M',
      mrp: 799,
      selling_price: 549,
      gst_percentage: 5,
      ean: '8901234567893',
      csin: 'CSN-CLTH-001',
      category: clothing._id,
      standardized: true,
    },
    {
      product_name: 'Women\'s Running Shoes',
      description: 'Lightweight mesh running shoes with memory foam insole.',
      brand: 'StrideFit',
      color: 'Coral Pink',
      size: '7',
      mrp: 2499,
      selling_price: 1799,
      gst_percentage: 12,
      ean: '8901234567894',
      csin: 'CSN-CLTH-002',
      category: clothing._id,
      standardized: true,
    },
    {
      product_name: 'Organic Green Tea (50 bags)',
      description: 'Premium Darjeeling first flush green tea, individually wrapped.',
      brand: 'TeaLeaf',
      color: null,
      size: '50 bags',
      mrp: 349,
      selling_price: 279,
      gst_percentage: 5,
      ean: '8901234567895',
      csin: 'CSN-FOOD-001',
      category: food._id,
      standardized: true,
    },
    {
      product_name: 'Cold Pressed Coconut Oil 500ml',
      description: 'Virgin cold pressed coconut oil, edible grade.',
      brand: 'PureNature',
      color: null,
      size: '500ml',
      mrp: 499,
      selling_price: 389,
      gst_percentage: 5,
      ean: '8901234567896',
      csin: 'CSN-FOOD-002',
      category: food._id,
      standardized: true,
    },
    {
      product_name: 'Bamboo Cutlery Set',
      description: 'Eco-friendly 5-piece bamboo cutlery set with travel pouch.',
      brand: 'GreenEat',
      color: 'Natural',
      size: '5-piece',
      mrp: 599,
      selling_price: 449,
      gst_percentage: 12,
      ean: '8901234567897',
      csin: 'CSN-HOME-002',
      category: home._id,
      standardized: true,
    },
    {
      product_name: 'Mechanical Gaming Keyboard',
      description: 'RGB backlit TKL keyboard with blue switches.',
      brand: 'KeyStrike',
      color: 'Black',
      size: 'TKL (87 keys)',
      mrp: 5999,
      selling_price: 4299,
      gst_percentage: 18,
      ean: '8901234567898',
      csin: 'CSN-ELEC-003',
      category: electronics._id,
      standardized: true,
    },
    {
      product_name: 'Linen Blend Kurti',
      description: 'Breathable linen-cotton blend kurti with hand-block print.',
      brand: 'EthinicWeave',
      color: 'Sage Green',
      size: 'L',
      mrp: 1099,
      selling_price: 799,
      gst_percentage: 5,
      ean: '8901234567899',
      csin: 'CSN-CLTH-003',
      category: clothing._id,
      standardized: true,
    },
  ]);
  console.log(`Catalogues created: ${catalogues.length} items`);

  // --- SellerCatalogues ---
  // seller1 sells electronics and clothing
  // seller2 sells food and home
  const sellerCatalogueData = [
    { seller: seller1._id, catalogue: catalogues[0]._id, selling_price: 3299, quantity: '50', seller_sku: 'S1-ELEC-001', hsn_code: '8518' },
    { seller: seller1._id, catalogue: catalogues[1]._id, selling_price: 1399, quantity: '120', seller_sku: 'S1-ELEC-002', hsn_code: '8504' },
    { seller: seller1._id, catalogue: catalogues[3]._id, selling_price: 499, quantity: '200', seller_sku: 'S1-CLTH-001', hsn_code: '6109' },
    { seller: seller1._id, catalogue: catalogues[8]._id, selling_price: 4099, quantity: '30', seller_sku: 'S1-ELEC-003', hsn_code: '8471' },
    { seller: seller2._id, catalogue: catalogues[5]._id, selling_price: 259, quantity: '300', seller_sku: 'S2-FOOD-001', hsn_code: '0902' },
    { seller: seller2._id, catalogue: catalogues[6]._id, selling_price: 369, quantity: '150', seller_sku: 'S2-FOOD-002', hsn_code: '1513' },
    { seller: seller2._id, catalogue: catalogues[2]._id, selling_price: 849, quantity: '80', seller_sku: 'S2-HOME-001', hsn_code: '9405' },
    { seller: seller2._id, catalogue: catalogues[7]._id, selling_price: 429, quantity: '200', seller_sku: 'S2-HOME-002', hsn_code: '4602' },
    { seller: seller2._id, catalogue: catalogues[9]._id, selling_price: 749, quantity: '100', seller_sku: 'S2-CLTH-003', hsn_code: '5407' },
  ];

  await SellerCatalogue.insertMany(sellerCatalogueData);
  console.log(`SellerCatalogues created: ${sellerCatalogueData.length} entries`);

  console.log('\nSeed complete!');
  console.log('  Admin login:   admin@catalogcraft.com  / Admin@1234');
  console.log('  Seller 1 login: seller1@catalogcraft.com / Seller@1234');
  console.log('  Seller 2 login: seller2@catalogcraft.com / Seller@1234');

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
