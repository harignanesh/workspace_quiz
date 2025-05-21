import React, { useState } from 'react';
import './LoginPage.css';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import quiz from './../src/Mind-maps.jpg'; // Import the quiz image here

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="login-logo" style={{cursor: 'pointer'}} onClick={() => onSignup(null)}>
            QuizMaster
          </div>
          <button
            className="theme-btn"
            aria-label="Toggle theme"
            style={{ marginLeft: 'auto', marginRight: 0 }}
            onClick={() => {
              const newTheme = (document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
              document.body.setAttribute('data-theme', newTheme);
              localStorage.setItem('theme', newTheme);
            }}
          >
            {(document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'light') === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="login-welcome">
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--login-title, #222)' }}>Create your account</h1>
          <p style={{ color: 'var(--login-subtext, #888)', marginBottom: '2rem' }}>Sign up to get started</p>
        </div>
        <form className="login-form" style={{ maxWidth: 350, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            className=""
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            style={{}} />
          <label>Email address</label>
          <input
            type="email"
            className=""
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
          {/* <button className="google-btn" type="button" onClick={handleGoogleSignUp}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            Sign up with Google
          </button> */}
          {error && <div className="error">{error}</div>}
        </form>
        <div className="login-signup">
          Already have an account? <a href="#" onClick={() => onSignup(null)}>Sign in</a>
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
        <img src={quiz} alt="Quiz illustration for signup page" className="signup-illustration" />
      </div>
    </div>
  );
};

export default SignupPage;
