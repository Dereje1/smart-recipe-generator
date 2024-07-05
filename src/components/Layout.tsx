import React from 'react';
import { useSession } from 'next-auth/react';
import Header from './Header';
import Hero from '../pages/Hero';
import Loading from './Loading'

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
      <main>{children}</main>
    </div>
  );
};

export default Layout;
