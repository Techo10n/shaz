// app/page.tsx
'use client';

import { db, initializeAnalytics } from './firebase/firebase'; // Ensure you import db and initializeAnalytics correctly
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth'; // Import to check auth state
import axios from 'axios';

interface Message {
  userMessage: string;
  aiResponse: string;
}

const HomePage = () => {
  const [data, setData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // State to store user information
  const [text, setText] = useState<string>(''); // State to store typed text
  const [lastSubmittedText, setLastSubmittedText] = useState<string>(''); // Track the last submitted text
  const inputRef = useRef<HTMLTextAreaElement>(null); // Ref to focus on the textarea
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });

  // Focus the textarea on page load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (text.trim() === '' || text === lastSubmittedText) return; // Avoid empty or duplicate messages

    const userMessage = text; // Capture the new text
    setInput(''); // Clear the input field
    setError(null); // Reset any existing error

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/chat', { message: userMessage });
      const aiResponse = response.data.response;

      // Add the user message and AI's response to the chat
      setMessages([...messages, { userMessage, aiResponse }]);

      // **Update user input in Firestore**
      if (user) {  // Only save if the user is authenticated
        const userDocRef = doc(db, 'userTexts', user.uid); // Use user ID as document ID

        // Fetch the existing text from Firestore
        const existingDoc = await getDoc(userDocRef);
        let existingText = '';

        if (existingDoc.exists()) {
          existingText = existingDoc.data()?.text || ''; // Get the existing text or an empty string
        }

        // Concatenate the new text with the existing text
        // const updatedText = existingText ? `${existingText}\n${newText}` : newText;

        // Update the document with the concatenated text
        await setDoc(userDocRef, {
          userId: user.uid,       // Save user ID
          // text: updatedText,      // Save the updated text
          text: userMessage,
          timestamp: new Date()   // Save the timestamp
        });

        // Update the last submitted text
        setLastSubmittedText(userMessage);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(`Error: ${error.response?.data?.error || 'Request failed with status code ' + error.response?.status}`);
    }
  };

  // Handle keydown events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent new line in textarea on Enter
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setInput(newText);

    // Adjust the height of the textarea to fit the content
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }

    // Check if a block of text was deleted
    if (newText.length < text.length) {
      const deletedText = text.slice(newText.length);
      const updatedMessages = messages.filter(message => !message.userMessage.includes(deletedText));
      setMessages(updatedMessages);
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

  const parsePhrases = (aiResponse: string): string[] => {
    const match = aiResponse.match(/\[User: (.+)\]/);
    if (match && match[1]) {
      return match[1].split(',').map(phrase => phrase.trim().replace(/['"]+/g, ''));
    }
    return [];
  };

  const showTooltip = (event: React.MouseEvent, content: string) => {
    const { clientX: x, clientY: y } = event;
    setTooltip({ visible: true, content, x, y });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

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
        onChange={handleTextChange} // Update text state with input value
        onKeyDown={(e) => {
          handleKeyDown(e);
          // Adjust the height of the textarea to fit the content
          if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
          }
        }}
        onKeyPress={handleKeyPress}
        className="w-full p-4 focus:outline-none bg-[#191919] resize-none overflow-hidden"
        placeholder=""
        style={{ minHeight: '96px', maxHeight: 'none', overflowY: 'auto' }} // Set a minimum height and remove max height
      />
      <div className="relative group">
        <div className="user-text flex flex-col mx-10 text-lg">
          {highlightText(text, messages.flatMap(message => parsePhrases(message.aiResponse)))}
        </div>
        {showPrompt && (
          <div className="messages flex flex-col mx-10 text-lg w-full overflow-y-auto absolute top-full left-0" style={{ minHeight: '50vh' }}>
            {messages.map((message, index) => (
              <div key={index} className="message">
                {message.aiResponse}
              </div>
            ))}
          </div>
        )}
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