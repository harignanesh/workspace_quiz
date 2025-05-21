import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import mind from './../src/Mind-maps.jpg';
import logo from './logo.svg';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(email);
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user.email);
    } catch (err) {
      setError('Google sign-in failed.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailToReset = email || window.prompt('Enter your email to reset password:');
    if (!emailToReset) {
      setResetMsg('Please enter your email address.');
      setTimeout(() => setResetMsg(''), 2500);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      setResetMsg('Password reset email sent! Check your inbox.');
    } catch (err) {
      setResetMsg('Failed to send reset email. Please check your email address.');
    }
    setTimeout(() => setResetMsg(''), 3500);
  };

return (
    <div className="login-root">
        <div className="login-left">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div className="login-logo" style={{cursor: 'pointer'}} onClick={() => { if (typeof window.setShowSignup === 'function') window.setShowSignup(false); }}>
                    QuizMaster
                </div>
                <button
                    className="theme-btn"
                    aria-label="Toggle theme"
                    style={{ marginLeft: 'auto', marginRight: 0 }}
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
            
            <div className="login-welcome">
                <h1>Welcome back</h1>
                <p>Please enter your details</p>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
                <label>Email address</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                />
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
                <div className="login-options">
                    <label className="remember-me">
                        <input type="checkbox" /> Remember for 30 days
                    </label>
                    <a href="#" className="forgot-password" onClick={handleForgotPassword}>Forgot password?</a>
                </div>
                <button className="login-btn" type="submit">Sign in</button>
                {/* <button className="google-btn" type="button" onClick={handleGoogleSignIn}>
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="google-icon" />
                    Sign in with Google
                </button> */}
                {error && <div className="error">{error}</div>}
                {resetMsg && <div className="error" style={{background:'#e0e7ff',color:'#2563eb',fontWeight:600,marginTop:8}}>{resetMsg}</div>}
            </form>
            <div className="login-signup">
                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); if (typeof window.setShowSignup === 'function') window.setShowSignup(true); }}>Sign up</a>
            </div>
        </div>
        <div className="login-right">
            <div className="floating-quiz-bg">
                <img src="https://img.icons8.com/color/48/000000/question-mark.png" className="floating-quiz-icon icon1" alt="Colorful question mark icon floating in a playful quiz themed background" />
                <img src="https://img.icons8.com/color/48/000000/light-on--v2.png" className="floating-quiz-icon icon2" alt="Yellow lightbulb icon representing ideas and inspiration floating in a cheerful quiz themed background" />
                <img src="https://img.icons8.com/color/48/000000/pencil--v2.png" className="floating-quiz-icon icon3" alt="Pencil icon symbolizing writing and answers floating in a lively quiz themed background" />
                <img src="https://img.icons8.com/color/48/000000/open-book--v2.png" className="floating-quiz-icon icon4" alt="Open book icon representing knowledge and learning floating in a bright quiz themed background" />
                <img src="https://img.icons8.com/color/48/000000/sun--v2.png" className="floating-quiz-icon icon5" alt="Sun icon radiating positivity and energy floating in a vibrant quiz themed background" />
          <img src="https://img.icons8.com/color/48/000000/idea.png" className="floating-quiz-icon icon6" alt="Idea" />
        </div>
        <img src={mind} alt="Mind maps illustration for quiz login" className="login-illustration" />
      </div>
  
    </div>
  );
};

export default LoginPage;
