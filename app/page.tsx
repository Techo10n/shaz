'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { db, initializeAnalytics } from './firebase/firebase';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import axios from 'axios';

interface Message {
  userMessage: string;
  aiResponse: string;
}

// Utility function to safely access localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const HomePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [text, setText] = useState<string>('');
  const [lastSubmittedText, setLastSubmittedText] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });
  const [noteId, setNoteId] = useState<string | null>(getLocalStorageItem("noteId")); // Tracks the current note ID in Firestore
  const [userId, setUserId] = useState<string | null>(getLocalStorageItem("userId")); // Tracks the current user ID in Firestore

  // Function to send a message
  const sendMessage = async (messageToSend: string) => {
    if (messageToSend.trim() === '') return;

    const userMessage = messageToSend;

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', { message: userMessage });
      const aiResponse = response.data.response;

      setMessages([...messages, { userMessage, aiResponse }]);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const displayNoteContent = useCallback(async (userIdParam: string) => {
    if (!noteId) return;

    try {
      const userDocRef = doc(db, 'users', userIdParam);
      const historyCollectionRef = collection(userDocRef, 'history');
      const noteDocRef = doc(historyCollectionRef, noteId);
      const noteDocSnap = await getDoc(noteDocRef);

      if (noteDocSnap.exists()) {
        const data = noteDocSnap.data();
        const noteContent = data.content;
        setText(noteContent);
        sendMessage(noteContent); // Send the entire note content to the AI
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching note content:", error);
    }
  }, [noteId]);

  useEffect(() => {
    if (userId) {
      displayNoteContent(userId);
    }
  }, [userId, displayNoteContent]);

  const dbSubmit = useCallback(async () => {
    // Prevent submission if the text is empty or hasn't changed
    if (text.trim() === '' || text === lastSubmittedText) return;
    const userMessage = text;
    try {
      // Store the message in Firestore if the user is logged in
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        if (!userId) {
          setUserId(user.uid);
          if (typeof window !== 'undefined') {
            localStorage.setItem("userId", user.uid);
          }
        }

        const historyCollectionRef = collection(userDocRef, 'history');
        const noteDocRef = noteId ? doc(historyCollectionRef, noteId) : doc(historyCollectionRef);
        if (!noteId) {
          setNoteId(noteDocRef.id);
          if (typeof window !== 'undefined') {
            localStorage.setItem("noteId", noteDocRef.id);
          }
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
    } catch (error: unknown) {
      console.error('Error sending message:', error);
    }
  }, [text, lastSubmittedText, user, userId, noteId]);

  // Function to handle text change and word count logic
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    const words = newText.trim().split(/\s+/);
    const wordCount = words.length;

    // Check if 15 words are typed
    if (wordCount >= 15 && wordCount > 0) {
      const last15Words = words.slice(wordCount - 15).join(' '); // Get last 15 words
      sendMessage(last15Words); // Send message with those 15 words
    }

    // inputRef.current?.addEventListener('keypress', handleKeyPress);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter', e.key === '.', e.key === 'Backspace') {
      sendMessage(text); // Send message with those 15 words
      dbSubmit();
    }
  };

  useEffect(() => {
    dbSubmit();
  }, [text, dbSubmit]);

  const fetchData = async () => {
    try {
      // Your fetch logic here
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchData();
    initializeAnalytics();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const parsePhrases = (aiResponse: string): string[] => {
    const match = aiResponse.match(/\[User: (.+)\]/);
    if (match && match[1]) {
      return match[1].split(',').map((phrase) => phrase.trim().replace(/['"]+/g, ''));
    }
    return [];
  };

  const showTooltip = (event: React.MouseEvent, content: string) => {
    event.stopPropagation();
    const { clientX: x, clientY: y } = event;
    setTooltip({ visible: true, content, x, y });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      hideTooltip();
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const phrases = messages.flatMap((message) => parsePhrases(message.aiResponse));
  const parts = text.split(new RegExp(`(${phrases.join('|')})`, 'gi'));

  return (
    <div className="relative mx-6 text-lg">
      <div className="relative">
        {/* Overlay Div for Underlining and Tooltip Functionality */}
        <div
          className="absolute w-full p-4 bg-transparent whitespace-pre-wrap break-words"
          style={{ pointerEvents: 'none', zIndex: 1, minHeight: '96px', top: 0, left: 0 }}
        >
          {parts.map((part, index) =>
            phrases.includes(part) ? (
              <span
                key={index}
                className="highlighted-text"
                style={{
                  textDecoration: 'underline',
                  textDecorationColor: '#cab0f5',
                  textDecorationThickness: '2px',
                  color: 'white',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
                onClickCapture={(event) => {
                  const aiResponse = messages.find((message) => message.userMessage.includes(part))?.aiResponse || '';
                  const truncatedResponse = aiResponse.split('[')[0];
                  showTooltip(event, truncatedResponse);
                }}
              >
                {part}
              </span>
            ) : (
              <span key={index} style={{ pointerEvents: 'none' }}>
                {part}
              </span>
            )
          )}
        </div>

        {/* Visible Textarea for Regular Editing */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
          className="relative w-full p-4 focus:outline-none bg-transparent resize-none overflow-hidden text-white"
          placeholder="Begin writing..."
          style={{ minHeight: '96px', maxHeight: 'none', overflowY: 'auto', zIndex: 0 }}
        />
      </div>
      {tooltip.visible && (
        <div
          className="tooltip absolute bg-[#191919] border-[#cab0f5] text-white p-2 rounded-lg border"
          style={{ top: tooltip.y - 46, left: 0, right: 0, maxWidth: '100%', zIndex: 3 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default HomePage;