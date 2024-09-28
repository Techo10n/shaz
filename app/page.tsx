'use client';

import { db, initializeAnalytics } from './firebase/firebase'; // Ensure you import db and initializeAnalytics correctly
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from 'react';

const HomePage = () => {
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "yourCollection")); // Ensure "yourCollection" exists in Firestore
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
    initializeAnalytics(); // Initialize Analytics
  }, []);

  return (
    <div>
      <h1>Welcome to My Next.js App with Firebase!</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
