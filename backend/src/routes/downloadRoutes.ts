import { Router } from 'express';
import {
  generateDownloadToken,
  streamDownload,
  listAdminDriveFiles,
} from '../controllers/downloadController.js';
import {
  authenticate,
  optionalAuthenticate,
  authorizeRoles,
} from '../middlewares/authMiddleware.js';

const router = Router();

// Generate a secure temporary download token for a purchased product
router.post('/generate-token', optionalAuthenticate, generateDownloadToken);

// Direct secure stream from Google Drive to user's browser (no Drive URL exposed)
router.get('/file', streamDownload);

// Admin can browse files in the configured Google Drive folder
router.get('/admin/files', authenticate, authorizeRoles('admin', 'superadmin'), listAdminDriveFiles);

export default router;

