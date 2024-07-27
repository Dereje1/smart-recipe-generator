import React from 'react';
import { useSession } from 'next-auth/react';
import Header from './Header';
import Hero from '../pages/Hero';
import Loading from './Loading'

/* Note all components will be wrapped in this component which in turn is rendered by _app.tsx */
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Loading />;
  }

  if (!session) {
    return <Hero />
  }

  return (
    <div>
      <Header user={session.user}/>
      <main className="min-h-screen bg-green-50">{children}</main>
    </div>
  );
};

export default Layout;
