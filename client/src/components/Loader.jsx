function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-gray-500">Loading articles...</p>
    </div>
  );
}

export default Loader;
