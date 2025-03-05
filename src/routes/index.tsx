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
    </Routes>
  );
};

export default DugaRoutes;
