import express from 'express';
import { scrapeBeyondChatsArticles, scrapeGoogleArticles, setLLMResponseForArticles} from '../controller/scraper.controller.js';

const router = express.Router();

router.get('/scrape-beyond-chats', scrapeBeyondChatsArticles);
router.get('/scrape-google-article', scrapeGoogleArticles);
router.get('/llm-response', setLLMResponseForArticles)

export default router;