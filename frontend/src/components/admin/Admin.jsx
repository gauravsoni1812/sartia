/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios"; // Import axios for making HTTP requests
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Admin component
const Admin = () => {
  const [books, setBooks] = useState([]); // Book list
  console.log(books)
  const [visibleComponent, setVisibleComponent] = useState(""); // "create" or "show"
  const [selectedBook, setSelectedBook] = useState(null); // View/Edit book state
  const [actionType, setActionType] = useState(""); // "view" or "edit"
  const [data, setData] = useState(null); // User data from token
  const [loading, setLoading] = useState(false); // To handle loading state
  const [error, setError] = useState(null); // To handle any error during the API call
  const navigate = useNavigate()
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setData(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch all books from the backend
  const fetchBooks = async () => {
    setLoading(true);
    setError(null); // Reset error state before making the API call
    try {
      const response = await axios.get("http://localhost:3000/getAllBooks");
      setBooks(response.data.books); // Update state with books fetched from the API
    } catch (error) {
      setError("Error fetching books, please try again.");
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show Books handler (fetches books from backend)
  const handleShowBooks = () => {
    fetchBooks(); // Fetch books when this button is clicked
    setVisibleComponent("show");
  };

  const handleViewOrEditBook = (book, action) => {
    setSelectedBook(book); // Set the selected book details
    setActionType(action);  // Set the action type to either "view" or "edit"
    setVisibleComponent("show"); // Show the component where the modal is rendered
  };
   
  const handleSignOut = () => {
    Cookies.remove("authToken"); // Remove the auth token from cookies
    navigate("/sign-in"); // Redirect the user to the login page (or home page)
  };


  // Create Book handler (API call)
  const handleCreateBook = async (newBook) => {
    setLoading(true);
    setError(null); // Reset error state before making the API call
    try {
      const response = await axios.post("http://localhost:3000/createBook", {
        name: newBook.title,
        description: newBook.description,
        createdBy: data.email, // Use the user's email (from token)
      });
      setBooks((prevBooks) => [...prevBooks, response.data.book]); // Add the new book to the state
      setVisibleComponent(""); // Go back to default
    } catch (error) {
      setError("Error creating book, please try again.");
      console.error("Error creating book:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">Welcome to the Admin Page</h1>

      <div className="space-x-4 mb-6">
        <button
          onClick={() => setVisibleComponent("create")}
          className={`rounded-md px-4 py-2 text-white font-semibold shadow 
            ${visibleComponent === "create" ? "bg-indigo-800" : "bg-indigo-600"}
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          Create Book
        </button>
        <button
          onClick={handleShowBooks}
          className={`rounded-md px-4 py-2 text-white font-semibold shadow 
            ${visibleComponent === "show" ? "bg-green-800" : "bg-green-600"}
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500`}
        >
          Show Books
        </button>

        <button
          onClick={handleSignOut}
          className="rounded-md px-4 py-2 text-white font-semibold shadow bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>

      {/* Conditional Rendering */}
      {visibleComponent === "create" && (
        <CreateBookForm
          data={data}
          onCreateBook={handleCreateBook}
          onCancel={() => setVisibleComponent("")}
        />
      )}

      {visibleComponent === "show" && (
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">All Books</h2>
          {loading ? (
            <div className="text-blue-500">Loading books...</div>
          ) : (
            books.map((book) => (
              <div
                key={book.id}
                className="flex justify-between items-center bg-gray-50 p-3 mb-2 rounded-lg shadow-sm"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{book.name}</h3>
                  <p className="text-sm text-gray-600">{book.description}</p>
                </div>
                <div className="text-green-700">
                    {book.status}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleViewOrEditBook(book, "view")}
                    className="bg-blue-500 px-2 py-1 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleViewOrEditBook(book, "edit")}
                    className="bg-yellow-500 px-2 py-1 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="bg-red-500 px-2 py-1 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View/Edit Book Modal */}
      {selectedBook && (
        <ViewEditBookModal
          book={selectedBook}
          type={actionType}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* Show error message if there was an issue */}
      {error && (
        <div className="text-red-500 mt-4">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Admin;

// Create Book Form Component
const CreateBookForm = ({ data, onCreateBook, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBook = { title, description };
    onCreateBook(newBook);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Create a New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="text-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};


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