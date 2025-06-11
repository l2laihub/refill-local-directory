import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/layout/Layout';
import NotFoundPage from '../pages/NotFoundPage.tsx';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('../pages/HomePage.tsx'));
const CityPage = lazy(() => import('../pages/CityPage.tsx'));
const StorePage = lazy(() => import('../pages/StorePage.tsx'));
const AddStorePage = lazy(() => import('../pages/AddStorePage.tsx'));
const CityRequestPage = lazy(() => import('../pages/CityRequestPage.tsx'));
const ComingSoonPage = lazy(() => import('../pages/ComingSoonPage.tsx'));

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
    ],
  },
]);
