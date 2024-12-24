import { Route, Routes } from 'react-router';
import App from '../App';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
    </Routes>
  );
};

export default DugaRoutes;
