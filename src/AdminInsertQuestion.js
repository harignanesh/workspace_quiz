import React, { useState, useEffect } from 'react';
import { insertQuestion } from './insertQuestion';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import './AdminInsertQuestion.css';

const AdminInsertQuestion = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [uploadProgress, setUploadProgress] = useState();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchAllQuestions = async () => {
    try {
      setMessage('');
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllQuestions(questions);
      setShowModal(true);
      if (questions.length === 0) {
        setMessage('info:No questions found in the database. Start by adding some questions!');
      }
    } catch (err) {
      setMessage('error:Failed to fetch questions. Please try again.');
      console.error('Error fetching questions:', err);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await insertQuestion({ question, options, answer, category });
      setMessage('success:Question inserted successfully!');
      setQuestion('');
      setOptions(['', '', '', '']);
      setAnswer(0);
      setCategory('');
    } catch (err) {
      setMessage('error:Failed to insert question.');
    }
  };

  const validateQuestion = (q, idx) => {
    if (!q || typeof q !== 'object') return `Row ${idx + 1}: Not an object`;
    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) return `Row ${idx + 1}: Missing or invalid 'question'`;
    if (!Array.isArray(q.options) || q.options.length !== 4) return `Row ${idx + 1}: 'options' must be an array of 4 items`;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) return `Row ${idx + 1}: 'answer' must be a number between 0 and 3`;
    if (!q.category || typeof q.category !== 'string' || !q.category.trim()) return `Row ${idx + 1}: Missing or invalid 'category'`;
    return null;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadProgress(0);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        let successCount = 0;
        let errorList = [];
        for (let i = 0; i < data.length; i++) {
          const errMsg = validateQuestion(data[i], i);
          if (errMsg) {
            errorList.push(errMsg);
            setUploadProgress(Math.round(((i + 1) / data.length) * 100));
            continue;
          }
          try {
            await insertQuestion(data[i]);
            successCount++;
          } catch (err) {
            errorList.push(`Row ${i + 1}: Firestore error`);
          }
          setUploadProgress(Math.round(((i + 1) / data.length) * 100));
        }
        if (errorList.length === 0) {
          setMessage(`success:Successfully inserted all ${successCount} questions!`);
        } else {
          setMessage(`error:Inserted ${successCount} of ${data.length} questions.\nFailed: ${errorList.join('; ')}`);
        }
      } else {
        setMessage('error:Invalid file format. Expected an array of questions.');
      }
    } catch (err) {
      setMessage('error:Failed to process the file.');
    }
    setTimeout(() => setUploadProgress(undefined), 1200);
  };

  // Add this function to clear all questions
  const handleClearAllQuestions = async () => {
    if (!window.confirm('Are you sure you want to delete ALL questions? This cannot be undone.')) return;
    setMessage('');
    try {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const batchDeletes = querySnapshot.docs.map((d) => deleteDoc(doc(db, 'questions', d.id)));
      await Promise.all(batchDeletes);
      setMessage('success:All questions deleted!');
      setAllQuestions([]);
    } catch (err) {
      setMessage('error:Failed to delete all questions.');
    }
  };

  return (
    <div className="admin-insert-container">
      <div className="header-actions">
        <h2>Quiz Question Manager</h2>
        <div className="theme-toggle">
          <button
            className="theme-btn"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="view-btn" onClick={fetchAllQuestions}>
            View All Questions
          </button>
          <button className="clear-btn" onClick={handleClearAllQuestions}>
            Clear All Questions
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="admin-form modern-admin-form">
        <div>
          <label>Question:</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            required
          />
        </div>
        <label>Options:</label>
        <div className="options-list-modern">
          {options.map((opt, idx) => (
            <div className="option-row-modern" key={idx}>
              <span className="option-index-modern">{idx + 1}.</span>
              <input
                type="text"
                className="option-input-modern"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                required
              />
            </div>
          ))}
        </div>
        <div>
          <label>Correct Answer (Option Number):</label>
          <input
            type="number"
            min="0"
            max="3"
            value={answer}
            onChange={(e) => setAnswer(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Category:</label>
          <select
            className="category-dropdown"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Maths">Maths</option>
            <option value="Programming">Programming</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="General">General</option>
          </select>
        </div>
        <button type="submit" className="submit-btn modern-submit-btn">
          Add Question
        </button>
      </form>
      <div className="file-upload-section modern-upload-section">
        <label>Bulk Upload Questions</label>
        <p>Upload a JSON file containing an array of questions</p>
        <div className="file-upload-modern">
          <div className="file-drop-area-modern" onClick={() => document.getElementById('file-upload-input').click()}>
            <span className="upload-icon-modern">⬆️</span>
            <span>Drag and drop here <span className="browse-link-modern">or browse</span></span>
            <input
              id="file-upload-input"
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
          {/* Progress bar UI, dynamic rendering */}
          {uploadProgress !== undefined && (
            <div className="progress-bar-modern">
              <div className="progress-bar-fill-modern" style={{ width: `${uploadProgress}%` }}></div>
              <span className="progress-bar-text-modern">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Questions ({allQuestions.length})</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="questions-list">
              {Array.isArray(allQuestions) && allQuestions.length > 0 ? (
                allQuestions.map((q, index) => (
                  <div key={q.id || index} className="question-item">
                    <h4>Question {index + 1}</h4>
                    <p><strong>Category:</strong> {q.category}</p>
                    <p><strong>Q:</strong> {q.question}</p>
                    <div className="options-list">
                      {Array.isArray(q.options) ? q.options.map((opt, idx) => (
                        <p key={idx} className={idx === q.answer ? 'correct-answer' : ''}>
                          {idx === q.answer ? '✓ ' : ''}{opt}
                        </p>
                      )) : <span>No options</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-questions">
                  <img 
                    src="https://img.icons8.com/color/96/000000/empty-box.png" 
                    alt="No questions"
                  />
                  <p>No questions found</p>
                  <p>Start by adding some questions using the form!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {message && (
        <p className={`message ${
          message.startsWith('success:') ? 'success' : 
          message.startsWith('error:') ? 'error' : 
          'info'
        }`}>
          {message.split(':')[1]}
        </p>
      )}
    </div>
  );
};

export default AdminInsertQuestion;
