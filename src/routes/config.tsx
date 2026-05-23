import App from '@app/App';
import LoginPage from '@app/pages/Login';
import MyProfilePage from '@app/pages/MyProfilePage';
import EditMyProfilePage from '@app/pages/EditMyProfilePage';
import OtherUserPage from '@app/pages/OtherUserPage';
import PhotoPage from '@app/pages/PhotoPage';
import NewChatPage from '@app/pages/NewChatPage';
import NotFoundPage from '@app/pages/NotFoundPage';
import VerifyEmailPage from '@app/pages/VerifyEmailPage';
import SettingsPage from '@app/pages/SettingsPage';
import ChatPage from '@app/pages/ChatPage';
import CookiePolicyPage from '@app/pages/CookiePolicyPage';
import OnlineStatusWrapper from '@app/components/OnlineStatusWrapper';
import PrivacyPolicyPage from '@app/pages/PrivacyPolicyPage';
import TermsOfUsePage from '@app/pages/RulesPage';
import ReportPage from '@app/pages/ReportPage';
import PostLoginPage from '@app/pages/PostLoginPage';
import UsersPage from '@app/pages/UsersPage';
import { PageTitle } from '@app/components/PageTitle';
import { AuthGuard } from './guards/AuthGuard';
import PostLoginFormGuard from './guards/PostLoginFormGuard';
import RecordNotFound from '@app/pages/RecordNotFound';
import BrokenPage from '@app/pages/BrokenPage';
import NetworkErrorPage from '@app/pages/NetworkErrorPage';

export const publicRoutes = [
  {
    path: 'verify-email',
    element: (
      <PageTitle title="Verifikacija emaila">
        <VerifyEmailPage />
      </PageTitle>
    ),
  },
  {
    path: 'login',
    element: (
      <PageTitle title="Login">
        <LoginPage />
      </PageTitle>
    ),
  },
  {
    path: 'cookie-policy',
    element: (
      <PageTitle title="Politika kolačića">
        <CookiePolicyPage />
      </PageTitle>
    ),
  },
  {
    path: 'privacy-policy',
    element: (
      <PageTitle title="Politika privatnosti">
        <PrivacyPolicyPage />
      </PageTitle>
    ),
  },
  {
    path: 'terms-of-use',
    element: (
      <PageTitle title="Uvjeti korištenja">
        <TermsOfUsePage />
      </PageTitle>
    ),
  },
  {
    path: '/network-error',
    element: (
      <PageTitle title="Nešto se strgalo">
        <NetworkErrorPage />
      </PageTitle>
    ),
  },
];

// Logged-in but NOT necessarily onboarded — and block onboarded users
export const privateRoutes = [
  {
    path: 'post-login',
    element: (
      <AuthGuard>
        <PostLoginFormGuard>
          <PageTitle title="Post Login">
            <PostLoginPage />
          </PageTitle>
        </PostLoginFormGuard>
      </AuthGuard>
    ),
  },
];

// Logged-in AND onboarded only
export const onboardedRoutes = [
  {
    path: '/',
    element: (
      <PageTitle title="Početna">
        <App />
      </PageTitle>
    ),
  },
  {
    path: '/profile',
    element: (
      <PageTitle title="Moj profil">
        <OnlineStatusWrapper isCurrentUser>
          <MyProfilePage />
        </OnlineStatusWrapper>
      </PageTitle>
    ),
  },
  {
    path: '/users',
    element: (
      <PageTitle title="Svi korisnici">
        <UsersPage />
      </PageTitle>
    ),
  },
  {
    path: '/edit',
    element: (
      <PageTitle title="Uredi profil">
        <EditMyProfilePage />
      </PageTitle>
    ),
  },
  {
    path: '/user/:userId',
    element: (
      <PageTitle title="Profil korisnika">
        <OnlineStatusWrapper>
          <OtherUserPage />
        </OnlineStatusWrapper>
      </PageTitle>
    ),
  },
  {
    path: '/photo/:photoId',
    element: (
      <PageTitle title="Fotografija">
        <PhotoPage />
      </PageTitle>
    ),
  },
  {
    path: '/new-chat',
    element: (
      <PageTitle title="Novi chat">
        <NewChatPage />
      </PageTitle>
    ),
  },
  {
    path: '/chat/:chatId',
    element: (
      <PageTitle title="Chat">
        <OnlineStatusWrapper>
          <ChatPage />
        </OnlineStatusWrapper>
      </PageTitle>
    ),
  },
  {
    path: '/settings',
    element: (
      <PageTitle title="Postavke">
        <SettingsPage />
      </PageTitle>
    ),
  },
  {
    path: '/report',
    element: (
      <PageTitle title="Prijavi problem">
        <ReportPage />
      </PageTitle>
    ),
  },
  {
    path: '/record-not-found',
    element: (
      <PageTitle title="Ne postoji">
        <RecordNotFound />
      </PageTitle>
    ),
  },
  {
    path: '/broken',
    element: (
      <PageTitle title="Nešto se strgalo">
        <BrokenPage />
      </PageTitle>
    ),
  },
  {
    path: '*',
    element: (
      <PageTitle title="Stranica nije pronađena">
        <NotFoundPage />
      </PageTitle>
    ),
  },
];
