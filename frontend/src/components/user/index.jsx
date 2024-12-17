/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    // Fetch approved books from the API
    axios.get('http://localhost:3000/showBooks')
      .then(response => {
        setBooks(response.data.books);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      });
  }, []);

  const handleBuyClick = (book) => {
    // Show the modal when the "Buy" button is clicked
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    // Close the modal
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleBuyBook = (bookId) => {
    const userId = "user-id"; // Replace this with the actual logged-in user's ID

    // Call the API to purchase the book
    axios.post('http://localhost:3000/buyBook', { bookId, userId })
      .then(response => {
        console.log('Book purchased:', response.data);
        alert('Book purchased successfully!');
        handleCloseModal(); // Close the modal after purchase
      })
      .catch(error => {
        console.error('Error buying the book:', error);
        alert('Failed to purchase the book.');
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Approved Books</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
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
    </div>
  );
};

export default User;
