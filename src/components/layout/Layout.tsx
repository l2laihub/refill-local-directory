import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import Header from '../Header';

const Layout = () => (
  <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
