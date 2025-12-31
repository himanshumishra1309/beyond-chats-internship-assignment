import { Article } from "../model/article.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find();

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

const getArticleById = asyncHandler(async (req, res)=>{
    const article_id = req.params.id;

    if(!article_id){
        throw new ApiError(404, "No article id found");
    }

    const articleInfo = await Article.findById(article_id)
    .populate('originalArticleId', 'title blogUrl')
    .populate('referenceArticleIds', 'title sourceUrl excerpt');

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
});

const updateArticle = asyncHandler(async (req, res) => {
    const article_id = req.params.id;
    const updates = req.body;

    if (!article_id) {
        throw new ApiError(400, "Article ID is required");
    }

    const updatedArticle = await Article.findByIdAndUpdate(
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

const deleteArticle = asyncHandler(async (req, res) => {
    const article_id = req.params.id;

    if (!article_id) {
        throw new ApiError(400, "Article ID is required");
    }

    const deletedArticle = await Article.findByIdAndDelete(article_id);

    if (!deletedArticle) {
        throw new ApiError(404, "Article not found");
    }

    res.status(200).json(
        new ApiResponse(200, deletedArticle, "Article deleted successfully")
    );
});

export { getAllArticles, getArticleById, updateArticle, deleteArticle }