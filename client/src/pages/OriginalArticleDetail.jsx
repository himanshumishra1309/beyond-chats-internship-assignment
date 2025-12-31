import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOriginalArticleById } from '../services/api';
import Loader from '../components/Loader';

function OriginalArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await getOriginalArticleById(id);
        setArticle(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-16 px-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/original" className="text-indigo-500 font-medium hover:text-purple-600">← Back to Original Articles</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/original" className="inline-flex items-center text-indigo-500 font-medium mb-8 hover:text-purple-600 transition-colors">
        ← Back to Original Articles
      </Link>
      
      <article className="bg-white rounded-2xl overflow-hidden shadow-lg">
        {article.imageUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <header className="p-6 md:p-8 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <span>👤</span> {article.author || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <span>📅</span> {formatDate(article.publishedDate)}
            </span>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span key={index} className="bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="mx-6 md:mx-8 mb-4 inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium">
          <span>📰</span>
          <span>Original BeyondChats Article</span>
        </div>

        <div 
          className="px-6 md:px-8 pb-8 prose prose-lg max-w-none text-gray-700 leading-relaxed
            [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold
            [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold
            [&_p]:mb-4 [&_ul]:mb-4 [&_ol]:mb-4 [&_li]:mb-2
            [&_a]:text-indigo-500 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: article.contentHtml || article.contentText }}
        />

        {article.blogUrl && (
          <div className="mx-6 md:mx-8 mb-8 p-4 bg-gray-50 rounded-xl border-l-4 border-indigo-500">
            <h3 className="font-semibold text-gray-900 mb-2">🔗 Original Source</h3>
            <a 
              href={article.blogUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-500 font-medium hover:underline"
            >
              View on BeyondChats
            </a>
          </div>
        )}
      </article>
    </div>
  );
}

export default OriginalArticleDetail;
