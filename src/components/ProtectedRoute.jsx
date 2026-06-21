import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('auth_token');
  
  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Jika ada token, render halaman anak (Outlet)
  return <Outlet />;
}