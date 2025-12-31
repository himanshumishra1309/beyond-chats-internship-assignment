import { useState, useEffect } from 'react';
import { getOriginalArticles } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import Loader from '../components/Loader';

function OriginalArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await getOriginalArticles();
        setArticles(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-16 px-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Original BeyondChats Articles
        </h1>
        <p className="text-gray-500 text-lg">Scraped directly from BeyondChats blog</p>
      </header>

      {articles.length === 0 ? (
        <div className="text-center py-16 px-8">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No articles yet</h2>
          <p className="text-gray-500">Run the BeyondChats scraper to fetch original articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} type="original" />
          ))}
        </div>
      )}
    </div>
  );
}

export default OriginalArticles;
