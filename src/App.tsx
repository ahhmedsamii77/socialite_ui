import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AppLayout from "./templates/AppLayout"
import Home from "./Pages/Home"
import { ThemeProvider } from "./components/theme-provider";
import AuthLayout from "./templates/AuthLayout";
import Signup from "./Pages/auth/Signup";
import Login from "./Pages/auth/Login";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { Toaster } from "react-hot-toast"
import AuthGuard from "./Guards/AuthGuard";
import AppGuard from "./Guards/AppGuard";
import ConfirmEmail from "./Pages/auth/ConfirmEmail";
import ForgetPassword from "./Pages/auth/ForgetPassword";
import VerifyResetPassword from "./Pages/auth/VerifyResetPassword";
import ResetPassword from "./Pages/auth/ResetPassword";
import { TooltipProvider } from "./components/ui/tooltip";
import { useEffect } from "react";
import { useAuthStore } from "./lib/store/auth";
import { reconnectSocket, socket } from "./lib/socket";
import PostPage from "./Pages/PostPage";
import SocketProvider from "./components/Socket/SocketProvider";
import Profile from "./Pages/Profile";
import Alerts from "./Pages/Alerts";
import People from "./Pages/People";
import Settings from "./Pages/Settings";
import Admin from "./Pages/Admin";
import Chat from "./Pages/Chat";

const router = createBrowserRouter([
  {
    path: "", element: <AppGuard>
      <AppLayout />
    </AppGuard>, children: [
      {
        index: true, element: <Home />,
      },
      {
        path: "/home", element: <Home />,
      },
      {
        path: "/alerts", element: <Alerts />,
      },
      {
        path: "/people", element: <People />,
      },
      {
        path: "/settings", element: <Settings />,
      },
      {
        path: "/admin", element: <Admin />,
      },
      {
        path: "/chat", element: <Chat />,
      },
      {
        path: "/post/:postId", element: <PostPage />,
      },
      {
        path: "/profile/:userId", element: <Profile />,
      },
    ],
  },
  {
    path: "/auth", element: <AuthGuard>
      <AuthLayout />
    </AuthGuard>, children: [
      {
        path: "signup", element: <Signup />
      },
      {
        path: "login", element: <Login />
      },
      {
        path: "confirm-email", element: <ConfirmEmail />
      },
      {
        path: "forget-password", element: <ForgetPassword />
      },
      {
        path: "verify-reset-password", element: <VerifyResetPassword />
      },
      {
        path: "reset-password", element: <ResetPassword />
      }
    ]
  }
]);

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 2 * 60 * 1000,
      retry: false
    }
  }
});

export default function App() {
  const { access_Token } = useAuthStore();
  useEffect(() => {
    if (access_Token) {
      reconnectSocket(access_Token);

    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [access_Token]);
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <QueryClientProvider client={client}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <SocketProvider />
              <RouterProvider router={router} />
            </GoogleOAuthProvider>
          </QueryClientProvider>
          <Toaster toastOptions={{
            className: "text-sm!",
            duration: 1000
          }} position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </>
  )
}
