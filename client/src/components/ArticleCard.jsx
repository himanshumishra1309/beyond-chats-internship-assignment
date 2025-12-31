import { Link } from 'react-router-dom';

function ArticleCard({ article, type = 'updated' }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const linkPath = type === 'updated' 
    ? `/article/${article._id}` 
    : `/original/${article._id}`;

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {article.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <span>👤</span> {article.author || 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <span>📅</span> {formatDate(article.publishedDate)}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2">
          {article.title}
        </h2>
        
        <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
          {truncateText(article.excerpt || article.contentText)}
        </p>
        
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <Link 
          to={linkPath} 
          className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-3 px-6 rounded-lg font-semibold no-underline hover:opacity-90 transition-all hover:translate-x-1"
        >
          Read Full Article →
        </Link>
      </div>
    </article>
  );
}

export default ArticleCard;
