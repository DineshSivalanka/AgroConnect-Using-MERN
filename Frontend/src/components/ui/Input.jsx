export function Input({ 
  label, 
  id, 
  error,
  className = '', 
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3 bg-gray-50 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium animate-pulse">{error}</p>
      )}
    </div>
  );
}
