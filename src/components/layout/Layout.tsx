import type { PropsWithChildren } from 'react';
import Footer from '../Footer';
import Header from '../Header';

const Layout = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

export default Layout;