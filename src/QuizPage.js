import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import './QuizPage.css';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds

  useEffect(() => {
    // Fetch available categories
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const cats = [...new Set(querySnapshot.docs.map(doc => doc.data().category))];
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch questions when category is selected
    const fetchQuestions = async () => {
      if (!selectedCategory) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'questions'), 
          where('category', '==', selectedCategory)
        );
        const querySnapshot = await getDocs(q);
        const questionList = querySnapshot.docs.map(doc => doc.data());
        setQuestions(questionList);
        setCurrent(0);
        setSelected(null);
        setShowThankYou(false);
        setTimeLeft(60 * 60);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCategory]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0 && !showThankYou) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowThankYou(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showThankYou]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionClick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setShowThankYou(true);
    }
  };

  const handleEndQuiz = () => {
    setShowThankYou(true);
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-spinner">Loading questions...</div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="quiz-container thankyou-page">
        <h2>Thank You!</h2>
        <p>Your quiz is completed.</p>
        <button className="restart-btn" onClick={() => window.location.reload()}>Take Another Quiz</button>
      </div>
    );
  }

  return (
    <div className="quiz-container modern-quiz">
      <div className="quiz-header">
        <div className="category-selector">
          <label>Select Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
      </div>

      <div className="question-section">
        <div className="question-count">
          Question {current + 1} of {questions.length}
        </div>
        <div className="question-text modern-question-font">{questions[current].question}</div>
      </div>

      <div className="options-container modern-options-scroll">
        {Array.isArray(questions[current]?.options) ? (
          questions[current].options.map((option, idx) => (
            <button
              key={idx}
              className={`option-button modern-option-btn ${selected === idx ? 'selected' : ''}`}
              onClick={() => handleOptionClick(idx)}
              disabled={selected !== null}
            >
              <span className="option-label">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))
        ) : (
          <div className="loading-spinner">No options available for this question.</div>
        )}
      </div>

      <div className="quiz-actions">
        <button className="endquiz-btn" onClick={handleEndQuiz}>End Quiz</button>
        {selected !== null && (
          <button 
            className="next-button"
            onClick={handleNext}
          >
            {current === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
