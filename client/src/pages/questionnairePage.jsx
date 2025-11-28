import { useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const QuestionnairePage = ({ onComplete, onBackToHome }) => {
  const [formData, setFormData] = useState({
    userType: '',
    appPurpose: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePurposeToggle = (purpose) => {
    setFormData(prev => {
      const currentPurposes = prev.appPurpose;
      if (currentPurposes.includes(purpose)) {
        return {
          ...prev,
          appPurpose: currentPurposes.filter(p => p !== purpose)
        };
      } else {
        return {
          ...prev,
          appPurpose: [...currentPurposes, purpose]
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userType) {
      newErrors.userType = 'Please select what describes you best';
    }
    
    if (formData.appPurpose.length === 0) {
      newErrors.appPurpose = 'Please select at least one purpose';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAuthError('');

    try {
      const user = auth.currentUser;
      
      if (!user) {
        setAuthError('No user is logged in. Please sign up first.');
        setLoading(false);
        return;
      }

      // Update Firestore user document with questionnaire data
      await updateDoc(doc(db, 'users', user.uid), {
        userType: formData.userType,
        appPurpose: formData.appPurpose,
        updatedAt: serverTimestamp(),
        profileComplete: true
      });

      console.log('Questionnaire complete:', formData);
      
      if (onComplete) {
        onComplete(formData);
      }
    } catch (error) {
      console.error('Questionnaire error:', error);
      setAuthError('Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const userTypes = [
    { 
      id: 'student', 
      label: 'Student', 
      icon: <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
      desc: 'Learning to manage finances' 
    },
    { 
      id: 'professional', 
      label: 'Working Professional', 
      icon: <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      desc: 'Building wealth steadily' 
    },
    { 
      id: 'trader', 
      label: 'Active Trader', 
      icon: <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      desc: 'Regular market participation' 
    },
    { 
      id: 'investor', 
      label: 'Long-term Investor', 
      icon: <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      desc: 'Growing wealth over time' 
    },
    { 
      id: 'entrepreneur', 
      label: 'Entrepreneur', 
      icon: <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      desc: 'Managing business finances' 
    },
    { 
      id: 'freelancer', 
      label: 'Freelancer', 
      icon: <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      desc: 'Variable income management' 
    }
  ];

  const appPurposes = [
    { 
      id: 'track-spending', 
      label: 'Track My Spending', 
      icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      desc: 'Monitor daily expenses' 
    },
    { 
      id: 'portfolio-analysis', 
      label: 'Analyze Stock Portfolio', 
      icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      desc: 'Investment insights' 
    },
    { 
      id: 'financial-literacy', 
      label: 'Understand Money Better', 
      icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      desc: 'Learn & grow' 
    },
    { 
      id: 'goal-setting', 
      label: 'Set Financial Goals', 
      icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
      desc: 'Plan your future' 
    },
    { 
      id: 'budget-planning', 
      label: 'Budget Planning', 
      icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      desc: 'Smart money allocation' 
    },
    { 
      id: 'save-more', 
      label: 'Save More Effectively', 
      icon: <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
      desc: 'Build emergency fund' 
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-3">
              Let's Personalize
            </h1>
            <p className="text-gray-100 text-lg">
              Help us tailor MoneyAura to your needs
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-6 bg-red-900/20 border-2 border-red-400/50 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-400 font-semibold">Error</h3>
                <p className="text-red-300 text-sm mt-1">{authError}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-gray-950/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-green-400/30 shadow-2xl shadow-green-400/20">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* User Type Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-100 mb-4">
                  What describes you best?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'userType', value: type.id } })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.userType === type.id
                          ? 'bg-green-400/20 border-green-400 shadow-lg shadow-green-400/30'
                          : 'bg-gray-900/30 border-gray-700 hover:border-green-400/50 hover:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">{type.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-100">{type.label}</div>
                          <div className="text-sm text-gray-400">{type.desc}</div>
                        </div>
                        {formData.userType === type.id && (
                          <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.userType && <p className="text-red-400 text-sm mt-2">{errors.userType}</p>}
              </div>

              {/* App Purpose Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-100 mb-4">
                  What brings you to MoneyAura? <span className="text-sm font-normal text-gray-400">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {appPurposes.map((purpose) => (
                    <button
                      key={purpose.id}
                      type="button"
                      onClick={() => handlePurposeToggle(purpose.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.appPurpose.includes(purpose.id)
                          ? 'bg-emerald-400/20 border-emerald-400 shadow-lg shadow-emerald-400/30'
                          : 'bg-gray-900/30 border-gray-700 hover:border-emerald-400/50 hover:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">{purpose.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-100">{purpose.label}</div>
                          <div className="text-sm text-gray-400">{purpose.desc}</div>
                        </div>
                        {formData.appPurpose.includes(purpose.id) && (
                          <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.appPurpose && <p className="text-red-400 text-sm mt-2">{errors.appPurpose}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-black py-4 rounded-xl font-bold text-lg hover:from-green-300 hover:to-emerald-300 transition duration-200 shadow-xl shadow-green-400/30 hover:shadow-2xl hover:shadow-green-400/40 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </form>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-green-300">Secure</span> • End-to-End Encrypted • RBI AA-Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
