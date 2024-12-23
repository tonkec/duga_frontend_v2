import { Route, Routes } from 'react-router';
import App from '../App';
import LoginPage from '../pages/Login';

const DugaRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default DugaRoutes;
