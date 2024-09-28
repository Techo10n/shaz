'use client';

import React, { useEffect, useRef, useState } from 'react';

const HomePage = () => {
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

  return (
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
  );
};

export default HomePage;