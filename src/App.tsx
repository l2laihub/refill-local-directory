import ComingSoon from './components/ComingSoon';
import EmailSignup from './components/EmailSignup';
import HowItWorks from './components/HowItWorks';
import WhyRefillLocal from './components/WhyRefillLocal';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Layout>
      <HowItWorks />
      <WhyRefillLocal />
      <ComingSoon />
      <EmailSignup />
    </Layout>
  );
}

export default App;