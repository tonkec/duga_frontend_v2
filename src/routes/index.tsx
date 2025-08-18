import { Routes, Route } from 'react-router';
import { AuthGuard } from './guards/AuthGuard';
import PostLoginGuard from './guards/PostLoginGuard';
import { publicRoutes, privateRoutes, onboardedRoutes } from './config';
import NotFoundPage from '@app/pages/NotFoundPage';
import { PageTitle } from '@app/components/PageTitle';

const DugaRoutes = () => {
  return (
    <Routes>
      {publicRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}

      {privateRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={<AuthGuard>{r.element}</AuthGuard>} />
      ))}

      <Route
        element={
          <AuthGuard>
            <PostLoginGuard />
          </AuthGuard>
        }
      >
        {onboardedRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>

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
