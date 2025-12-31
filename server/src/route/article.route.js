import express from 'express';
import { getAllArticles,getArticleById, updateArticle, deleteArticle } from '../controller/article.controller.js';
const router = express.Router();

router.get('/articles', getAllArticles);
router.get('/article/:id', getArticleById);
router.put('/article/:id', updateArticle);
router.delete('/article/:id', deleteArticle);

export default router;