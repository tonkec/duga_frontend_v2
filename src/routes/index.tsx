import { Route, Routes } from 'react-router';
import App from '../App';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import MyProfilePage from '../pages/MyProfilePage';
import EditMyProfilePage from '../pages/EditMyProfilePage';
import ResetPassword from '../pages/ResetPassword';
import VerificationPage from '../pages/VerificationPage';
import OtherUserPage from '../pages/OtherUserPage';
import PhotoPage from '../pages/PhotoPage';
import NewChatPage from '../pages/NewChatPage';
import ChatPage from '../pages/ChatPage';
import NotFoundPage from '../pages/NotFoundPage';
import { AuthGuard } from './guards/AuthGuard';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFoundPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <App />
          </AuthGuard>
        }
      />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="verification" element={<VerificationPage />} />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <MyProfilePage />
          </AuthGuard>
        }
      />

      <Route
        path="/edit"
        element={
          <AuthGuard>
            <EditMyProfilePage />
          </AuthGuard>
        }
      />

      <Route
        path="/user/:userId"
        element={
          <AuthGuard>
            <OtherUserPage />
          </AuthGuard>
        }
      />

      <Route
        path="/photo/:photoId"
        element={
          <AuthGuard>
            <PhotoPage />
          </AuthGuard>
        }
      />

      <Route
        path="/new-chat"
        element={
          <AuthGuard>
            <NewChatPage />
          </AuthGuard>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <AuthGuard>
            <ChatPage />
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default DugaRoutes;
