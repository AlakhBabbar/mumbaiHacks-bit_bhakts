import { useState, useEffect } from 'react';
import AboutPage from './aboutPage';
import LoginPage from './loginPage';

const LandingPage = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  // Animated letters for MoneyAura
  const letters = "MoneyAura".split("");
  
  if (showLogin) {
    return <LoginPage onLogin={onLogin} onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden transition-all duration-700">
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

