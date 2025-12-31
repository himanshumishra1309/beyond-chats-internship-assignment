import mongoose, {Schema} from "mongoose";

const beyondChatsBlogSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        index: true
    },
    slug:{
        type: String,
        unique: true,
        lowercase: true,
    },
    blogUrl:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    imageUrl:{
        type: String,
        trim: true
    },
    author:{
        type: String,
        required: true,
        trim: true,
        default: 'Unknown'
    },
    publishedDate:{
        type: Date,
        index: true
    },
    excerpt:{
        type: String,
        trim: true,
    },
    contentText: {
        type: String,
    },
    contentHtml:{
        type: String,
    },
    contentImages:{
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: [],
        index: true
    }
}, {timestamps: true});

export const BeyondChatsBlog = mongoose.model("BeyondChatsBlog", beyondChatsBlogSchema)