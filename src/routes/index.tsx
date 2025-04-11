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
          <AuthGuard>
            <Layout title="Home | Duga">
              <App />
            </Layout>
          </AuthGuard>
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
          <AuthGuard>
            <Layout title="My Profile | Duga">
              <MyProfilePage />
            </Layout>
          </AuthGuard>
        }
      />

      <Route
        path="/edit"
        element={
          <AuthGuard>
            <Layout title="Edit Profile | Duga">
              <EditMyProfilePage />
            </Layout>
          </AuthGuard>
        }
      />

      <Route
        path="/user/:userId"
        element={
          <AuthGuard>
            <Layout title="User Profile | Duga">
              <OtherUserPage />
            </Layout>
          </AuthGuard>
        }
      />

      <Route
        path="/photo/:photoId"
        element={
          <AuthGuard>
            <Layout title="Photo | Duga">
              <PhotoPage />
            </Layout>
          </AuthGuard>
        }
      />

      <Route
        path="/new-chat"
        element={
          <AuthGuard>
            <Layout title="New Chat | Duga">
              <NewChatPage />
            </Layout>
          </AuthGuard>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <AuthGuard>
            <Layout title="Chat | Duga">
              <ChatPage />
            </Layout>
          </AuthGuard>
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
