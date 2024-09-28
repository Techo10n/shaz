"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Note = {
  id: number;
  title: string;
  content: string;
  lastEdited: Date;
};

const initialNotes: Note[] = [
  {
    id: 1,
    title: "First Note",
    content: "This is the content of the first note. It contains more information about the topic.",
    lastEdited: new Date(),
  },
  {
    id: 2,
    title: "Second Note",
    content: "This is the content of the second note. Here are some additional details.",
    lastEdited: new Date(),
  },
  {
    id: 3,
    title: "Third Note",
    content: "This is the content of the third note. It also has some interesting information.",
    lastEdited: new Date(),
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState(initialNotes);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();

  const handleRename = (note: Note) => {
    setEditingNoteId(note.id);
    setNewTitle(note.title);
  };

  const handleSaveTitle = (id: number) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, title: newTitle, lastEdited: new Date() } : note
      )
    );
    setEditingNoteId(null);
    setNewTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter") {
      handleSaveTitle(id);
    }
  };

  // Navigate to the home page when clicking outside of the input field or title
  const handleNoteClick = (note: Note) => {
    if (editingNoteId !== note.id) {
      router.push("/"); // Redirect to the home page
    }
  };

  return (
    <div className="min-h-screen w-full max-w-sm p-4 border-r border-gray-300">
      <h2 className="text-lg font-semibold text-[#cab0f5] mb-4">Notes</h2>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li
            key={note.id}
            className="p-4 rounded-lg hover:bg-[#cab0f5] bg-[#191919] flex flex-col space-y-2 shadow-md cursor-pointer transition duration-300"
            onClick={() => handleNoteClick(note)}
          >
            {editingNoteId === note.id ? (
              <div className="flex flex-col space-y-2">
                <input
                  className="w-2/3 p-1 border border-gray-400 rounded text-black"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, note.id)}
                  autoFocus
                />
                <span className="text-sm text-gray-400">
                  Last Edited: {note.lastEdited.toLocaleDateString()}{" "}
                  {note.lastEdited.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <p className="text-sm text-gray-400">
                  {note.content.length > 40
                    ? `${note.content.slice(0, 40)}...`
                    : note.content}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click from bubbling up to the note box
                      handleRename(note);
                    }}
                  >
                    {note.title}
                  </span>
                  <span className="text-sm text-gray-400">
                    {note.lastEdited.toLocaleDateString()}{" "}
                    {note.lastEdited.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {note.content.length > 40
                    ? `${note.content.slice(0, 40)}...`
                    : note.content}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
