import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Boards from "../pages/Boards";
import BoardDetails from "../pages/BoardDetails";
import AdminDashboard from "../pages/AdminDashboard";
import OAuthSuccess from "../pages/OAuthSuccess";
import MainLayout from "../layouts/Mainlayout";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Home />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <MainLayout>
            <AdminDashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/login" element={
        <Login />
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/boards" element={
        <ProtectedRoute>
          <MainLayout>
            <Boards />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/boards/:boardId" element={
        <ProtectedRoute>
          <MainLayout>
            <BoardDetails />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <Profile />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/*
        No layout wrapper here — OAuthSuccess redirects instantly.
        The user never actually sees it; it's just a processing stop.
      */}
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;