/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios"; // Import axios for making HTTP requests
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import CreateBookForm from "./createBookFrom";
import ViewEditBookModal from "./viewEditModal";

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
        if (!decoded.userId) {
          navigate("/sign-in")
        }
        if (decoded.role !== "admin") {
          navigate("/sign-in")
        }
        setData(decoded.email)
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      navigate("/sign-in")
    }
  }, []);

  console.log(data)
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
        createdBy: data, // Use the user's email (from token)
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

  const handleDeleteBook =async()=>{
    
  }

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


