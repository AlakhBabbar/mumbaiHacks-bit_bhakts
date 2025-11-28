import { useState, useEffect } from 'react';
import AboutPage from './aboutPage';

const LandingPage = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
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

  // Animated letters for MoneyAura
  const letters = "MoneyAura".split("");
  
  if (showLogin) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-200">
            <button
              onClick={() => setShowLogin(false)}
              className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600 mb-2">
                {isLogin ? 'Welcome Back' : 'Join MoneyAura'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to continue' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Enter password"
                  required
                />
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition duration-200 shadow-lg hover:shadow-xl"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 text-center">
                Demo Mode - Use any credentials to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Shine */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-300 rounded-full mix-blend-screen filter blur-3xl opacity-15"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Animated MoneyAura Title */}
        <div className="mb-16 perspective-1000">
          <h1 className="text-8xl md:text-9xl font-bold text-center mb-4">
            {letters.map((letter, index) => (
              <span
                key={index}
                className="inline-block text-transparent bg-clip-text bg-linear-to-br from-green-300 via-emerald-400 to-teal-300 animate-letter-fall"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-center text-2xl text-gray-100 font-light animate-fade-in-up" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            Your AI-Powered Financial Coach
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '1.3s', animationFillMode: 'both' }}>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-linear-to-r from-green-400 to-emerald-400 text-black px-10 py-4 rounded-xl font-bold hover:from-green-300 hover:to-emerald-300 transition shadow-xl shadow-green-500/50 hover:shadow-2xl hover:shadow-green-400/60 text-lg transform hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-gray-900 text-green-300 px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-green-500/30 border-2 border-green-400/50 text-lg transform hover:scale-105"
          >
            Sign In
          </button>
        </div>

        {/* Tagline */}
        <p className="text-gray-100 text-center max-w-2xl animate-fade-in-up" style={{ animationDelay: '1.6s', animationFillMode: 'both' }}>
          Smart financial management powered by AI. Track, analyze, and optimize your money with intelligent insights.
        </p>
      </div>

      {/* About Section */}
      <AboutPage onGetStarted={() => setShowLogin(true)} />

      {/* CSS Animations */}
      <style>{`
        @keyframes letter-fall {
          0% {
            opacity: 0;
            transform: translateY(-100px) rotate(-45deg) scale(0);
          }
          50% {
            transform: translateY(10px) rotate(5deg) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

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

        .animate-letter-fall {
          animation: letter-fall 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
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

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

