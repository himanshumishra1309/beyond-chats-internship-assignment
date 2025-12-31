import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OriginalArticles from './pages/OriginalArticles';
import ArticleDetail from './pages/ArticleDetail';
import OriginalArticleDetail from './pages/OriginalArticleDetail';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="flex-1 pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/original" element={<OriginalArticles />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/original/:id" element={<OriginalArticleDetail />} />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-white/70 text-center py-6 text-sm">
          <p>© 2025 BeyondChats Article Scraper & LLM Enhancer</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
