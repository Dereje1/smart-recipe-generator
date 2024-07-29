import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from './Header';
import Hero from '../pages/Hero';
import Loading from './Loading'
import ErrorPage from '../pages/auth/error';

/* Note all components will be wrapped in this component which in turn is rendered by _app.tsx */
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error: signinError } = router.query;

  if (signinError) {
    return <ErrorPage />
  }

  if (router.pathname === '/_error') {
    return <ErrorPage message="Page not found"/>
  }

  if (status === 'loading') {
    return <Loading />;
  }

  if (!session) {
    return <Hero />
  }

  return (
    <div>
      <Header user={session.user} />
      <main className="min-h-screen bg-green-50">{children}</main>
    </div>
  );
};

export default Layout;
