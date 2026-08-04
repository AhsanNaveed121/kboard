import { Routes, Route } from "react-router-dom";

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      <Route path="/admin" element={
        <MainLayout>
          <AdminDashboard />
        </MainLayout>
      } />
      <Route path="/login" element={
        <Login />
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/boards" element={
        <MainLayout>
          <Boards />
        </MainLayout>
      } />
      <Route path="/boards/:boardId" element={
        <MainLayout>
          <BoardDetails />
        </MainLayout>
      } />
      <Route path="/profile" element={
        <MainLayout>
          <Profile />
        </MainLayout>
      } />
      <Route path="/settings" element={
        <MainLayout>
          <Settings />
        </MainLayout>
      } />

      {/*
        No layout wrapper here — OAuthSuccess redirects instantly.
        The user never actually sees it; it's just a processing stop.
      */}
      <Route path="/oauth-success" element={<OAuthSuccess />} />
    </Routes>
  );
}

export default AppRoutes;