// pages/index.tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Loading from './components/Loading';

export default function Index() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading

    if (session) {
      // If the user is authenticated, navigate to Home
      router.push('/components/Home');
    } else {
      // If the user is not authenticated, navigate to the hero
      router.push('/components/Hero');
    }
  }, [session, status, router]);


  return <Loading />; // Display a loading message while checking session
}