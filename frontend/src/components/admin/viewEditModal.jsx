/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";

const ViewEditBookModal = ({ book, type, onClose }) => {
    console.log(book)
    const [title, setTitle] = useState(book.name);
    const [description, setDescription] = useState(book.description);
    const author = book.createdBy // Add author if available
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handleSaveChanges = async () => {
      setLoading(true);
      setError(null);
      try {
        // Call an API to update the book if actionType is "edit"
        if (type === "edit") {
          const response = await axios.patch(`http://localhost:3000/updateBookByAdmin/${book.id}`, {
            name: title,
            description,
            author, // Include author in the request
          });
          // Update the book in the list (this should be updated accordingly in your parent component)
          console.log("Book updated:", response.data);
        }
        onClose(); // Close the modal after the action
      } catch (error) {
        setError("Error saving changes, please try again.");
        console.error("Error saving changes:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">{type === "edit" ? "Edit Book" : "View Book"}</h2>
          <form>
            <div className="mb-4">
              <label className="block text-gray-700">Title</label>
              {type === "edit" ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              ) : (
                <p className="text-gray-600">{title}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Author</label>
              {type === "edit" ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={book.createdBy}
                //   onChange={(e) => setAuthor(e.target.value)}
                />
              ) : (
                <p className="text-gray-600">{book.createdBy}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Description</label>
              {type === "edit" ? (
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              ) : (
                <p className="text-gray-600">{description}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
              {type === "edit" && (
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              )}
            </div>
          </form>
          {error && <div className="text-red-500 mt-4">{error}</div>}
          {loading && <div className="text-blue-500 mt-4">Saving changes...</div>}
        </div>
      </div>
    );
  };


export default ViewEditBookModal