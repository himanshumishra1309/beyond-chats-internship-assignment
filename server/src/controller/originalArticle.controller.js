import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BeyondChatsBlog } from "../model/beyondChatsBlog.model.js";

const getAllOriginalArticles = asyncHandler(async (req, res) => {
    const articles = await BeyondChatsBlog.find();

    if(!articles || articles.length === 0){
        throw new ApiError(404, "No Articles present");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            articles,
            "All articles fetched successfully"
        )
    )
});

const getOriginalArticleById = asyncHandler(async (req, res)=>{
    const article_id = req.params.id;

    if(!article_id){
        throw new ApiError(404, "No article id found");
    }

    const articleInfo = await BeyondChatsBlog.findById(article_id)

    if(!articleInfo){
        throw new ApiError(404, "No article with the mentioned id found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            articleInfo,
            "Article data fetched"
        )
    )
})

const updateOriginalArticle = asyncHandler(async (req, res) => {
    const article_id = req.params.id;
    const updates = req.body;

    if (!article_id) {
        throw new ApiError(400, "Article ID is required");
    }

    const updatedArticle = await BeyondChatsBlog.findByIdAndUpdate(
        article_id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updatedArticle) {
        throw new ApiError(404, "Article not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedArticle, "Article updated successfully")
    );
});

const deleteOriginalArticle = asyncHandler(async (req, res) => {
    const article_id = req.params.id;

    if (!article_id) {
        throw new ApiError(400, "Article ID is required");
    }

    const deletedArticle = await BeyondChatsBlog.findByIdAndDelete(article_id);

    if (!deletedArticle) {
        throw new ApiError(404, "Article not found");
    }

    res.status(200).json(
        new ApiResponse(200, deletedArticle, "Article deleted successfully")
    );
});

export { getAllOriginalArticles, getOriginalArticleById, updateOriginalArticle, deleteOriginalArticle }