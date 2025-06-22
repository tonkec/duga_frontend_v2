import { Route, Routes } from 'react-router';
import App from '@app/App';
import LoginPage from '@app/pages/Login';
import MyProfilePage from '@app/pages/MyProfilePage';
import EditMyProfilePage from '@app/pages/EditMyProfilePage';
import OtherUserPage from '@app/pages/OtherUserPage';
import PhotoPage from '@app/pages/PhotoPage';
import NewChatPage from '@app/pages/NewChatPage';
import NotFoundPage from '@app/pages/NotFoundPage';
import { AuthGuard } from './guards/AuthGuard';
import VerifyEmailPage from '@app/pages/VerifyEmailPage';
import SettingsPage from '@app/pages/SettingsPage';
import { PageTitle } from '@app/components/PageTitle';
import ChatPage from '@app/pages/ChatPage';
import OnlineStatusWrapper from '@app/components/OnlineStatusWrapper';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <AuthGuard>
            <PageTitle title="Stranica nije pronađena">
              <NotFoundPage />
            </PageTitle>
          </AuthGuard>
        }
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <PageTitle title="Početna">
              <App />
            </PageTitle>
          </AuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <PageTitle title="Moj profil">
              <OnlineStatusWrapper isCurrentUser>
                <MyProfilePage />
              </OnlineStatusWrapper>
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="/edit"
        element={
          <AuthGuard>
            <PageTitle title="Uredi profil">
              <EditMyProfilePage />
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="/user/:userId"
        element={
          <AuthGuard>
            <PageTitle title="Profil korisnika">
              <OnlineStatusWrapper>
                <OtherUserPage />
              </OnlineStatusWrapper>
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="/photo/:photoId"
        element={
          <AuthGuard>
            <PageTitle title="Fotografija">
              <PhotoPage />
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="/new-chat"
        element={
          <AuthGuard>
            <PageTitle title="Novi chat">
              <NewChatPage />
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <AuthGuard>
            <PageTitle title="Chat">
              <OnlineStatusWrapper>
                <ChatPage />
              </OnlineStatusWrapper>
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="/settings"
        element={
          <AuthGuard>
            <PageTitle title="Postavke">
              <SettingsPage />
            </PageTitle>
          </AuthGuard>
        }
      />

      <Route
        path="verify-email"
        element={
          <PageTitle title="Verifikacija emaila">
            <VerifyEmailPage />
          </PageTitle>
        }
      />
      <Route
        path="login"
        element={
          <PageTitle title="Login">
            <LoginPage />
          </PageTitle>
        }
      />
    </Routes>
  );
};

export default DugaRoutes;
