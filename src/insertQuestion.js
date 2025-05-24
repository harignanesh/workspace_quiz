import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Example usage: node insertQuestion.js or run in browser console
export async function insertQuestion({ question, options, answer, category }) {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      question,
      options,
      answer, // index of correct option
      category,
      createdAt: new Date()
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
}

//Example call (uncomment to use in a script or test):
// insertQuestion({
//   question: 'What is the capital of France?',
//   options: ['Berlin', 'London', 'Paris', 'Madrid'],
//   answer: 2,
//   category: 'geography'
// });
