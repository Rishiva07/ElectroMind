import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Recommendation, UserInput, Product } from '../types';

export const saveRecommendation = async (
  userId: string, 
  userInput: UserInput, 
  productA: Product, 
  productB: Product,
  winnerId: 'A' | 'B',
  matchScore: number,
  comparisonSummary?: string
) => {
  const recommendation: Omit<Recommendation, 'id'> = {
    userId,
    userInput,
    productA,
    productB,
    winnerId,
    matchScore,
    comparisonSummary,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, 'recommendations'), recommendation);
  return { id: docRef.id, ...recommendation };
};

export const saveFeedback = async (recommendationId: string, isAccurate: boolean) => {
  const docRef = doc(db, 'recommendations', recommendationId);
  await updateDoc(docRef, {
    feedback: isAccurate ? 'accurate' : 'inaccurate',
    feedbackAt: Date.now()
  });
};

export const getUserHistory = async (userId: string) => {
  const q = query(
    collection(db, 'recommendations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recommendation));
};
