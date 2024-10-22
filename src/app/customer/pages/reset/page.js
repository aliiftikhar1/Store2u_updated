'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successful!');

        // Redirect based on the user's role
        if (data.role === 'customer') {
          setTimeout(() => router.push('/customer/pages/login'), 3000); // Redirect to customer login
        } else if (data.role === 'admin') {
          setTimeout(() => router.push('/admin'), 3000); // Redirect to admin dashboard
        }
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <ToastContainer /> {/* Toast Container for displaying toasts */}
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
