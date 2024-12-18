/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie for managing cookies
import { jwtDecode } from "jwt-decode";

export default function SignIn() {
  const [email, setEmail] = useState(""); // Use email instead of username
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To store error messages
  const [isForgotPassword, setIsForgotPassword] = useState(false); // For toggling between login and forgot password views
  const [resetEmail, setResetEmail] = useState(""); // Email for reset password functionality
  const [resetError, setResetError] = useState(""); // Error for reset password
  const navigate = useNavigate(); // Hook for navigation
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    try {
      const decodedToken = jwtDecode(authToken);
      const userId = decodedToken?.userId;

      if (userId) {
        navigate("/");
      }
    } catch (error) {
      // Invalid token handling can be added here if needed
    }
  }, []);

  // Function to handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const credentials = {
      email: email, // Send email to the backend
      password: password,
    };

    try {
      const response = await fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log(data)
      if (response.status === 200) {
        // Store token in cookies
        const token = data.token;
        Cookies.set("authToken", token, { expires: 1, secure: true }); // 1-day expiration, secure in production

        // Navigate to appropriate page based on role
        if(data.role === "admin"){
            navigate("/admin");
        } else if(data.role === "superadmin"){
            navigate("/superadmin");
        } else {
            navigate("/user");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setError("Something went wrong, please try again.");
    }
  };

  // Function to handle password reset request
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setResetError("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.status === 200) {
        alert(data.message || "If an account with that email exists, you will receive a password reset email.");
        setIsForgotPassword(false); // Switch back to the login screen
      } else {
        setResetError(data.error || "Something went wrong, please try again.");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setResetError("An error occurred, please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          {isForgotPassword ? "Reset Password" : "Sign In"}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Login form */}
        {!isForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
        ) : (
          // Forgot Password form
          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email for password reset */}
            <div>
              <label htmlFor="reset-email" className="block text-sm/6 font-medium text-gray-900">
                Enter your email to reset your password
              </label>
              <div className="mt-2">
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            {/* Reset Error Message */}
            {resetError && <p className="text-red-500 text-sm">{resetError}</p>}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password link */}
        {!isForgotPassword && (
          <p className="mt-2 text-center text-sm/6 text-gray-500">
            <button
              onClick={() => setIsForgotPassword(true)}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </button>
          </p>
        )}

        {/* Back to Login link after resetting password */}
        {isForgotPassword && (
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Remembered your password?{" "}
            <button
              onClick={() => setIsForgotPassword(false)}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Back to Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
