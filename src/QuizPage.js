import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import './QuizPage.css';

const QuizPage = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [answers, setAnswers] = useState({}); // { [index]: selectedOption }
  const [categoryAnswers, setCategoryAnswers] = useState({}); // { category: { [index]: selectedOption } }
  const [allQuestions, setAllQuestions] = useState([]); // all questions fetched for category
  const [allCategoryQuestions, setAllCategoryQuestions] = useState({}); // { category: questions[] }
  const [page, setPage] = useState(0);
  const QUESTIONS_PER_PAGE = 10;
  const [toast, setToast] = useState('');
  const [score, setScore] = useState(null);
  const [categoryScores, setCategoryScores] = useState({}); // { category: score }

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
        let questionList = querySnapshot.docs.map(doc => doc.data());
        setAllQuestions(questionList);
        setPage(0);
        setAnswers({});
        setShowThankYou(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCategory]);

  // Fetch all questions for all categories
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionsByCategory = {};
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!questionsByCategory[data.category]) {
            questionsByCategory[data.category] = [];
          }
          questionsByCategory[data.category].push(data);
        });
        setAllCategoryQuestions(questionsByCategory);
      } catch (err) {
        console.error('Error fetching all questions:', err);
      }
    };
    fetchAllQuestions();
  }, []);

  // Start timer on first mount (first login)
  useEffect(() => {
    if (!timerStarted) {
      setTimerStarted(true);
      setTimeLeft(60 * 60);
    }
  }, []);

  // Timer countdown (runs independently)
  useEffect(() => {
    if (timerStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowThankYou(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerStarted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const paginatedQuestions = allQuestions.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE);
  const totalPages = Math.ceil(allQuestions.length / QUESTIONS_PER_PAGE);

  const handleOptionClick = (qIdx, optIdx) => {
    setCategoryAnswers(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [page * QUESTIONS_PER_PAGE + qIdx]: optIdx,
      },
    }));
  };

  const saveQuizData = (category, answers, score) => {
    const data = {
      category,
      answers,
      score,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_results.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log('Quiz data saved successfully as a downloadable JSON file.');
  };

  const saveQuizDataToFirebase = async (category, answers, score) => {
    const data = {
      category,
      answers,
      score,
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'quizResults', `${user.email}_${category}`), data);
      console.log('Quiz data saved to Firebase successfully.');
    } catch (err) {
      console.error('Error saving quiz data to Firebase:', err);
    }
  };

  const handleSubmitQuiz = async () => {
    const updatedScores = { ...categoryScores };
    let totalScore = 0;

    // Iterate through all categories to calculate scores
    for (const category of categories) {
      const categoryQuestions = allCategoryQuestions[category] || [];
      const categoryAnswersForCategory = categoryAnswers[category] || {};

      let correct = 0;
      categoryQuestions.forEach((q, idx) => {
        if (categoryAnswersForCategory[idx] === q.answer) correct++;
      });

      updatedScores[category] = correct;
      totalScore += correct;
    }

    setCategoryScores(updatedScores);

    // Save scores to Firebase
    try {
      await setDoc(doc(db, 'quizScores', user.email), {
        scores: updatedScores,
        totalScore,
      });
    } catch (err) {
      console.error('Error saving scores:', err);
    }

    setScore(totalScore);
    setShowThankYou(true);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };
  const handlePrevPage = () => {
    setPage(page - 1);
  };

  useEffect(() => {
    if (showThankYou && score === null && allQuestions.length > 0) {
      // Timer expired, calculate score for answered questions
      let correct = 0;
      allQuestions.forEach((q, idx) => {
        if (answers[idx] === q.answer) correct++;
      });
      setScore(correct);
    }
  }, [showThankYou, allQuestions, answers, score]);

  const allQuestionsAnswered = Object.keys(allCategoryQuestions).every(category => {
    const categoryQuestions = allCategoryQuestions[category] || [];
    return categoryQuestions.length > 0 &&
      categoryQuestions.every((_, idx) => categoryAnswers[category]?.[idx] !== undefined);
  });

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
        {score !== null && (
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6c47ff', margin: '1.5rem 0' }}>
            Overall Score: {score}
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryScores).map(([category, score]) => (
              <tr key={category}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{category}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="restart-btn" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
          Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container modern-quiz" style={{position: 'relative'}}>
      {toast && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          margin: '0 auto',
          background: '#ff3b30',
          color: '#fff',
          padding: '14px 0',
          borderRadius: '0 0 12px 12px',
          fontWeight: 700,
          fontSize: '1.1rem',
          zIndex: 100,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(44,62,80,0.13)',
          transition: 'opacity 0.3s',
          opacity: toast ? 1 : 0
        }}>
          {toast}
        </div>
      )}
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
        <div className="question-status">
          {`Answered: ${Object.keys(categoryAnswers[selectedCategory] || {}).length} / ${allQuestions.length}`}
        </div>
        <button
          className="submit-button"
          type="submit"
          style={{
            backgroundColor: allQuestionsAnswered ? 'green' : 'red',
            color: 'white',
            position: 'absolute',
            top: '10px',
            right: '10px',
          }}
          disabled={!allQuestionsAnswered}
          onClick={handleSubmitQuiz}
        >
          Submit Quiz
        </button>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleSubmitQuiz(); }}>
        {paginatedQuestions.map((q, qIdx) => (
          <div className="question-section" key={qIdx} style={{marginBottom: '2rem'}}>
            <div className="question-count">
              Question {page * QUESTIONS_PER_PAGE + qIdx + 1} of {allQuestions.length}
            </div>
            <div className="question-text modern-question-font">{q.question}</div>
            <div className="options-container modern-options-scroll">
              {Array.isArray(q.options) ? (
                q.options.map((option, optIdx) => (
                  <button
                    type="button"
                    key={optIdx}
                    className={`option-button modern-option-btn ${categoryAnswers[selectedCategory]?.[page * QUESTIONS_PER_PAGE + qIdx] === optIdx ? 'selected' : ''}`}
                    onClick={() => handleOptionClick(qIdx, optIdx)}
                  >
                    <span className="option-label">{String.fromCharCode(65 + optIdx)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                ))
              ) : (
                <div className="loading-spinner">No options available for this question.</div>
              )}
            </div>
          </div>
        ))}
        <div className="quiz-actions" style={{justifyContent: 'center', gap: '1rem'}}>
          {totalPages > 1 && (
            <>
              <button type="button" className="next-button" onClick={handlePrevPage} disabled={page === 0}>
                Prev Page
              </button>
              <button type="button" className="next-button" onClick={handleNextPage} disabled={page === totalPages - 1}>
                Next Page
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizPage;
