import { useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SignupPage = ({ onSignupComplete, onBackToHome, onLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Create Firestore user document with basic info
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileComplete: false
      });

      console.log('User registered:', { user, formData });
      
      // Redirect to questionnaire
      if (onSignupComplete) {
        onSignupComplete({ ...formData, uid: user.uid });
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Invalid email address.');
      } else {
        setAuthError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setAuthError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user document with Google profile data
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: user.displayName || '',
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileComplete: false,
        authProvider: 'google'
      }, { merge: true });

      console.log('Google signup complete:', user);

      // Redirect to questionnaire
      if (onSignupComplete) {
        onSignupComplete({ uid: user.uid, email: user.email });
      }
    } catch (error) {
      console.error('Google signup error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // User closed popup, no need to show error
      } else {
        setAuthError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Shine - Same as landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <button
            onClick={onBackToHome}
            className="text-gray-100 hover:text-green-300 mb-6 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Error Alert */}
          {authError && (
            <div className="mb-6 bg-red-900/20 border-2 border-red-400/50 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-400 font-semibold">Sign up failed</h3>
                <p className="text-red-300 text-sm mt-1">{authError}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-gray-950/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-green-400/30 shadow-2xl shadow-green-400/20">
                

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-3">
                Create Your Account
              </h2>
              <p className="text-gray-100 text-lg">
                Join MoneyAura and start your financial journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-100 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-100 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                    />
                    {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-100 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                      placeholder="+91 98765 43210"
                    />
                    {errors.phoneNumber && <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-100 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                      placeholder="Minimum 8 characters"
                    />
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-100 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                      placeholder="Re-enter your password"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Sign Up Button */}
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
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-950/70 text-gray-400">or</span>
                    </div>
                  </div>

                  {/* Google Sign Up */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full bg-gray-900 text-gray-100 py-4 rounded-xl font-semibold hover:bg-gray-800 transition duration-200 shadow-lg border-2 border-gray-700 hover:border-green-400/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    {loading ? 'Signing up...' : 'Sign up with Google'}
                  </button>
            </form>

            {/* Already have account */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => onLogin && onLogin()}
                  className="text-green-300 hover:text-green-200 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
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

export default SignupPage;
