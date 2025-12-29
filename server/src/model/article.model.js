import mongoose, {Schema} from "mongoose";

const articleSchema = new Schema({
    title:{
        type: String,
        index: true,
    },
    blogUrl:{
        type: String,
    },
    imageUrl:{
        type: String,
    },
    author:{
        type: String,
    },
    publishedDate:{
        type: String,
    },
    excerpt:{
        type: String,
    },
    content: {
        type: String,
    },
    source:{
        type: String,
    },
    status: {
        type: String,
    }
}, {timestamps: true});

export const Article = mongoose.model('Article', articleSchema);