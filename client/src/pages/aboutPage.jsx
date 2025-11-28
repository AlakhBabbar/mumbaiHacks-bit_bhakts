const AboutPage = ({ onGetStarted }) => {
  return (
    <div className="relative z-10 min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            What is <span className="text-transparent bg-clip-text bg-linear-to-r from-green-300 to-emerald-300">MoneyAura</span>?
          </h2>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Your intelligent companion that transforms how you manage money through AI-driven insights and motivation
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-gray-950/70 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl hover:shadow-green-400/30 transition-all duration-300 border border-green-400/30">
            <div className="flex items-start gap-4">
              <div className="bg-green-400 p-3 rounded-xl shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-300 mb-2">AI-Driven Insights</h3>
                <p className="text-gray-100">
                  Get personalized recommendations and real-time alerts that adapt to your spending patterns
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-950/70 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl hover:shadow-emerald-400/30 transition-all duration-300 border border-emerald-400/30">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-400 p-3 rounded-xl shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-300 mb-2">Achievement System</h3>
                <p className="text-gray-100">
                  Earn badges, unlock quests, and stay motivated as you hit your financial milestones
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-950/70 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl hover:shadow-teal-400/30 transition-all duration-300 border border-teal-400/30">
            <div className="flex items-start gap-4">
              <div className="bg-teal-400 p-3 rounded-xl shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-teal-300 mb-2">Voice & Chat Assistant</h3>
                <p className="text-gray-100">
                  Talk to your AI coach anytime - get instant answers about your finances
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-gray-950/70 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl hover:shadow-cyan-400/30 transition-all duration-300 border border-cyan-400/30">
            <div className="flex items-start gap-4">
              <div className="bg-cyan-400 p-3 rounded-xl shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Quest-Based Motivation</h3>
                <p className="text-gray-100">
                  New challenges every day keep you engaged and moving toward your goals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-linear-to-r from-green-400 to-emerald-400 rounded-3xl p-12 text-black shadow-2xl shadow-green-400/40">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Financial Journey?
          </h3>
          <p className="text-xl mb-8 text-gray-900">
            Join thousands making smarter money decisions every day
          </p>
          <button
            onClick={onGetStarted}
            className="bg-black text-green-300 px-12 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition shadow-2xl border-2 border-green-400 transform hover:scale-105"
          >
            Start Your Journey Now
          </button>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-200">
            <span className="font-semibold text-green-300">Mumbai Hackathon 2025</span> • RBI AA-Ready • Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
