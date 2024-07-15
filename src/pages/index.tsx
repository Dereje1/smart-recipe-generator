// pages/index.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Loading from '../components/Loading';

export default function Index() {
  const router = useRouter()
  useEffect(() => {
    router.push('/Home')
  }, [router])
  return <Loading />;
}