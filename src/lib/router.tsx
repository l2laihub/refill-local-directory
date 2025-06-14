import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/layout/Layout';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import ProtectedRoute from '../components/auth/ProtectedRoute'; // Import ProtectedRoute

// Lazy load page components for code splitting
const HomePage = lazy(() => import('../pages/HomePage.tsx'));
const CityPage = lazy(() => import('../pages/CityPage.tsx'));
const StorePage = lazy(() => import('../pages/StorePage.tsx'));
const AddStorePage = lazy(() => import('../pages/AddStorePage.tsx'));
const CityRequestPage = lazy(() => import('../pages/CityRequestPage.tsx'));
const ComingSoonPage = lazy(() => import('../pages/ComingSoonPage.tsx'));
const AdminModerationPage = lazy(() => import('../pages/AdminModerationPage.tsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.tsx'));
const SignupPage = lazy(() => import('../pages/SignupPage.tsx'));
const UserProfilePage = lazy(() => import('../pages/UserProfilePage.tsx'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage.tsx')); // Added AdminDashboardPage
const AdminImportStoresPage = lazy(() => import('../pages/AdminImportStoresPage.tsx'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-sage-600">Loading...</div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'cities/:citySlug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CityPage />
          </Suspense>
        ),
      },
      {
        path: 'stores/:storeId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StorePage />
          </Suspense>
        ),
      },
      {
        path: 'add-store',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AddStorePage />
          </Suspense>
        ),
      },
      {
        path: 'request-city',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CityRequestPage />
          </Suspense>
        ),
      },
      {
        path: 'coming-soon',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComingSoonPage />
          </Suspense>
        ),
      },
      // { // This route is now nested under /admin to be protected
      //   path: 'admin/moderate-stores',
      //   element: (
      //     <Suspense fallback={<PageLoader />}>
      //       <AdminModerationPage />
      //     </Suspense>
      //   ),
      // },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'signup',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SignupPage />
          </Suspense>
        ),
      },
      // Protected Routes Setup
      {
        element: <ProtectedRoute />, // Protects all nested routes that need authentication
        children: [
          {
            path: 'profile',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserProfilePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['admin']} />, // Protects admin routes
        children: [
          {
            path: 'admin', // Root admin route
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboardPage />
              </Suspense>
            ),
            children: [ // Nesting moderate-stores under /admin
              {
                path: 'moderate-stores', // Path becomes /admin/moderate-stores
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <AdminModerationPage />
                  </Suspense>
                ),
              },
              {
                path: 'import-stores', // Path becomes /admin/import-stores
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <AdminImportStoresPage />
                  </Suspense>
                ),
              },
            ]
          },
        ]
      }
    ],
  },
]);
