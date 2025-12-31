import mongoose, {Schema} from "mongoose";

const googleScrapedArticleSchema = new Schema({
    beyondChat_article_id: {
        type: Schema.Types.ObjectId,
        ref: "BeyondChatsBlog",
        required: true,
        index: true
    },
    sourceUrl: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    contentText: {
        type: String,
        required: true,
    },
    contentHtml:{
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: true,
    },
    excerpt: {
        type: String,
        required: true,
    }
}, {timestamps: true});

export const GoogleScrapedArticle = mongoose.model('GoogleScrapedArticle', googleScrapedArticleSchema)