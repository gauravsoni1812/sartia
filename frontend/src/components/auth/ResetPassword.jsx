/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/resetpasswordhandler', {
        token,
        email,
        newPassword,
      });
      setMessage(response.data.message);
      navigate("/sign-in")
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">Reset Password</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter a new password for <span className="font-medium text-gray-800">{email}</span>.
        </p>
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
