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
import CookiePolicyPage from '@app/pages/CookiePolicyPage';
import OnlineStatusWrapper from '@app/components/OnlineStatusWrapper';
import PrivacyPolicyPage from '@app/pages/PrivacyPolicyPage';
import TermsOfUsePage from '@app/pages/RulesPage';
import ReportPage from '@app/pages/ReportPage';
import PostLoginPage from '@app/pages/PostLoginPage';
import PostLoginGuard from './guards/PostLoginGuard'; // ← add this import

const DugaRoutes = () => {
  return (
    <Routes>
      {/* Public */}
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
      <Route
        path="cookie-policy"
        element={
          <PageTitle title="Politika kolačića">
            <CookiePolicyPage />
          </PageTitle>
        }
      />
      <Route
        path="privacy-policy"
        element={
          <PageTitle title="Politika privatnosti">
            <PrivacyPolicyPage />
          </PageTitle>
        }
      />
      <Route
        path="terms-of-use"
        element={
          <PageTitle title="Uvjeti korištenja">
            <TermsOfUsePage />
          </PageTitle>
        }
      />

      {/* Logged-in but NOT necessarily onboarded (can access post-login flow) */}
      <Route
        path="post-login"
        element={
          <AuthGuard>
            <PageTitle title="Post Login">
              <PostLoginPage />
            </PageTitle>
          </AuthGuard>
        }
      />

      {/* Logged-in AND onboarded only */}
      <Route
        element={
          <AuthGuard>
            <PostLoginGuard />
          </AuthGuard>
        }
      >
        <Route
          path="/"
          element={
            <PageTitle title="Početna">
              <App />
            </PageTitle>
          }
        />
        <Route
          path="/profile"
          element={
            <PageTitle title="Moj profil">
              <OnlineStatusWrapper isCurrentUser>
                <MyProfilePage />
              </OnlineStatusWrapper>
            </PageTitle>
          }
        />
        <Route
          path="/edit"
          element={
            <PageTitle title="Uredi profil">
              <EditMyProfilePage />
            </PageTitle>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <PageTitle title="Profil korisnika">
              <OnlineStatusWrapper>
                <OtherUserPage />
              </OnlineStatusWrapper>
            </PageTitle>
          }
        />
        <Route
          path="/photo/:photoId"
          element={
            <PageTitle title="Fotografija">
              <PhotoPage />
            </PageTitle>
          }
        />
        <Route
          path="/new-chat"
          element={
            <PageTitle title="Novi chat">
              <NewChatPage />
            </PageTitle>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <PageTitle title="Chat">
              <OnlineStatusWrapper>
                <ChatPage />
              </OnlineStatusWrapper>
            </PageTitle>
          }
        />
        <Route
          path="/settings"
          element={
            <PageTitle title="Postavke">
              <SettingsPage />
            </PageTitle>
          }
        />
        <Route
          path="/report"
          element={
            <PageTitle title="Prijavi problem">
              <ReportPage />
            </PageTitle>
          }
        />
        {/* 404 for onboarded, logged-in users */}
        <Route
          path="*"
          element={
            <PageTitle title="Stranica nije pronađena">
              <NotFoundPage />
            </PageTitle>
          }
        />
      </Route>

      {/* Fallback 404 for public/unauthed routes */}
      <Route
        path="*"
        element={
          <PageTitle title="Stranica nije pronađena">
            <NotFoundPage />
          </PageTitle>
        }
      />
    </Routes>
  );
};

export default DugaRoutes;
