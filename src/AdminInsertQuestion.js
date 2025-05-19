import React, { useState, useEffect } from 'react';
import { insertQuestion } from './insertQuestion';
import { collection, getDocs } from 'firebase/firestore';
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        let successCount = 0;
        for (const item of data) {
          try {
            await insertQuestion(item);
            successCount++;
          } catch (err) {
            console.error('Failed to insert question:', err);
          }
        }
        setMessage(`success:Successfully inserted ${successCount} out of ${data.length} questions!`);
      } else {
        setMessage('error:Invalid file format. Expected an array of questions.');
      }
    } catch (err) {
      setMessage('error:Failed to process the file.');
    }
  };

  return (
    <div className="admin-insert-container">
      <div className="header-actions">
        <h2>Quiz Question Manager</h2>
        <button className="view-btn" onClick={fetchAllQuestions}>
          View All Questions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
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
        <div className="options-grid">
          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
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
          <input
            type="text"
            value={category}
            placeholder="e.g., Science, History, Geography..."
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Question
        </button>
      </form>

      <div className="file-upload-section">
        <label>Bulk Upload Questions</label>
        <p>Upload a JSON file containing an array of questions</p>
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
        />
      </div>

      {/* Questions Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Questions ({allQuestions.length})</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="questions-list">
              {allQuestions.length > 0 ? (
                allQuestions.map((q, index) => (
                  <div key={q.id} className="question-item">
                    <h4>Question {index + 1}</h4>
                    <p><strong>Category:</strong> {q.category}</p>
                    <p><strong>Q:</strong> {q.question}</p>
                    <div className="options-list">
                      {q.options.map((opt, idx) => (
                        <p key={idx} className={idx === q.answer ? 'correct-answer' : ''}>
                          {idx === q.answer ? '✓ ' : ''}{opt}
                        </p>
                      ))}
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
