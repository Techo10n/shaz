'use client'

import React, { useEffect, useState, useRef } from 'react';
import { db, initializeAnalytics } from './firebase/firebase';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

interface Message {
  userMessage: string;
  aiResponse: string;
}

const HomePage = () => {
  const [data, setData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState<string>('');
  const [lastSubmittedText, setLastSubmittedText] = useState<string>('');
  const [storedWords, setStoredWords] = useState<string>(''); // To store every 15 words
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Function to send a message
  const sendMessage = async (messageToSend: string) => {
    if (messageToSend.trim() === '') return;

    const userMessage = messageToSend;
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', { message: userMessage });
      const aiResponse = response.data.response;

      setMessages([...messages, { userMessage, aiResponse }]);

      if (user) {
        const userDocRef = doc(db, 'userTexts', user.uid);
        const existingDoc = await getDoc(userDocRef);
        let existingText = '';

        if (existingDoc.exists()) {
          existingText = existingDoc.data()?.text || '';
        }

        const updatedText = existingText ? `${existingText}\n${userMessage}` : userMessage;

        await setDoc(userDocRef, {
          userId: user.uid,
          text: updatedText,
          timestamp: new Date(),
        });

        setLastSubmittedText(userMessage);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(`Error: ${error.response?.data?.error || 'Request failed with status code ' + error.response?.status}`);
    }
  };

  // Function to handle text change and word count logic
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setInput(newText);

    const words = newText.trim().split(/\s+/);
    const wordCount = words.length;

    // Check if 15 words are typed
    if (wordCount % 15 === 0 && wordCount > 0) {
      const last15Words = words.slice(wordCount - 15).join(' '); // Get last 15 words
      setStoredWords(last15Words); // Store those words
      sendMessage(last15Words); // Send message with those 15 words
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' || e.key === 'Backspace' || e.key === '.') {
        const last15Words = words.slice(wordCount - 15).join(' '); // Get last 15 words
        setStoredWords(last15Words); // Store those words
        sendMessage(last15Words); // Send message with those 15 words
      }
    };

    inputRef.current?.addEventListener('keypress', handleKeyPress);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'yourCollection'));
      const fetchedData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(fetchedData);
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

  let phrases = messages.flatMap((message) => parsePhrases(message.aiResponse));
  const parts = text.split(new RegExp(`(${phrases.join('|')})`, 'gi'));

  return (
    <div className="relative mx-10 text-lg">
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