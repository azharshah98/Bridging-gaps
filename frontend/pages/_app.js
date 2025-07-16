import { useRouter } from 'next/router';
import AuthProvider from '../components/auth/AuthProvider';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Layout from '../components/Layout';
import '../styles/globals.css';

// Public routes that don't require authentication
const publicRoutes = ['/login'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isPublicRoute = publicRoutes.includes(router.pathname);

  return (
    <AuthProvider>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}

export default MyApp; 