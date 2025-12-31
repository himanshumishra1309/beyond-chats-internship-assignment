import express from 'express';
import { getOriginalArticleById, deleteOriginalArticle, getAllOriginalArticles, updateOriginalArticle } from '../controller/originalArticle.controller.js';

const router = express.Router();

router.get('/articles', getAllOriginalArticles);
router.get('/article/:id', getOriginalArticleById);
router.put('/article/:id', updateOriginalArticle);
router.delete('/article/:id', deleteOriginalArticle);

export default router;