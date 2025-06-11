import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage.tsx';
import CityPage from '../pages/CityPage.tsx';
import StorePage from '../pages/StorePage.tsx';
import AddStorePage from '../pages/AddStorePage.tsx';
import CityRequestPage from '../pages/CityRequestPage.tsx';
import ComingSoonPage from '../pages/ComingSoonPage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'cities/:citySlug',
        element: <CityPage />,
      },
      {
        path: 'stores/:storeId',
        element: <StorePage />,
      },
      {
        path: 'add-store',
        element: <AddStorePage />,
      },
      {
        path: 'request-city',
        element: <CityRequestPage />,
      },
      {
        path: 'coming-soon',
        element: <ComingSoonPage />,
      },
    ],
  },
]);
