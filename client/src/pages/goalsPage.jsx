import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import ChatBot from '../components/ChatBot';
import { Plus, Target, TrendingUp, X } from 'lucide-react';

const GoalsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    category: 'Savings'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const goalsRef = collection(db, 'users', user.uid, 'goals');
        const q = query(goalsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const goalsData = [];
        snapshot.forEach(doc => {
          goalsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (currentAmount, targetAmount) => {
    return Math.min((currentAmount / targetAmount) * 100, 100).toFixed(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please login to create goals');
        return;
      }

      const goalData = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetDate: formData.targetDate || null,
        category: formData.category,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const goalsRef = collection(db, 'users', user.uid, 'goals');
      await addDoc(goalsRef, goalData);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        category: 'Savings'
      });
      setShowCreateModal(false);

      // Refresh goals
      await fetchGoals();

    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-400 text-xl">Loading goals...</div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex min-h-screen bg-black">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-400 mb-2">
                Financial Goals
              </h1>
              <p className="text-gray-500 text-sm">
                Set, track, and achieve your financial milestones
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-400 text-black px-5 py-3 rounded-lg font-medium hover:bg-emerald-300 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              Create Goal
            </button>
          </div>

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="bg-zinc-900 rounded-full p-6 mb-6 border border-zinc-800">
                <Target className="w-16 h-16 text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">No Goals Yet</h2>
              <p className="text-gray-500 text-center max-w-md mb-6 text-sm">
                Start setting your financial goals and track your progress towards achieving them.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-400 text-black px-6 py-3 rounded-lg font-medium hover:bg-emerald-300 transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, idx) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                return (
                  <div key={idx} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-emerald-400/30 transition-all">
                    {/* Goal Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-400/10 rounded-lg p-2">
                          <Target className="w-6 h-6 text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{goal.title}</h3>
                          <p className="text-gray-500 text-xs">{goal.category || 'General'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Goal Description */}
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                      {goal.description || 'No description provided'}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-xs">Progress</span>
                          <span className="text-emerald-400 text-sm font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Amount Details */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Current</p>
                          <p className="text-white font-semibold">₹{goal.currentAmount?.toLocaleString('en-IN') || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs mb-1">Target</p>
                          <p className="text-emerald-400 font-semibold">₹{goal.targetAmount?.toLocaleString('en-IN') || 0}</p>
                        </div>
                      </div>

                      {/* Target Date */}
                      {goal.targetDate && (
                        <div className="pt-2">
                          <p className="text-gray-500 text-xs">
                            Target: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-semibold text-white">Create New Goal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Buy a new car"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe your goal..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  <option value="Savings">Savings</option>
                  <option value="Investment">Investment</option>
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Education">Education</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Travel">Travel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Amount (₹) *
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="0.01"
                  placeholder="100000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              {/* Current Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Amount (₹)
                </label>
                <input
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-zinc-800 text-white px-5 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-emerald-400 text-black px-5 py-3 rounded-lg font-medium hover:bg-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating ChatBot */}
      <ChatBot />

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
      `}</style>
    </>
  );
};

export default GoalsPage;
