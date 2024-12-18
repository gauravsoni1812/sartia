/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';

// Create a simple popup modal component using Tailwind CSS
const Modal = ({ isOpen, onClose, book, onBuy }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold mb-4">Buy {book.name}</h3>
        <p className="mb-4">Are you sure you want to buy this book?</p>
        <div className="flex justify-between">
          <button
            onClick={() => onBuy(book.id)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const User = () => {
  const [books, setBooks] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (!decoded.userId) {
          navigate("/sign-in");
        }
        if (decoded.role !== "user") {
          navigate("/sign-in");
        }
        setUserId(decoded.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/sign-in");
      }
    } else {
      navigate("/sign-in");
    }

    // Fetch approved books
    axios
      .get("http://localhost:3000/showBooks")
      .then((response) => {
        setBooks(response.data.books);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
      });

    // Fetch purchased books
    fetchPurchasedBooks(jwtDecode(token).userId);
  }, [navigate]);

  const fetchPurchasedBooks = (userId) => {
    axios
      .get(`http://localhost:3000/purchased/${userId}`)
      .then((response) => {
        console.log(response.data)
        setPurchasedBooks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching purchased books:", error);
      });
  };

  const handleBuyClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleBuyBook = (bookId) => {
    axios
      .post("http://localhost:3000/buyBook", { bookId, userId })
      .then((response) => {
        console.log("Book purchased:", response.data);
        alert("Book purchased successfully!");
        fetchPurchasedBooks();
        handleCloseModal();
      })
      .catch((error) => {
        console.error("Error buying the book:", error);
        alert("Failed to purchase the book.");
      });
  };

  // Sign Out Handler
  const handleSignOut = () => {
    Cookies.remove("authToken");
    navigate("/sign-in");
  };

  return (
    <div className="p-6">
      {/* Header with Sign Out button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Approved Books</h1>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Book List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{book.name}</h3>
            <p className="text-gray-700 mb-4">{book.description}</p>
            <button
              onClick={() => handleBuyClick(book)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* Modal for buying the book */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
        onBuy={handleBuyBook}
      />

      {/* View Purchased Books */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Purchased Books</h2>
        {purchasedBooks.length === 0 ? (
          <p>No books purchased yet.</p>
        ) : (
          <ul className="list-disc pl-5">
            {purchasedBooks.map((book) => (
              <li key={book.id} className="text-gray-700 mb-2">
                {console.log(book)}
                {book.book.name} - {book.book.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default User;
