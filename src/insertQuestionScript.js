// insertQuestionScript.js
// Run this script in a Node.js environment after setting up Firebase Admin SDK or in a browser with Firebase client SDK initialized.
import { insertQuestion } from './insertQuestion';

(async () => {
  try {
    const id = await insertQuestion({
      question: 'What is the capital of France?',
      options: ['Berlin', 'London', 'Paris', 'Madrid'],
      answer: 2, // index of correct answer
      category: 'geography'
    });
    console.log('Inserted question with ID:', id);
  } catch (e) {
    console.error('Failed to insert question:', e);
  }
})();
