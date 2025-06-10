import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';
import CityPage from '../pages/CityPage';
import StorePage from '../pages/StorePage';
import AddStorePage from '../pages/AddStorePage';
import ComingSoonPage from '../pages/ComingSoonPage';
import NotFoundPage from '../pages/NotFoundPage';

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
        path: 'coming-soon',
        element: <ComingSoonPage />,
      },
    ],
  },
]);
