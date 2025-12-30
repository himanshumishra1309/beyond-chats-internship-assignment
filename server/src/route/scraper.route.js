import express from 'express';
import { scrapeBeyondChatsArticles } from '../controller/scraper.controller';

const router = express.Router();

router.post('/scrape-beyond-chats', scrapeBeyondChatsArticles);