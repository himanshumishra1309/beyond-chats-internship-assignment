import mongoose, {Schema} from "mongoose";

const articleSchema = new Schema({
    
}, {timestamps: true});

export const Article = mongoose.model('Article', articleSchema);