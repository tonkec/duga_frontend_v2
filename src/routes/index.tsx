import { Route, Routes } from 'react-router';
import App from '@app/App';
import LoginPage from '@app/pages/Login';
import MyProfilePage from '@app/pages/MyProfilePage';
import EditMyProfilePage from '@app/pages/EditMyProfilePage';
import OtherUserPage from '@app/pages/OtherUserPage';
import PhotoPage from '@app/pages/PhotoPage';
import NewChatPage from '@app/pages/NewChatPage';
import ChatPage from '@app/pages/ChatPage';
import NotFoundPage from '@app/pages/NotFoundPage';
import { AuthGuard } from './guards/AuthGuard';
import VerifyEmailPage from '@app/pages/VerifyEmailPage';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <AuthGuard>
            <NotFoundPage />
          </AuthGuard>
        }
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <App />
          </AuthGuard>
        }
      />
      <Route path="login" element={<LoginPage />} />
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

      <Route path="verify-email" element={<VerifyEmailPage />} />
    </Routes>
  );
};

export default DugaRoutes;
