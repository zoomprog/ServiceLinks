import { Router } from "express";
import * as urlController from '../controllers/urlController.js';
import { rateLimitMiddleware } from '../middlewares/rateLimit.js';

const router = Router();

router.get('/token', urlController.getToken);
router.post('/shorten', rateLimitMiddleware, urlController.createShortUrl);
router.get('/stats/:code', urlController.getStats);
router.get('/:shortId', urlController.redirectShortUrl);

export default router; 