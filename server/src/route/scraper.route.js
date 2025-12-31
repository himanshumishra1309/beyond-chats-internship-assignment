import express from 'express';
import { scrapeBeyondChatsArticles, scrapeGoogleArticles } from '../controller/scraper.controller';

const router = express.Router();

router.post('/scrape-beyond-chats', scrapeBeyondChatsArticles);
router.post('/scrape-google-article', scrapeGoogleArticles);

export default router;