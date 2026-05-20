const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument, getStudentDocuments } = require('../controllers/documentController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/my-documents', protect, studentOnly, getStudentDocuments);
router.route('/').get(protect, adminOnly, getDocuments).post(protect, adminOnly, upload.single('file'), uploadDocument);
router.route('/:id').delete(protect, adminOnly, deleteDocument);

module.exports = router;
