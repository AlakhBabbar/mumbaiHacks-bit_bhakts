import { useState } from 'react';

const LoginPage = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    if (onLogin) {
      onLogin();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden transition-all duration-700">
      {/* Animated Background Shine */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-300 rounded-full mix-blend-screen filter blur-3xl opacity-15"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-6xl bg-gray-950/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-green-400/30 border-2 border-green-400/40 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-400/20 to-emerald-400/20 border-b-2 border-green-400/40 p-8">
            <button
              onClick={onBack}
              className="text-green-300 hover:text-green-200 mb-4 flex items-center gap-2 transition-colors font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            
            <div className="text-center">
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-300 to-emerald-300 mb-3">
                {isLogin ? 'Welcome Back to MoneyAura' : 'Join MoneyAura'}
              </h2>
              <p className="text-xl text-gray-100 font-semibold">
                {isLogin ? 'Login to continue your financial journey' : 'Sign up and start your financial transformation'}
              </p>
            </div>
          </div>
          
          {/* Form Container */}
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isLogin ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Social Login */}
                  <div className="space-y-6 border-r-2 border-green-400/30 pr-8">
                    <div>
                      <h3 className="text-2xl font-bold text-green-300 mb-6">Quick Login</h3>
                      <div className="space-y-4">
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-gray-100 rounded-xl font-bold hover:bg-gray-800 transition border-2 border-green-400/40 hover:border-green-400/60 shadow-lg shadow-green-400/20"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </button>
                        
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-gray-100 rounded-xl font-bold hover:bg-gray-800 transition border-2 border-green-400/40 hover:border-green-400/60 shadow-lg shadow-green-400/20"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                          Continue with Apple
                        </button>

                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-gray-100 rounded-xl font-bold hover:bg-gray-800 transition border-2 border-green-400/40 hover:border-green-400/60 shadow-lg shadow-green-400/20"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Continue with Phone
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Email Login */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-green-300 mb-6">Login with Email</h3>
                    
                    <div>
                      <label htmlFor="email" className="block text-base font-bold text-gray-100 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition text-base font-semibold"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-base font-bold text-gray-100 mb-3">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition text-base font-semibold"
                        placeholder="Enter password"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-green-400 text-green-400 focus:ring-green-400 bg-gray-900" />
                        <span className="text-gray-100 font-bold">Remember me</span>
                      </label>
                      <a href="#" className="text-green-300 hover:text-green-200 font-bold transition-colors">
                        Forgot password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r from-green-400 to-emerald-400 text-black py-4 rounded-xl font-bold text-lg hover:from-green-300 hover:to-emerald-300 transition duration-200 shadow-lg shadow-green-400/50 hover:shadow-xl hover:shadow-green-400/70 border-2 border-green-300"
                    >
                      Login to MoneyAura
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6 border-r-2 border-green-400/30 pr-8">
                    <h3 className="text-2xl font-bold text-green-300 mb-6">Create Your Account</h3>
                    
                    <div>
                      <label htmlFor="name" className="block text-base font-bold text-gray-100 mb-3">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition text-base font-semibold"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-base font-bold text-gray-100 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition text-base font-semibold"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-base font-bold text-gray-100 mb-3">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition text-base font-semibold"
                        placeholder="Create a strong password"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column - Financial Profile */}
                  <div className="space-y-6">
                    <div className="bg-green-400/10 border-2 border-green-400/30 rounded-2xl p-6">
                      <h3 className="text-2xl font-bold text-green-300 mb-3">Your Financial Profile</h3>
                      <p className="text-base text-gray-100 font-semibold mb-6">Help us personalize your MoneyAura experience</p>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-base font-bold text-gray-100 mb-3">
                            What's your spending style?
                          </label>
                          <select className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 outline-none transition font-semibold">
                            <option value="">Select your style</option>
                            <option value="careful">Careful Planner - I track every rupee</option>
                            <option value="balanced">Balanced - I save but also enjoy life</option>
                            <option value="spontaneous">Spontaneous - I believe in living in the moment</option>
                            <option value="impulsive">Impulsive - I buy what makes me happy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-base font-bold text-gray-100 mb-3">
                            What interests you most? (Select all that apply)
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 border-2 border-green-400/40 rounded-xl hover:border-green-400/60 transition">
                              <input type="checkbox" name="interests" value="saving" className="w-5 h-5 rounded border-green-400 text-green-400 focus:ring-green-400 bg-gray-900" />
                              <span className="text-gray-100 font-semibold">Building savings for the future</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 border-2 border-green-400/40 rounded-xl hover:border-green-400/60 transition">
                              <input type="checkbox" name="interests" value="investing" className="w-5 h-5 rounded border-green-400 text-green-400 focus:ring-green-400 bg-gray-900" />
                              <span className="text-gray-100 font-semibold">Growing wealth through stocks & investments</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 border-2 border-green-400/40 rounded-xl hover:border-green-400/60 transition">
                              <input type="checkbox" name="interests" value="debt" className="w-5 h-5 rounded border-green-400 text-green-400 focus:ring-green-400 bg-gray-900" />
                              <span className="text-gray-100 font-semibold">Getting out of debt</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 border-2 border-green-400/40 rounded-xl hover:border-green-400/60 transition">
                              <input type="checkbox" name="interests" value="experience" className="w-5 h-5 rounded border-green-400 text-green-400 focus:ring-green-400 bg-gray-900" />
                              <span className="text-gray-100 font-semibold">Spending on experiences & happiness</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-900 border-2 border-green-400/40 rounded-xl hover:border-green-400/60 transition">
                              <input type="checkbox" name="interests" value="balance" className="w-5 h-5 rounded border-green-400 text-green-400 focus:ring-green-400 bg-gray-900" />
                              <span className="text-gray-100 font-semibold">Finding the right balance</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-base font-bold text-gray-100 mb-3">
                            Your financial goals are...
                          </label>
                          <select className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 outline-none transition font-semibold">
                            <option value="">Select goal type</option>
                            <option value="specific">Specific & Time-bound (Buy house, car, etc.)</option>
                            <option value="flexible">Flexible - I'll see how it goes</option>
                            <option value="ambitious">Ambitious - Early retirement, financial freedom</option>
                            <option value="exploring">Still exploring what I want</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-base font-bold text-gray-100 mb-3">
                            How do you make purchase decisions?
                          </label>
                          <select className="w-full px-5 py-4 bg-gray-900 border-2 border-green-400/40 text-gray-100 rounded-xl focus:ring-2 focus:ring-green-400 outline-none transition font-semibold">
                            <option value="">Select decision style</option>
                            <option value="research">Research thoroughly before buying</option>
                            <option value="compare">Compare prices & look for deals</option>
                            <option value="instant">Buy instantly when I like something</option>
                            <option value="emotional">Follow my heart & emotions</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r from-green-400 to-emerald-400 text-black py-4 rounded-xl font-bold text-lg hover:from-green-300 hover:to-emerald-300 transition duration-200 shadow-lg shadow-green-400/50 hover:shadow-xl hover:shadow-green-400/70 border-2 border-green-300"
                    >
                      Sign Up & Start Journey
                    </button>
                  </div>
                </div>
              )}
            </form>
            
            {/* Footer */}
            <div className="border-t-2 border-green-400/40 mt-8 pt-8">
              <div className="text-center">
                <p className="text-gray-100 text-lg font-bold">
                  {isLogin ? "New to MoneyAura? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-green-300 hover:text-green-200 font-bold transition-colors underline"
                  >
                    {isLogin ? 'Sign Up Here' : 'Login Here'}
                  </button>
                </p>
                
                <div className="mt-4 p-4 bg-green-400/20 border-2 border-green-400/40 rounded-xl">
                  <p className="text-base text-green-300 font-bold">
                    🎯 Demo Mode Active - Use any credentials to explore MoneyAura
                  </p>
                </div>
              </div>
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

export default LoginPage;
