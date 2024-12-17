/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // For managing cookies
import { useNavigate } from "react-router-dom"; // For navigation
import axios from "axios"; // For making API calls
import { jwtDecode } from "jwt-decode";

const SuperAdmin = () => {
    const navigate = useNavigate(); // Hook for navigation
    const [activeSection, setActiveSection] = useState(null);

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("user"); // Default role is "user"
    const [errorMessage, setErrorMessage] = useState(""); // State to store error message

    // Books state
    const [books, setBooks] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token); // Decode the JWT token
                setCurrentUser(decoded.email); // Store the decoded user data (userId, email, etc.)
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        } else {
            navigate("/sign-in")
            console.log("No token found");
        }
    }, []);
    // Fetch books from the API when "Show Books" section is active
    useEffect(() => {
        if (activeSection === "showBooks") {
            const fetchBooks = async () => {
                try {
                    const response = await axios.get("http://localhost:3000/getAllBooks"); // Adjust the URL to match your backend endpoint
                    setBooks(response.data.books); // Update books state with the fetched data
                } catch (error) {
                    console.error("Error fetching books:", error);
                    setErrorMessage("Failed to fetch books. Please try again.");
                }
            };

            fetchBooks();
        }
    }, [activeSection]); // Trigger when the section changes

    // Handle the API request for creating a user/admin
    const handleCreateUser = async () => {
        try {
            // Reset the error message before making the request
            setErrorMessage("");

            // Prepare data for API call
            const userData = {
                email,
                password,
                name,
                role,
            };

            // Send POST request to create user/admin
            const response = await axios.post("http://localhost:3000/createUser", userData); // Adjust the URL to match your backend endpoint

            // Handle success
            alert(`Account created successfully! Role: ${role}`);
            setEmail("");
            setPassword("");
            setName("");
        } catch (error) {
            console.error("Error creating user/admin:", error);

            // Check if the error response is due to an existing user or any other issue
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message); // Display the error message
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }
    };

    // Update book status with status and updatedBy (current logged-in user)
    const handleChangeBookStatus = async (bookId, status) => {
        try {
            // Prepare data for API call
            const updatedBookData = {
                bookId,
                status,
                updatedBy: currentUser || "Unknown", // Set the current logged-in user as the updatedBy field
            };

            // Send the update request to API
            const response = await axios.patch(`http://localhost:3000/updateBook`, updatedBookData);  

            // Handle success
            console.log(response.data)
            if (response.data.success) {
                // Update the status locally if successful
                const updatedBooks = books.map((book) =>
                    book.id === bookId ? { ...book, status } : book
                );
                setBooks(updatedBooks);
                alert(`Book status updated to "${status}" successfully!`);
            }
        } catch (error) {
            console.error("Error updating book status:", error);
            setErrorMessage("Failed to update book status. Please try again.");
        }
    };

    // Handle SignOut (clear the token and navigate to login)
    const handleSignOut = () => {
        Cookies.remove("authToken"); // Remove the authentication token from cookies
        navigate("/sign-in"); // Navigate to login page (make sure you have this route)
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="p-5 bg-white shadow-lg rounded-md w-96">
                <h1 className="text-2xl font-bold mb-4 text-center">SuperAdmin Dashboard</h1>

                {/* Buttons for Create User, Create Admin, Show Books in One Row */}
                <div className="mb-6 text-center flex justify-between space-x-4">
                    <button
                        onClick={() => setActiveSection("createUser")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                    >
                        Create User
                    </button>

                    <button
                        onClick={() => setActiveSection("createAdmin")}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
                    >
                        Create Admin
                    </button>

                    <button
                        onClick={() => setActiveSection("showBooks")}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none"
                    >
                        Show Books
                    </button>
                </div>

                {/* Conditional Rendering for Active Section */}
                {activeSection === "createUser" && (
                    <div className="mb-6 border p-4 rounded-md">
                        <h2 className="text-xl mb-2 text-center">Create User</h2>

                        {/* Error Message */}
                        {errorMessage && (
                            <p className="text-red-600 text-sm mb-2">{errorMessage}</p>
                        )}

                        <div className="mb-2">
                            <label>Name </label>
                            <input
                                type="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label>Email: </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label>Password: </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <button
                            onClick={() => {
                                setRole("user"); // Set role to "user" for this section
                                handleCreateUser();
                            }}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
                        >
                            Submit
                        </button>
                    </div>
                )}

                {activeSection === "createAdmin" && (
                    <div className="mb-6 border p-4 rounded-md">
                        <h2 className="text-xl mb-2 text-center">Create Admin</h2>
                        {/* Error Message */}
                        {errorMessage && (
                            <p className="text-red-600 text-sm mb-2">{errorMessage}</p>
                        )}

                        <div className="mb-2">
                            <label>Name: </label>
                            <input
                                type="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label>Email: </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <label>Password: </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <button
                            onClick={() => {
                                setRole("admin"); // Set role to "admin" for this section
                                handleCreateUser();
                            }}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
                        >
                            Submit
                        </button>
                    </div>
                )}

                {activeSection === "showBooks" && (
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-center">Books List</h2>
                        <ul>
                            {books.length === 0 ? (
                                <p className="text-center text-red-600">No books available</p>
                            ) : (
                                books.map((book) => (
                                    <li key={book.id} className="mb-4 border-b pb-2">
                                        <p>
                                            <strong>Name:</strong> {book.name}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`${book.status === "approved"
                                                        ? "text-green-600"
                                                        : book.status === "rejected"
                                                            ? "text-red-600"
                                                            : "text-yellow-600"
                                                    }`}
                                            >
                                                {book.status}
                                            </span>
                                        </p>
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleChangeBookStatus(book.id, "approved")}
                                                className="mr-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleChangeBookStatus(book.id, "rejected")}
                                                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Sign Out Button Outside the Box */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SuperAdmin;
