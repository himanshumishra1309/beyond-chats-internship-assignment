import express from 'express';
import { scrapeBeyondChatsArticles, scrapeGoogleArticles } from '../controller/scraper.controller.js';

const router = express.Router();

router.get('/scrape-beyond-chats', scrapeBeyondChatsArticles);
router.get('/scrape-google-article', scrapeGoogleArticles);

export default router;