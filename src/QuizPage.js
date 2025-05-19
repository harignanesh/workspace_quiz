import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import './QuizPage.css';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
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
        setScore(0);
        setShowResult(false);
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
    if (timeLeft > 0 && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowResult(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showResult]);

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
    if (selected === questions[current].answer) {
      setScore(score + 1);
    }
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-spinner">Loading questions...</div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="quiz-container">
        <div className="result-card">
          <h2>Quiz Complete!</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="total-questions">/{questions.length}</span>
            </div>
          </div>
          <p className="score-text">You scored {Math.round((score/questions.length) * 100)}%</p>
          <button onClick={() => window.location.reload()} className="restart-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
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
        <div className="question-text">{questions[current].question}</div>
      </div>

      <div className="options-container">
        {questions[current].options.map((option, idx) => (
          <button
            key={idx}
            className={`option-button ${
              selected === idx ? 'selected' : ''
            } ${
              selected !== null && idx === questions[current].answer ? 'correct' : ''
            } ${
              selected !== null && selected === idx && selected !== questions[current].answer ? 'wrong' : ''
            }`}
            onClick={() => handleOptionClick(idx)}
            disabled={selected !== null}
          >
            <span className="option-label">{String.fromCharCode(65 + idx)}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>

      {selected !== null && (
        <button 
          className="next-button"
          onClick={handleNext}
        >
          {current === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      )}
    </div>
  );
};

export default QuizPage;
