require('dotenv').config();

const path = require('path');
const AdmZip = require('adm-zip');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const config = require('./config');

const mongoose = require('./services/mongoose');
const User = require('./src/users/models/user');
const Category = require('./src/catalogues/models/categories');
const Catalogue = require('./src/catalogues/models/catalogue');
const SellerCatalogue = require('./src/catalogues/models/sellerCatalogue');

const DEFAULT_ZIP_PATH = path.resolve(
  __dirname,
  '../assets/ecommerce-product-dataset-main/data/amazon_com/bird_food/amazon_com_bird_food_2025_01_24.zip'
);
const DEFAULT_LIMIT = 100;
const DEFAULT_SELLER_EMAIL = 'octaprice-demo@catalogcraft.com';

function parseArgs(argv) {
  const args = {
    zip: DEFAULT_ZIP_PATH,
    limit: DEFAULT_LIMIT,
    wipeCatalogues: false,
    createSellerEntries: true,
    sellerEmail: DEFAULT_SELLER_EMAIL,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--zip' && argv[i + 1]) {
      args.zip = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
    } else if (arg === '--limit' && argv[i + 1]) {
      args.limit = Number(argv[i + 1]);
      i += 1;
    } else if (arg === '--seller-email' && argv[i + 1]) {
      args.sellerEmail = argv[i + 1];
      i += 1;
    } else if (arg === '--wipe-catalogues') {
      args.wipeCatalogues = true;
    } else if (arg === '--catalogue-only') {
      args.createSellerEntries = false;
    }
  }

  if (!Number.isFinite(args.limit) || args.limit <= 0) {
    throw new Error('`--limit` must be a positive number.');
  }

  return args;
}

function safeJsonParse(value, fallback) {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function extractCategoryName(row) {
  const breadcrumbs = safeJsonParse(row.breadcrumbs, []);
  if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
    const leaf = breadcrumbs[breadcrumbs.length - 1];
    if (leaf && typeof leaf.name === 'string' && leaf.name.trim()) {
      return leaf.name.trim();
    }
  }

  return 'Imported Products';
}

function extractImageUrls(row) {
  const sources = [];

  const imageUrls = safeJsonParse(row.imageUrls, []);
  if (Array.isArray(imageUrls)) {
    sources.push(...imageUrls);
  }

  const images = safeJsonParse(row.images, []);
  if (Array.isArray(images)) {
    sources.push(...images);
  }

  if (typeof row.mainImageUrl === 'string' && row.mainImageUrl.trim()) {
    sources.push(row.mainImageUrl.trim());
  }

  return sources
    .filter((value) => typeof value === 'string' && value.trim())
    .slice(0, 5);
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildDescription(row) {
  if (row.description && String(row.description).trim()) {
    return String(row.description).trim();
  }

  const features = safeJsonParse(row.features, []);
  if (Array.isArray(features) && features.length > 0) {
    return features.join(' ');
  }

  return 'Imported from Octaprice dataset.';
}

async function getOrCreateDemoSeller(email) {
  let seller = await User.findOne({ email });
  if (seller) {
    return seller;
  }

  const hashedPassword = await bcrypt.hash('Seller@1234', 12);
  seller = await User.create({
    email,
    name: 'Octaprice Demo Seller',
    number: '9000000100',
    role: 'SELLER',
    password: hashedPassword,
  });

  return seller;
}

async function readRowsFromZip(zipPath) {
  const zip = new AdmZip(zipPath);
  const csvEntry = zip.getEntries().find((entry) => entry.entryName.endsWith('.csv'));
  if (!csvEntry) {
    throw new Error(`No CSV file found in ${zipPath}`);
  }

  const csvBuffer = csvEntry.getData();
  const workbook = XLSX.read(csvBuffer, { type: 'buffer', raw: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

async function waitForDatabaseConnection(timeoutMs = 15000) {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for MongoDB connection after ${timeoutMs}ms.`));
    }, timeoutMs);

    const handleOpen = () => {
      cleanup();
      resolve();
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      clearTimeout(timeout);
      mongoose.connection.off('open', handleOpen);
      mongoose.connection.off('error', handleError);
    }

    mongoose.connection.once('open', handleOpen);
    mongoose.connection.once('error', handleError);
  });
}

async function seedFromDataset(options) {
  await waitForDatabaseConnection();

  console.log(`Connected. Importing Octaprice dataset from ${options.zip}`);

  const rows = await readRowsFromZip(options.zip);
  const limitedRows = rows.slice(0, options.limit);

  if (options.wipeCatalogues) {
    await Promise.all([
      SellerCatalogue.deleteMany({}),
      Catalogue.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log('Existing catalogue, seller catalogue, and category data deleted.');
  }

  const seller = options.createSellerEntries
    ? await getOrCreateDemoSeller(options.sellerEmail)
    : null;

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of limitedRows) {
    const productName = String(row.name || '').trim();
    if (!productName) {
      skippedCount += 1;
      continue;
    }

    const categoryName = extractCategoryName(row);
    const imageUrls = extractImageUrls(row);
    const ean = String(row.gtin || '').trim();
    const asin = safeJsonParse(row.additionalProperties, []).find(
      (item) => item && item.name === 'ASIN'
    )?.value || '';

    let category = await Category.findOne({ category: categoryName });
    if (!category) {
      category = await Category.create({ category: categoryName });
    }

    const dedupeQuery = ean
      ? { ean }
      : asin
        ? { asin }
        : { product_name: productName };

    let catalogue = await Catalogue.findOne(dedupeQuery);

    if (!catalogue) {
      catalogue = await Catalogue.create({
        product_name: productName,
        description: buildDescription(row),
        brand: String(row.brandName || '').trim() || null,
        color: String(row.color || '').trim() || null,
        size: String(row.size || '').trim() || null,
        mrp: toNumber(row.listedPrice),
        selling_price: toNumber(row.salePrice || row.listedPrice),
        gst_percentage: null,
        ean: ean || null,
        csin: String(row.sku || '').trim() || null,
        asin: asin || null,
        upc: String(row.mpn || '').trim() || null,
        product_image_1: imageUrls[0] || null,
        product_image_2: imageUrls[1] || null,
        product_image_3: imageUrls[2] || null,
        product_image_4: imageUrls[3] || null,
        product_image_5: imageUrls[4] || null,
        standardized: true,
        category: category._id,
      });
    }

    if (seller) {
      const existingSellerCatalogue = await SellerCatalogue.findOne({
        seller: seller._id,
        catalogue: catalogue._id,
      });

      if (!existingSellerCatalogue) {
        await SellerCatalogue.create({
          seller: seller._id,
          catalogue: catalogue._id,
          selling_price: toNumber(row.salePrice || row.listedPrice) || 0,
          quantity: row.inStock === true || row.inStock === 'True' ? '25' : '0',
          seller_sku: String(row.sku || row.mpn || row.gtin || productName).slice(0, 50),
          hsn_code: '',
        });
      }
    }

    importedCount += 1;
  }

  console.log(`Imported catalogues: ${importedCount}`);
  console.log(`Skipped rows: ${skippedCount}`);
  if (seller) {
    console.log(`Demo seller ready: ${seller.email} / Seller@1234`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!config.dbUrlMongoDB) {
    throw new Error('Missing dbUrlMongoDB in .env');
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.dbUrlMongoDB);
  }
  await seedFromDataset(options);
  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error('Octaprice import failed:', error);
  try {
    await mongoose.connection.close();
  } catch (closeError) {
    // Ignore close errors after a failed import.
  }
  process.exit(1);
});
