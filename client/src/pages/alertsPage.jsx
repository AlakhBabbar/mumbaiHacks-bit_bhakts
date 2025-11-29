import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const AlertsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">
              Smart Alerts
            </h1>
            <p className="text-gray-500 text-sm">
              Get notified about important financial events and opportunities
            </p>
          </div>

          {/* Coming Soon State */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-semibold text-white mb-3">Coming Soon</h2>
            <p className="text-gray-500 text-center max-w-md mb-6 text-sm">
              We're developing smart alerts that will notify you about budget limits, investment opportunities, and more.
            </p>
            <button className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
