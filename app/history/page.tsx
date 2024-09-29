"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, Timestamp, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; // Ensure this path is correct

// Define the Note type for the notes data from Firestore
type Note = {
  id: string; // Firestore document ID as a string
  title: string;
  content: string;
  lastEdited: Date; // This can be updated when editing the note
  createdOn: Date; // Store the original date created from the database
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const router = useRouter();

  // Fetch notes from Firestore
  const fetchNotes = async () => {
    if (!auth.currentUser) return; // Ensure the user is authenticated

    const userId = auth.currentUser.uid; // Get current user ID
    const notesCollectionRef = collection(db, "users", userId, "history"); // Reference to the user's history collection
    const notesQuery = query(notesCollectionRef);

    try {
      const querySnapshot = await getDocs(notesQuery);
      const fetchedNotes = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Get the createdOn date from the database
        const createdOn =
          data.date_time instanceof Timestamp
            ? data.date_time.toDate() // Convert Firestore Timestamp to JS Date
            : new Date(data.date_time); // Fallback if it's already a valid date string

        // Get the lastEdited date from the database (fallback to createdOn if missing)
        const lastEdited =
          data.lastEdited instanceof Timestamp
            ? data.lastEdited.toDate() // Convert Firestore Timestamp to JS Date
            : new Date(data.lastEdited || createdOn); // Use createdOn if lastEdited is not available

        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          lastEdited: lastEdited,
          createdOn: createdOn,
        };
      });
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching notes: ", error);
    }
  };

  useEffect(() => {
    fetchNotes(); // Fetch notes when the component mounts
  }, []);

  const handleRename = (note: Note) => {
    setEditingNoteId(note.id); // note.id is now a string
    setNewTitle(note.title);
  };

  const handleSaveTitle = async (id: string) => {
    try {
      // Reference to the Firestore document
      const noteDocRef = doc(db, "users", auth.currentUser!.uid, "history", id);

      // Update the title and lastEdited timestamp in Firestore
      await updateDoc(noteDocRef, {
        title: newTitle,
        lastEdited: new Date(),
      });

      // Update the local state
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id
            ? { ...note, title: newTitle, lastEdited: new Date() }
            : note
        )
      );

      setEditingNoteId(null);
      setNewTitle("");
    } catch (error) {
      console.error("Error updating title: ", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") {
      handleSaveTitle(id);
    }
  };

  const handleNoteClick = (noteId: string) => {
    // Set noteId in local storage and redirect to home
    localStorage.setItem("noteId", noteId); // Store the noteId in local storage
    if (!auth.currentUser) return; // Ensure the user is authenticated
    localStorage.setItem("userId", auth.currentUser.uid); // Store the noteId in local storage
    // console.log(noteId)
    router.push("/"); // Redirect to the home page
  };

  return (
    <div className="min-h-screen w-full p-4">
      <div className="text-xl font-semibold text-[#cab0f5] m-4">History</div>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li
            key={note.id}
            className="p-4 rounded-lg border border-transparent border-2 hover:border-[#cab0f5] bg-[#191919] flex flex-col space-y-2 shadow-md cursor-pointer transition duration-300"
            onClick={() => handleNoteClick(note.id)} // Pass the note ID
          >
            {editingNoteId === note.id ? (
              <div className="flex flex-col space-y-2">
                <input
                  className="w-2/3 p-1 border border-gray-400 rounded text-black"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, note.id)} // note.id is a string
                  onClick={(e) => e.stopPropagation()} // Prevent the click from bubbling up to the note box
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
                <span className="text-sm text-gray-400">
                  Created on: {note.createdOn.toLocaleDateString()}{" "}
                  {note.createdOn.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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
                    Last Edited: {note.lastEdited.toLocaleDateString()}{" "}
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
                <span className="text-sm text-gray-400">
                  Created on: {note.createdOn.toLocaleDateString()}{" "}
                  {note.createdOn.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}