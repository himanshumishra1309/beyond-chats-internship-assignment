import axios from "axios";
import * as cheerio from 'cheerio'
import { ApiError } from "../utils/ApiError";

async function doGoogleSearch(title){
    try {
        const params = {
            api_key: process.env.SERP_API_KEY,
            engine: 'google',
            q: title,
            num: 5,
            gl: 'us',
            hl: 'en'
        }
        
        const response = await axios.get('https://serpapi.com/search', {
            params,
            timeout: 10000
        });

        const results = response.data.organic_results || [0];
        const searchedBlogs = results.filter( result => {
            const url = result.link.toLowerCase();
            return !url.includes('wikipedia') && 
               !url.includes('youtube') &&
               !url.includes('beyondchats.com');
        }).slice(0,2).map(result => ({
            title: result.title,
            url: result.link,
            snippet: result.snippet
        }));

        return searchedBlogs

    } catch (error) {
        throw new ApiError(error.response?.status, error.response?.data?.message);
    }
}

async function scrapeSearchedArticles(){
    try {
        
    } catch (error) {
        
    }
}