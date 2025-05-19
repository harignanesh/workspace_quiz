import React, { useState } from 'react';
import './LoginPage.css';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-logo" style={{cursor: 'pointer'}} onClick={() => { if (typeof window.setShowSignup === 'function') window.setShowSignup(false); }}>
          QuizMaster
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
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          <button className="login-btn" type="submit">Sign in</button>
          <button className="google-btn" type="button" onClick={handleGoogleSignIn}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            Sign in with Google
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="login-signup">
          Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); if (typeof window.setShowSignup === 'function') window.setShowSignup(true); }}>Sign up</a>
        </div>
      </div>
      <div className="login-right">
        <img src="https://assets-global.website-files.com/5e9aa66fd3886c1ecf5b5c2b/63e3b2e2b1c1b2b1b1b1b1b1_illustration.svg" alt="Welcome" className="login-illustration" />
      </div>
    </div>
  );
};

export default LoginPage;
