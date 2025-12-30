import mongoose, {Schema} from "mongoose";

const googleScrapedArticleSchema = new Schema({
    article_id: {
        type: Schema.Types.ObjectId,
        ref: "Article"
    },
    sourceUrl: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    contentText: article.textContent,
    contentHtml: article.content,
    length: article.length,
    excerpt: article.excerpt,
}, {timestamps: true});

export const GoogleScrapedArticle = mongoose.model('GoogleScrapedArticle', googleScrapedArticleSchema)