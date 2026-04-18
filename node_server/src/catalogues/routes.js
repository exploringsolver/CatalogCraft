// src/catalogue/routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const catalogueController = require('./controllers/catalogueController');
const auth = require('../../middlewares/auth');

// Multer: store uploaded files in memory for processing
const upload = multer({ storage: multer.memoryStorage() });

router.get('/get', auth, catalogueController.getUserCatalogues);
router.get('/get-by-id/:id', catalogueController.getCatalogueById);
router.get('/get-sellercatalogue-by-id/:id', catalogueController.getSellerCatalogueById);
router.get('/get-by-category/:category', catalogueController.getCataloguesByCategory);
router.get('/get-all-by-category', catalogueController.getAllCataloguesByCategory);
router.post('/create', auth, catalogueController.createCatalogue);
router.put('/update-sellercatalogue/:id', auth, catalogueController.updateSellerCatalogue);
router.delete('/delete-sellercatalogue/:id', auth, catalogueController.deleteSellerCatalogue);
router.get('/get-all', catalogueController.getAllCatalogues);
router.get('/categories', catalogueController.getAllCategories);
router.get('/try', catalogueController.trial);
router.post('/csv', catalogueController.uploadCSV);
router.post('/create-category', catalogueController.createCategory);
router.post('/search-similar-images', catalogueController.searchSimilarImages);
router.get('/template-catalogues/:template_name', catalogueController.getTemplateCatalogues);
router.get('/search-catalogues', catalogueController.searchCatalogues);
router.get('/templates', catalogueController.getAllTemplates);
router.get('/lookup/:ean', catalogueController.eanLookup);
router.get('/bulk-template', catalogueController.downloadBulkTemplate);
router.post(
  '/upload-catalogue',
  upload.fields([{ name: 'excel_file', maxCount: 1 }, { name: 'zip_file', maxCount: 1 }]),
  catalogueController.uploadCatalogue
);
router.post(
  '/upload-save-catalogue',
  auth,
  upload.fields([{ name: 'excel_file', maxCount: 1 }, { name: 'zip_file', maxCount: 1 }]),
  catalogueController.uploadAndSaveCatalogue
);
router.get('/export/all-catalogues', auth, catalogueController.exportAllCatalogues);
router.get('/export/seller-catalogues', auth, catalogueController.exportSellerCatalogues);

module.exports = router;
