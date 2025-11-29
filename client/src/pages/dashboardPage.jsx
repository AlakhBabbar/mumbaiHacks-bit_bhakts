import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import LockedWidget from '../components/LockedWidget';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData({ uid: user.uid, ...userDoc.data() });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Define widget configurations based on user type
  const getWidgetsByUserType = (userType) => {
    const commonWidgets = [
      {
        title: 'Mutual Funds',
        description: 'Track your mutual fund investments and SIP performance',
        icon: '📊',
        color: 'from-purple-400 to-pink-500',
        size: 'medium'
      },
      {
        title: 'Goal Tracker',
        description: 'Set and monitor your financial goals with AI recommendations',
        icon: '🎯',
        color: 'from-blue-400 to-cyan-500',
        size: 'medium'
      }
    ];

    switch (userType?.toLowerCase()) {
      case 'student':
        return [
          {
            title: 'Spending Tracker',
            description: 'Monitor your daily expenses and categorize spending habits',
            icon: '💳',
            color: 'from-emerald-400 to-emerald-400',
            size: 'large'
          },
          {
            title: 'Budget Alerts',
            description: 'Get notified when you exceed your budget limits',
            icon: '🔔',
            color: 'from-orange-400 to-red-500',
            size: 'medium'
          },
          ...commonWidgets
        ];

      case 'trader':
      case 'investor':
        return [
          {
            title: 'Stock Portfolio',
            description: 'Real-time portfolio tracking with P&L analysis and market insights',
            icon: '📈',
            color: 'from-emerald-400 to-emerald-400',
            size: 'wide'
          },
          {
            title: 'Market Insights',
            description: 'AI-powered stock recommendations and market analysis',
            icon: '🤖',
            color: 'from-blue-400 to-cyan-500',
            size: 'medium'
          },
          ...commonWidgets
        ];

      case 'entrepreneur':
        return [
          {
            title: 'Business Finances',
            description: 'Track employee salaries, operational costs, and revenue',
            icon: '💼',
            color: 'from-emerald-400 to-emerald-400',
            size: 'large'
          },
          {
            title: 'Salary Management',
            description: 'Manage employee payroll and compensation',
            icon: '💰',
            color: 'from-blue-400 to-cyan-500',
            size: 'medium'
          },
          {
            title: 'Deployment Costs',
            description: 'Monitor infrastructure and deployment expenses',
            icon: '🖥️',
            color: 'from-purple-400 to-pink-500',
            size: 'medium'
          },
          {
            title: 'Marketing Budget',
            description: 'Track marketing spend and campaign ROI',
            icon: '📢',
            color: 'from-orange-400 to-red-500',
            size: 'medium'
          },
          ...commonWidgets
        ];

      case 'professional':
        return [
          {
            title: 'Salary Insights',
            description: 'Analyze your income, deductions, and tax planning',
            icon: '💵',
            color: 'from-emerald-400 to-emerald-400',
            size: 'medium'
          },
          {
            title: 'Expense Manager',
            description: 'Categorize and track monthly expenses',
            icon: '📊',
            color: 'from-blue-400 to-cyan-500',
            size: 'medium'
          },
          ...commonWidgets
        ];

      case 'freelancer':
        return [
          {
            title: 'Income Tracker',
            description: 'Monitor project payments and invoices',
            icon: '💸',
            color: 'from-emerald-400 to-emerald-400',
            size: 'large'
          },
          {
            title: 'Client Management',
            description: 'Track clients, projects, and payment schedules',
            icon: '👥',
            color: 'from-blue-400 to-cyan-500',
            size: 'medium'
          },
          ...commonWidgets
        ];

      default:
        return [
          {
            title: 'Financial Overview',
            description: 'Get started by connecting your accounts',
            icon: '📊',
            color: 'from-emerald-400 to-emerald-400',
            size: 'large'
          },
          ...commonWidgets
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-400 text-xl">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  const widgets = getWidgetsByUserType(userData?.userType);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-400 mb-2">
              Welcome back, {userData?.fullName?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-gray-500 text-sm">
              {userData?.userType ? `${userData.userType} dashboard` : 'Your financial dashboard'}
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-gray-500 mb-1">Connected Accounts</p>
              <p className="text-2xl font-semibold text-white">0</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-gray-500 mb-1">Active Widgets</p>
              <p className="text-2xl font-semibold text-white">0/{widgets.length}</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-gray-500 mb-1">Goals Set</p>
              <p className="text-2xl font-semibold text-white">0</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-gray-500 mb-1">Completion</p>
              <p className="text-2xl font-semibold text-white">0%</p>
            </div>
          </div>

          {/* Widgets Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Financial Widgets</h2>
              <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-gray-500">
                <span className="text-white font-medium">{userData?.userType || 'Default'}</span>
              </div>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-auto">
              {widgets.map((widget, index) => (
                <LockedWidget
                  key={index}
                  title={widget.title}
                  description={widget.description}
                  icon={widget.icon}
                  color={widget.color}
                  size={widget.size}
                />
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-2">Getting Started</h3>
              <p className="text-gray-500 text-sm mb-4">
                Connect your bank accounts, trading platforms, or manually add your financial data to unlock these widgets.
              </p>
              <button className="bg-emerald-400 text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-300 transition-colors">
                Connect Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
