// app/page.tsx
'use client';

import { db, initializeAnalytics } from './firebase/firebase';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

interface Message {
  userMessage: string;
  aiResponse: string;
}

const HomePage = () => {
  const [user, setUser] = useState<any>(null); // Holds the current authenticated user
  const [text, setText] = useState<string>(''); // Tracks the current input text
  const [lastSubmittedText, setLastSubmittedText] = useState<string>(''); // Tracks the last submitted text to avoid duplicate submissions
  const inputRef = useRef<HTMLTextAreaElement>(null); // Reference to the textarea input for focus management
  const [input, setInput] = useState(''); // Tracks the current state of the input field
  const [messages, setMessages] = useState<Message[]>([]); // Stores messages between user and AI
  const [error, setError] = useState<string | null>(null); // Holds any error messages related to API requests
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 }); // Tooltip state for displaying AI responses
  const [noteId, setNoteId] = useState<string | null>(localStorage.getItem("noteId")); // Tracks the current note ID in Firestore
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId")); // Tracks the current user ID in Firestore

  // Focus on the input when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Display note content if userId is set
  useEffect(() => {
    if (userId) {
      displayNoteContent(userId);
    }
  }, [userId]);

  // Fetch the note content from Firestore
  const displayNoteContent = async (userIdParam: string) => {
    if (!noteId) return;

    try {
      const userDocRef = doc(db, 'users', userIdParam);
      const historyCollectionRef = collection(userDocRef, 'history');
      const noteDocRef = doc(historyCollectionRef, noteId);
      const noteDocSnap = await getDoc(noteDocRef);

      if (noteDocSnap.exists()) {
        const data = noteDocSnap.data();
        setText(data.content);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching note content:", error);
    }
  }

  // Handle the submission of the input message
  const sendMessage = async () => {
    // Prevent submission if the text is empty or hasn't changed
    if (text.trim() === '' || text === lastSubmittedText) return;

    const userMessage = text;
    setInput('');
    setError(null);

    try {
      // Send the user message to the backend API
      const response = await axios.post('http://127.0.0.1:5000/api/chat', { message: userMessage });
      const aiResponse = response.data.response;

      // Update the messages state
      setMessages((prevMessages) => [...prevMessages, { userMessage, aiResponse }]);

      // Store the message in Firestore if the user is logged in
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        if (!userId) {
          setUserId(user.uid);
          localStorage.setItem("userId", user.uid);
        }

        const historyCollectionRef = collection(userDocRef, 'history');
        const noteDocRef = noteId ? doc(historyCollectionRef, noteId) : doc(historyCollectionRef);
        if (!noteId) {
          setNoteId(noteDocRef.id);
          localStorage.setItem("noteId", noteDocRef.id);
        }

        // Prepare data to be stored in Firestore
        const noteData = {
          title: 'untitled note',
          content: userMessage,
          date_time: new Date(),
        };

        // Store the note data in Firestore
        await setDoc(noteDocRef, noteData);
        setLastSubmittedText(userMessage);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(`Error: ${error.response?.data?.error || 'Request failed with status code ' + error.response?.status}`);
    }
  };

  // Handle "Enter" key press to send the message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle text input within the textarea, updating state accordingly
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const selectionStart = inputRef.current?.selectionStart;
    const selectionEnd = inputRef.current?.selectionEnd;

    if (e.key.length === 1) {
      e.preventDefault();
      if (selectionStart !== null && selectionEnd !== null) {
        const newText = text.slice(0, selectionStart) + e.key + text.slice(selectionEnd);
        setText(newText);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(selectionStart + 1, selectionStart + 1);
        }, 0);
      }
    }
  };

  // Handle changes to the input text area and update the component state
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setInput(newText);

    // Adjust textarea height based on content
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }

    // Remove any deleted text from the messages state
    if (newText.length < text.length) {
      const deletedText = text.slice(newText.length);
      const updatedMessages = messages.filter(message => !message.userMessage.includes(deletedText));
      setMessages(updatedMessages);
    }
  };

  // Track the authenticated user state using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Parse phrases from AI response text
  const parsePhrases = (aiResponse: string): string[] => {
    const match = aiResponse.match(/\[User: (.+)\]/);
    if (match && match[1]) {
      return match[1].split(',').map(phrase => phrase.trim().replace(/['"]+/g, ''));
    }
    return [];
  };

  // Show tooltip on mouse hover
  const showTooltip = (event: React.MouseEvent, content: string) => {
    const { clientX: x, clientY: y } = event;
    setTooltip({ visible: true, content, x, y });
  };

  // Hide tooltip when mouse leaves
  const hideTooltip = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  // Highlight specified phrases in the text
  const highlightText = (text: string, phrases: string[]): JSX.Element => {
    const parts = text.split(new RegExp(`(${phrases.join('|')})`, 'gi'));

    return (
      <div className="user-text flex flex-col mx-10 text-lg">
        {parts.map((part, index) =>
          phrases.includes(part) ? (
            <span
              key={index}
              className="highlighted-text"
              style={{ textDecoration: 'underline', textDecorationColor: '#cab0f5', textDecorationThickness: '2px', color: 'white' }}
              onMouseEnter={(event) => {
                const aiResponse = messages.find(message => message.userMessage.includes(part))?.aiResponse || '';
                const truncatedResponse = aiResponse.split('[')[0];
                showTooltip(event, truncatedResponse);
              }}
              onMouseLeave={hideTooltip}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col mx-10 text-lg">
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={(e) => {
          handleKeyDown(e);
          if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
          }
        }}
        onKeyPress={handleKeyPress}
        className="w-full p-4 focus:outline-none bg-[#191919] resize-none overflow-hidden"
        placeholder=""
        style={{ minHeight: '96px', maxHeight: '400px', overflowY: 'auto' }}
      />
      <div className="relative group">
        <div className="user-text flex flex-col mx-10 text-lg">
          {highlightText(text, messages.flatMap(message => parsePhrases(message.aiResponse)))}
        </div>
      </div>
      {tooltip.visible && (
        <div
          className="tooltip absolute bg-[#191919] border-[#cab0f5] text-white p-2 rounded-lg border mx-5"
          style={{ top: tooltip.y + 10, left: tooltip.x, zIndex: 1000 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

export default HomePage;
