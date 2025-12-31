import {GoogleGenAI} from '@google/genai'
import { ApiError } from '../utils/ApiError.js'

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function generatedUpdatedArticle(originalArticle, referenceArticles){
    try {
        if(!process.env.GEMINI_API_KEY){
            throw new ApiError(404, "Gemini api key not found");
        }
        
        if (!originalArticle || !referenceArticles || referenceArticles.length === 0) {
            throw new ApiError(400, 'Original article and reference articles are required');
        }

        console.log("llm started:")
        
        const prompt = buildPrompt(originalArticle, referenceArticles);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        })

        const generatedText = response.text;

        if (!generatedText) {
            throw new ApiError(500, 'LLM returned empty response');
        }
        
        const result = {
            contentHtml: generatedText,
            contentText: stripHtml(generatedText)
        }

        console.log("llm completed task: ", result);

        return result;
        
    } catch (error) {
        console.error('LLM processing error:', error.message);
        throw new ApiError(
            error.statusCode || 500,
            error.message || 'LLM processing failed'
        );

    }
}

function buildPrompt(originalArticle, referenceArticles) {
    const ref1 = referenceArticles[0];
    const ref2 = referenceArticles[1] || null;

    return `
You are an expert content writer and SEO specialist. Your task is to UPDATE an original article by making its formatting and content SIMILAR to top-ranking articles from Google search results.

## ORIGINAL ARTICLE TO UPDATE:
**Title:** ${originalArticle.title}
**Content:**
${originalArticle.contentText || originalArticle.excerpt}

---

## TOP RANKING REFERENCE ARTICLE 1 (from Google Search):
**Title:** ${ref1.title}
**Source:** ${ref1.sourceUrl}
**Content:**
${ref1.contentText || ref1.excerpt}

---

${ref2 ? `
## TOP RANKING REFERENCE ARTICLE 2 (from Google Search):
**Title:** ${ref2.title}
**Source:** ${ref2.sourceUrl}
**Content:**
${ref2.contentText || ref2.excerpt}

---
` : ''}

## YOUR TASK:
Update the ORIGINAL article by making its formatting and content SIMILAR to the reference articles:

1. **ANALYZE** the reference articles:
   - How are they structured? (headings, subheadings, sections)
   - What is their writing style? (formal, casual, technical)
   - What formatting do they use? (bullet points, numbered lists, quotes)
   - What content topics do they cover?

2. **UPDATE** the original article to match:
   - Use SIMILAR heading structure as reference articles
   - Use SIMILAR paragraph length and writing style
   - Use SIMILAR formatting patterns (lists, bold, emphasis)
   - Include SIMILAR content depth and topics covered
   - Keep the original article's core message but enhance it

3. **IMPORTANT:**
   - The updated article should look and read like it belongs with the reference articles
   - It should be competitive with these top-ranking Google results
   - Maintain professional quality throughout

## OUTPUT REQUIREMENTS:
- Return ONLY clean HTML content (no markdown, no code blocks)
- Use proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <strong>, <em>
- Do NOT include <html>, <head>, <body>, or DOCTYPE tags
- Match the formatting style of the reference articles
- Length: Similar to the reference articles

## MANDATORY - CITATIONS SECTION:
You MUST add a "References" section at the very end of the article citing the source articles:

<h3>References</h3>
<p>This article was enhanced using insights from the following sources:</p>
<ul>
<li><a href="${ref1.sourceUrl}" target="_blank">${ref1.title}</a></li>
${ref2 ? `<li><a href="${ref2.sourceUrl}" target="_blank">${ref2.title}</a></li>` : ''}
</ul>

Now generate the updated article in HTML format:
`;
}

function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export {generatedUpdatedArticle}