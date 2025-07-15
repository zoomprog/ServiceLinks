import { Router } from "express";
import * as urlController from '../controllers/urlController.js';

const router = Router();

router.get('/token', urlController.getToken);
router.post('/shorten', urlController.createShortUrl);
router.get('/stats/:code', urlController.getStats);
router.get('/:shortId', urlController.redirectShortUrl);

export default router; 