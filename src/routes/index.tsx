import { Route, Routes } from 'react-router';
import App from '../App';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import MyProfilePage from '../pages/MyProfilePage';
import { AuthGuard } from './guards/AuthGuard';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard>
            <App />
          </AuthGuard>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <MyProfilePage />
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default DugaRoutes;
