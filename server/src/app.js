import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
    {
        origin : process.env.CORS_ORIGIN,
        credentials: true
    }
));

app.use(express.json({limit: '20kb'}));

app.use(express.urlencoded({extended: true, limit: '20kb'}));

app.use(cookieParser());

app.get('/', (req, res)=>{
    res.json("Healthy Server");
})

import scraperRouter from './route/scraper.route.js';
import articleRouter from './route/article.route.js';
import originalArticleRouter from './route/originalArticle.route.js'

app.use('/api/v1/scraper', scraperRouter);
app.use('/api/v1/updated-articles', articleRouter)
app.use('/api/v1/original-articles', originalArticleRouter)

export {app}