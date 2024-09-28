// app/page.tsx
'use client';


import { db, initializeAnalytics } from './firebase/firebase'; // Ensure you import db and initializeAnalytics correctly
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link'; // Import Link for navigation
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth'; // Import to check auth state
import { signOut } from 'firebase/auth'; // Import signOut function


const HomePage = () => {
 const [data, setData] = useState<any[]>([]);
 const [user, setUser] = useState<any>(null); // State to store user information
 const [text, setText] = useState<string>(''); // State to store typed text
 const inputRef = useRef<HTMLTextAreaElement>(null); // Ref to focus on the textarea

// Focus the textarea on page load
useEffect(() => {
  inputRef.current?.focus();
}, []);

// Handle keydown events
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const selectionStart = inputRef.current?.selectionStart;
  const selectionEnd = inputRef.current?.selectionEnd;

  if (e.key === 'Backspace') {
    e.preventDefault(); // Prevent default backspace behavior
    if (selectionStart !== null && selectionEnd !== null) {
      // If text is selected, remove it; otherwise, remove one character
      const newText =
        selectionStart === selectionEnd
          ? text.slice(0, selectionStart - 1) + text.slice(selectionStart)
          : text.slice(0, selectionStart) + text.slice(selectionEnd);
      setText(newText);
      // Set cursor position after deletion
      setTimeout(() => {
        inputRef.current?.setSelectionRange(
          selectionStart === selectionEnd ? selectionStart - 1 : selectionStart,
          selectionStart === selectionEnd ? selectionStart - 1 : selectionStart,
        );
      }, 0);
    }
  } else if (e.key.length === 1) {
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


 const handleSignOut = async () => {
   try {
     await signOut(auth);
     setUser(null); // Reset user state
   } catch (error) {
     console.error('Error during sign-out:', error);
   }
 };


 return (
   <div
     className="flex flex-col items-center justify-center min-h-screen bg-[#191919] outline-none"
   >
     {/* Centered Button for Google Sign-In or Sign-Out */}
     {!user ? (
       <Link href="/login">
         <button className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 mb-4">
           Sign In with Google
         </button>
       </Link>
     ) : (
       <button onClick={handleSignOut} className="bg-red-500 text-white p-3 rounded hover:bg-red-600 mb-4">
         Sign Out
       </button>
     )}


<div className="flex flex-col items-center mx-10 text-lg">
      <textarea
      ref={inputRef}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        // Adjust the height of the textarea to fit the content
        if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }} // Update text state with input value
      onKeyDown={handleKeyDown}
      className="w-full p-4 focus:outline-none bg-[#191919] resize-none overflow-hidden"
      placeholder=""
      style={{ minHeight: '96px' }} // Set a minimum height
      />
    </div>
  </div>
  );
}

export default HomePage;