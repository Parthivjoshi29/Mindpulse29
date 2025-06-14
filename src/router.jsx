import { createBrowserRouter, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from "./components/UI/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import CalmZone from "./pages/CalmZone";
import Gamification from "./pages/Gamification";
import AIChat from "./pages/AIChat";
import UserTest from "./pages/UserTest";

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "journal",
        element: (
          <ProtectedRoute>
            <Journal />
          </ProtectedRoute>
        ),
      },
      {
        path: "calm-zone",
        element: (
          <ProtectedRoute>
            <CalmZone />
          </ProtectedRoute>
        ),
      },
      {
        path: "progress",
        element: (
          <ProtectedRoute>
            <Gamification />
          </ProtectedRoute>
        ),
      },
      {
        path: "ai-chat",
        element: (
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-test",
        element: (
          <ProtectedRoute>
            <UserTest />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
