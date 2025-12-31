import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4 md:px-8 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-white text-xl md:text-2xl font-bold no-underline hover:text-white">
          <span className="text-2xl">📝</span>
          <span className="tracking-tight">BeyondChats Articles</span>
        </Link>
        
        <div className="flex gap-2">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-lg font-medium transition-all no-underline
              ${location.pathname === '/' 
                ? 'bg-white/20 text-white' 
                : 'text-white/85 hover:bg-white/15 hover:text-white'}`}
          >
            Updated Articles
          </Link>
          <Link 
            to="/original" 
            className={`px-4 py-2 rounded-lg font-medium transition-all no-underline
              ${location.pathname === '/original' 
                ? 'bg-white/20 text-white' 
                : 'text-white/85 hover:bg-white/15 hover:text-white'}`}
          >
            Original Articles
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
