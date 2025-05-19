import React, { useState } from 'react';
import './LoginPage.css';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

const SignupPage = ({ onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      onSignup(userCredential.user);
    } catch (err) {
      setError(err.message || 'Signup failed.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onSignup(result.user);
    } catch (err) {
      setError('Google sign-up failed.');
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-logo">QuizMaster</div>
        <div className="login-welcome">
          <h1>Create your account</h1>
          <p>Sign up to get started</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button className="login-btn" type="submit">Sign up</button>
          <button className="google-btn" type="button" onClick={handleGoogleSignUp}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            Sign up with Google
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="login-signup">
          Already have an account? <a href="#" onClick={() => onSignup(null)}>Sign in</a>
        </div>
      </div>
      <div className="login-right">
        <img src="https://assets-global.website-files.com/5e9aa66fd3886c1ecf5b5c2b/63e3b2e2b1c1b2b1b1b1b1b1_illustration.svg" alt="Welcome" className="login-illustration" />
      </div>
    </div>
  );
};

export default SignupPage;
