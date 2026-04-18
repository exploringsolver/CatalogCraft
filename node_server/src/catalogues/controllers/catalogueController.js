// src/catalogue/controllers/catalogueController.js
const Catalogue = require('../models/catalogue');
const Category = require('../models/categories');
const SellerCatalogue = require('../models/sellerCatalogue');
const CatalogueTemplate = require('../models/catalogueTemplate');
const { parseExcelFile, getMatchingCatalogues } = require('../services/imageSearch');
const mongoose = require('../../../services/mongoose');
const https = require('https');
const XLSX = require('xlsx');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
// const cv = require('opencv4nodejs');

function generateSku(productName) {
  const initials = productName.split(' ').slice(0, 3).map(w => w[0] || '').join('');
  const rand = Math.floor(100 + Math.random() * 900);
  return `${initials}_${rand}`;
}

// Get catalogue of logged-in user
exports.getUserCatalogues = async (req, res) => {
  try {
    const userId = req.user._id;
    const sellerCatalogues = await SellerCatalogue.find({ seller: userId }).populate('catalogue');
    res.status(200).json(sellerCatalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new catalogue or link seller with existing catalogue
exports.createCatalogue = async (req, res) => {
  try {
    const catalogueData = req.body;

    // Check if a catalogue with the provided UPC already exists
    const existingCatalogue = await Catalogue.findOne({ upc: catalogueData.upc });
    if (existingCatalogue) {
      // If a catalogue with the UPC exists, link the seller with the existing catalogue
      const sellerCatalogueData = {
        seller: req.user._id,
        catalogue: existingCatalogue._id,
        selling_price: catalogueData.selling_price,
        hsn_code: catalogueData.hsn_code,
        quantity: catalogueData.quantity,
        seller_sku: catalogueData.seller_sku,
        product_image_6: catalogueData.product_image_6,
        product_image_7: catalogueData.product_image_7,
        product_image_8: catalogueData.product_image_8,
        product_image_9: catalogueData.product_image_9,
        product_image_10: catalogueData.product_image_10
      };

      const sellerCatalogue = new SellerCatalogue(sellerCatalogueData);
      await sellerCatalogue.save();

      return res.status(201).json({ message: 'Seller linked with existing catalogue' });
    }
    else {
      // Find the category by name
      const category = await Category.findOne({ category: catalogueData.category });
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      // Replace the category name with the category _id
      catalogueData.category = category._id;

      // Create a new catalogue
      const catalogue = new Catalogue(catalogueData);
      await catalogue.save();

      // Create a new SellerCatalogue entry
      const sellerCatalogueData = {
        seller: req.user._id,
        catalogue: catalogue._id,
        selling_price: catalogueData.selling_price,
        hsn_code: catalogueData.hsn_code,
        quantity: catalogueData.quantity,
        seller_sku: catalogueData.seller_sku,
        product_image_6: catalogueData.product_image_6,
        product_image_7: catalogueData.product_image_7,
        product_image_8: catalogueData.product_image_8,
        product_image_9: catalogueData.product_image_9,
        product_image_10: catalogueData.product_image_10
      };
      const sellerCatalogue = new SellerCatalogue(sellerCatalogueData);
      await sellerCatalogue.save();

      res.status(201).json({ message: 'Catalogue created successfully' });
    }
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all catalogues
exports.getAllCatalogues = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }
    const catalogues = await Catalogue.find().populate('category');
    res.status(200).json(catalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ categories: [] });
    }
    const categories = await Category.find().select('category');
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get catalogues by category
exports.getCataloguesByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ category: req.params.category });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const catalogues = await Catalogue.find({ category: category._id });
    res.status(200).json(catalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all catalogues by category
exports.getAllCataloguesByCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    const resultData = {};

    for (const category of categories) {
      const catalogues = await Catalogue.find({ category: category._id });
      resultData[category.category] = catalogues;
    }

    res.status(200).json(resultData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Trial route
exports.trial = (req, res) => {
  res.send('Trial route working');
};

// Get catalogue by ID
exports.getCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id).populate('category');
    if (!catalogue) {
      return res.status(404).json({ error: 'Catalogue not found' });
    }
    res.status(200).json(catalogue);
  } catch (error) {
    // Mongo/Mongoose throws CastError when an id is undefined/invalid ObjectId.
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid catalogue id" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Upload product details from CSV
exports.uploadCSV = async (req, res) => {
  try {
    const productName = req.body.name;
    if (!productName) {
      return res.status(400).json({ error: 'Missing product name in request data' });
    }

    const productData = await parseExcelFile('src/catalogues/ondc.xlsx', productName);
    if (productData) {
      res.status(200).json(productData);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Search similar images
exports.searchSimilarImages = async (req, res) => {
  try {
    const imageFile = req.files.image;
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const matchingCatalogues = await getMatchingCatalogues(imageFile.data);
    res.status(200).json(matchingCatalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get catalogues by template name
exports.getTemplateCatalogues = async (req, res) => {
  try {
    const template = await CatalogueTemplate.findOne({ template_name: req.params.template_name }).populate('catalogues');
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json(template.catalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search catalogues
exports.searchCatalogues = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: 'A search query is required' });
    }

    const catalogues = await Catalogue.find({
      $or: [
        { product_name: { $regex: query, $options: 'i' } },
        { asin: { $regex: query, $options: 'i' } },
        { upc: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json(catalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await CatalogueTemplate.find().select('template_name -_id');
    const templateNames = templates.map(template => template.template_name);
    res.status(200).json(templateNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get seller catalogue by ID (combined catalogue + seller fields)
exports.getSellerCatalogueById = async (req, res) => {
  try {
    const sellerCatalogue = await SellerCatalogue.findById(req.params.id).populate('catalogue');
    if (!sellerCatalogue) {
      return res.status(404).json({ detail: 'Seller Catalogue not found.' });
    }
    const combined = {
      ...sellerCatalogue.toObject(),
      ...(sellerCatalogue.catalogue ? sellerCatalogue.catalogue.toObject() : {}),
      catalogue_id: sellerCatalogue.catalogue ? sellerCatalogue.catalogue._id : null,
    };
    res.status(200).json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update seller catalogue
exports.updateSellerCatalogue = async (req, res) => {
  try {
    const sellerCatalogue = await SellerCatalogue.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    if (!sellerCatalogue) {
      return res.status(404).json({ detail: 'Seller Catalogue not found.' });
    }
    res.status(200).json(sellerCatalogue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete seller catalogue
exports.deleteSellerCatalogue = async (req, res) => {
  try {
    const sellerCatalogue = await SellerCatalogue.findByIdAndDelete(req.params.id);
    if (!sellerCatalogue) {
      return res.status(404).json({ detail: 'Seller Catalogue not found.' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EAN barcode lookup via barcodespider API
exports.eanLookup = async (req, res) => {
  const { ean } = req.params;
  const barcodeSpiderToken = process.env.BARCODESPIDER_API_TOKEN;
  if (!barcodeSpiderToken) {
    return res.status(500).json({ error: 'Barcode lookup is not configured.' });
  }
  const apiUrl = `https://api.barcodespider.com/v1/lookup?token=${encodeURIComponent(barcodeSpiderToken)}&upc=${ean}`;

  https.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const itemResponse = parsed.item_response || {};
        const itemAttributes = parsed.item_attributes || {};

        if (itemResponse.code !== 200) {
          return res.status(400).json({ error: itemResponse.message || 'Error retrieving data' });
        }

        const seller_sku = generateSku(itemAttributes.title || '');
        res.status(200).json({
          product_name: itemAttributes.title || '',
          mrp: itemAttributes.highest_price || '0.00',
          gst_percentage: '',
          ean: itemAttributes.ean || ean,
          description: itemAttributes.description || '',
          color: itemAttributes.color || '',
          brand: itemAttributes.brand || '',
          size: itemAttributes.size || '',
          product_image_1: itemAttributes.image || '',
          product_image_2: null,
          product_image_3: null,
          product_image_4: null,
          product_image_5: null,
          standardized: true,
          category: itemAttributes.category || '',
          seller_sku,
        });
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse barcode API response' });
      }
    });
  }).on('error', () => {
    res.status(400).json({ error: 'Product with provided ean not found.' });
  });
};

// Upload catalogue from Excel + ZIP (preview only, does not save)
exports.uploadCatalogue = async (req, res) => {
  try {
    if (!req.files || !req.files.excel_file || !req.files.zip_file) {
      return res.status(400).json({ error: 'Both excel_file and zip_file are required.' });
    }

    const excelBuffer = req.files.excel_file[0].buffer;
    const zipName = req.files.zip_file[0].originalname.replace(/\.zip$/i, '');

    const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const catalogues = rows.map(row => {
      const productName = row['name'] || '';
      return {
        product_name: productName,
        description: row['description'] || '',
        brand: row['brand'] || '',
        color: row['color'] || '',
        size: row['size'] || '',
        mrp: row['price'] || 0,
        gst_percentage: row['gst_percentage'] || '',
        ean: row['ean'] || '',
        standardized: row['standardized'] !== undefined ? Boolean(row['standardized']) : true,
        category: row['category'] || '',
        product_image_1: row['product_image_1'] ? `/media/images/temp/${zipName}/${row['product_image_1']}` : null,
        product_image_2: null,
        product_image_3: null,
        product_image_4: null,
        product_image_5: null,
        seller_sku: generateSku(productName),
      };
    });

    res.status(200).json(catalogues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download an Excel template for bulk upload
exports.downloadBulkTemplate = async (req, res) => {
  try {
    const templateType = String(req.query?.type || 'preview').toLowerCase();

    const baseHeaders = [
      'name',
      'description',
      'brand',
      'color',
      'size',
      'price',
      'gst_percentage',
      'ean',
      'standardized',
      'category',
      'product_image_1',
      'product_image_2',
      'product_image_3',
      'product_image_4',
      'product_image_5',
    ];

    const headers =
      templateType === 'save'
        ? [...baseHeaders, 'seller_sku', 'selling_price', 'quantity']
        : baseHeaders;

    const exampleRow =
      templateType === 'save'
        ? {
            name: 'Sample Product Name',
            description: 'Short product description (optional)',
            brand: 'Brand (optional)',
            color: 'Black',
            size: 'M',
            price: 999,
            gst_percentage: '18',
            ean: '8901234567890',
            standardized: true,
            category: 'Imported Products',
            product_image_1: 'image1.jpg',
            product_image_2: '',
            product_image_3: '',
            product_image_4: '',
            product_image_5: '',
            seller_sku: 'SKU_123',
            selling_price: 899,
            quantity: 10,
          }
        : {
            name: 'Sample Product Name',
            description: 'Short product description (optional)',
            brand: 'Brand (optional)',
            color: 'Black',
            size: 'M',
            price: 999,
            gst_percentage: '18',
            ean: '8901234567890',
            standardized: true,
            category: 'Imported Products',
            product_image_1: 'image1.jpg',
            product_image_2: '',
            product_image_3: '',
            product_image_4: '',
            product_image_5: '',
          };

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([exampleRow], { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename =
      templateType === 'save'
        ? 'catalogcraft-bulk-template-save.xlsx'
        : 'catalogcraft-bulk-template-preview.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Upload and save catalogue from Excel + ZIP
exports.uploadAndSaveCatalogue = async (req, res) => {
  try {
    if (!req.files || !req.files.excel_file || !req.files.zip_file) {
      return res.status(400).json({ error: 'Both excel_file and zip_file are required.' });
    }

    const excelBuffer = req.files.excel_file[0].buffer;
    const zipName = req.files.zip_file[0].originalname.replace(/\.zip$/i, '');

    const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const productName = row['name'] || '';
      const ean = row['ean'] ? String(row['ean']) : '';
      const categoryName = row['category'] || '';
      let sellerSku = row['seller_sku'] || generateSku(productName);

      let category = await Category.findOne({ category: categoryName });
      if (!category) {
        category = await Category.create({ category: categoryName });
      }

      const imagePaths = [];
      for (let i = 1; i <= 5; i++) {
        const imgFile = row[`product_image_${i}`];
        if (imgFile) {
          imagePaths.push(`/images/temp/${zipName}/${imgFile}`);
        }
      }

      let catalogue = ean ? await Catalogue.findOne({ ean }) : null;
      if (!catalogue) {
        catalogue = await Catalogue.create({
          product_name: productName,
          description: row['description'] || '',
          brand: row['brand'] || '',
          color: row['color'] || '',
          size: row['size'] || '',
          mrp: row['price'] || 0,
          gst_percentage: row['gst_percentage'] || '',
          ean,
          standardized: row['standardized'] !== undefined ? Boolean(row['standardized']) : true,
          category: category._id,
          product_image_1: imagePaths[0] || null,
          product_image_2: imagePaths[1] || null,
          product_image_3: imagePaths[2] || null,
          product_image_4: imagePaths[3] || null,
          product_image_5: imagePaths[4] || null,
        });
      }

      await SellerCatalogue.create({
        seller: req.user ? req.user._id : null,
        catalogue: catalogue._id,
        selling_price: row['selling_price'] || 0,
        quantity: row['Qty'] || row['quantity'] || '',
        seller_sku: sellerSku,
      });
    }

    res.status(200).json({ message: 'Catalogue data saved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export all catalogues as CSV
exports.exportAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().populate('category');
    const headers = ['Product Name', 'MRP', 'GST Percentage', 'Description', 'EAN', 'Standardized', 'Category',
      'Product Image 1', 'Product Image 2', 'Product Image 3', 'Product Image 4', 'Product Image 5'];

    const rows = catalogues.map(c => [
      c.product_name, c.mrp, c.gst_percentage, c.description, c.ean,
      c.standardized, c.category ? c.category.category : '',
      c.product_image_1 || '', c.product_image_2 || '', c.product_image_3 || '',
      c.product_image_4 || '', c.product_image_5 || '',
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="all_catalogues.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export seller's catalogues as CSV
exports.exportSellerCatalogues = async (req, res) => {
  try {
    const sellerCatalogues = await SellerCatalogue.find({ seller: req.user._id }).populate('catalogue');
    const headers = ['Product Name', 'MRP', 'GST Percentage', 'Description', 'EAN', 'Standardized', 'Category',
      'Selling Price', 'Quantity', 'Seller SKU',
      'Product Image 6', 'Product Image 7', 'Product Image 8', 'Product Image 9', 'Product Image 10'];

    const rows = sellerCatalogues.map(sc => {
      const c = sc.catalogue || {};
      return [
        c.product_name, c.mrp, c.gst_percentage, c.description, c.ean,
        c.standardized, c.category || '',
        sc.selling_price, sc.quantity, sc.seller_sku,
        sc.product_image_6 || '', sc.product_image_7 || '', sc.product_image_8 || '',
        sc.product_image_9 || '', sc.product_image_10 || '',
      ];
    });

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="seller_catalogues.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};