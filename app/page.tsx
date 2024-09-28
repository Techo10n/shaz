// app/page.tsx
'use client';


import { db, initializeAnalytics } from './firebase/firebase'; // Ensure you import db and initializeAnalytics correctly
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth'; // Import to check auth state
import axios from 'axios';

const HomePage = () => {
 const [data, setData] = useState<any[]>([]);
 const [user, setUser] = useState<any>(null); // State to store user information
 const [text, setText] = useState<string>(''); // State to store typed text
 const inputRef = useRef<HTMLTextAreaElement>(null); // Ref to focus on the textarea
 const [input, setInput] = useState('');
 const [messages, setMessages] = useState<string[]>([]);
 const [error, setError] = useState<string | null>(null);

// Focus the textarea on page load
useEffect(() => {
  inputRef.current?.focus();
}, []);

const sendMessage = async () => {
  if (input.trim() === '') return;

  setInput(''); // Clear the input field
  setError(null); // Reset any existing error

  try {
    const response = await axios.post('http://127.0.0.1:5000/api/chat', { message: input });
    const aiResponse = response.data.response;

    // Add only the AI's message to the chat
    setMessages([...messages, aiResponse]);
  } catch (error: any) {
    console.error('Error sending message:', error);
    setError(`Error: ${error.response?.data?.error || 'Request failed with status code ' + error.response?.status}`);
  }
};

// Handle keydown events

const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
  if (e.key === 'Enter') {
    sendMessage();  // Send message on Enter
  }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const selectionStart = inputRef.current?.selectionStart;
  const selectionEnd = inputRef.current?.selectionEnd;
   if (e.key.length === 1) {
    e.preventDefault(); // Prevent default character input behavior
    if (selectionStart !== null && selectionEnd !== null) {
      const newText = text.slice(0, selectionStart) + e.key + text.slice(selectionEnd);
      setText(newText);
      // Set cursor position after input
      setTimeout(() => {
        inputRef.current?.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
    }
  }
};

 const fetchData = async () => {
   try {
     const querySnapshot = await getDocs(collection(db, 'yourCollection')); // Ensure "yourCollection" exists in Firestore
     const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     setData(fetchedData);
   } catch (error) {
     console.error('Error fetching data: ', error);
   }
 };

 useEffect(() => {
   fetchData();
   initializeAnalytics(); // Initialize Analytics
 }, []);


 // Check for user authentication state
 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
     setUser(currentUser);
   });


   // Clean up subscription on unmount
   return () => unsubscribe();
 }, []);

 return (
<div className="flex flex-col items-center mx-10 text-lg">
      <textarea
      ref={inputRef}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        setInput(e.target.value);
        // Adjust the height of the textarea to fit the content
        if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }} // Update text state with input value
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      className="w-full p-4 focus:outline-none bg-[#191919] resize-none overflow-hidden"
      placeholder=""
      style={{ minHeight: '96px' }} // Set a minimum height
      />
      <div className="messages -my-10 mx-10 flex flex-col items-center text-lg">
          {messages.map((message, index) => (
            <div key={index} className="message">
              {message}
            </div>
          ))}
        </div>
    </div>
  );
}

export default HomePage;