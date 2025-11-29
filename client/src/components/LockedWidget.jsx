const LockedWidget = ({ title, description, icon, color = 'from-emerald-400 to-emerald-400', size = 'medium' }) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1 min-h-[200px]',
    medium: 'col-span-1 row-span-1 min-h-[220px]',
    large: 'col-span-2 row-span-1 min-h-[220px]',
    tall: 'col-span-1 row-span-2 min-h-[400px]',
    wide: 'col-span-2 row-span-2 min-h-[450px]'
  };

  return (
    <div className={`${sizeClasses[size]} relative group`}>
      {/* Main Card */}
      <div className="h-full bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors duration-200 overflow-hidden">
        {/* Locked Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
          {/* Lock Icon */}
          <div className="mb-4">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-base font-semibold text-white mb-2 text-center">{title}</h3>
          <p className="text-xs text-gray-500 text-center mb-4">{description}</p>

          {/* Unlock Button */}
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors">
            Connect to Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockedWidget;
