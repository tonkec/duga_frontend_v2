import { Route, Routes } from 'react-router';
import App from '../App';
import LoginPage from '../pages/Login';
import MyProfilePage from '../pages/MyProfilePage';
import EditMyProfilePage from '../pages/EditMyProfilePage';
import OtherUserPage from '../pages/OtherUserPage';
import PhotoPage from '../pages/PhotoPage';
import NewChatPage from '../pages/NewChatPage';
import ChatPage from '../pages/ChatPage';
import NotFoundPage from '../pages/NotFoundPage';
import { AuthGuard } from './guards/AuthGuard';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import { Layout } from '../components/HelmetLayout/index';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <AuthGuard>
            <Layout title="Not Found | Duga">
              <NotFoundPage />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/"
        element={
          <Layout title="Home | Duga">
            <AuthGuard>
              <App />
            </AuthGuard>
          </Layout>
        }
      />
      <Route
        path="login"
        element={
          <Layout title="Login | Duga">
            <LoginPage />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout title="My Profile | Duga">
            <AuthGuard>
              <MyProfilePage />
            </AuthGuard>
          </Layout>
        }
      />

      <Route
        path="/edit"
        element={
          <Layout title="Edit Profile | Duga">
            <AuthGuard>
              <EditMyProfilePage />
            </AuthGuard>
          </Layout>
        }
      />

      <Route
        path="/user/:userId"
        element={
          <Layout title="User Profile | Duga">
            <AuthGuard>
              <OtherUserPage />
            </AuthGuard>
          </Layout>
        }
      />

      <Route
        path="/photo/:photoId"
        element={
          <Layout title="Photo | Duga">
            <AuthGuard>
              <PhotoPage />
            </AuthGuard>
          </Layout>
        }
      />

      <Route
        path="/new-chat"
        element={
          <Layout title="New Chat | Duga">
            <AuthGuard>
              <NewChatPage />
            </AuthGuard>
          </Layout>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <Layout title="Chat | Duga">
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          </Layout>
        }
      />

      <Route
        path="verify-email"
        element={
          <Layout title="Verify Email | Duga">
            <VerifyEmailPage />
          </Layout>
        }
      />
    </Routes>
  );
};

export default DugaRoutes;
