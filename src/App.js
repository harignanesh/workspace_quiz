import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import QuizPage from './QuizPage';
import AdminInsertQuestion from './AdminInsertQuestion';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Add admin state

  // Make setShowSignup available globally for LoginPage link
  window.setShowSignup = setShowSignup;

  const handleLogin = (email) => {
    setUser({ email });
    if (email === 'harignanesh18@gmail.com' || email ==='radhakrishnan132005@gmail.com' ) setIsAdmin(true); // Example admin check
  };
  const handleSignup = (userObj) => {
    if (userObj) setUser(userObj);
    setShowSignup(false);
  };

  return (
    <Router>
      <div className="App">
        {isAdmin ? (
          <AdminInsertQuestion />
        ) : !user ? (
          showSignup ? (
            <SignupPage onSignup={handleSignup} />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        ) : (
          <QuizPage user={user} />
        )}
        {/* The sign up link is now handled inside LoginPage */}
      </div>
    </Router>
  );
}

export default App;
