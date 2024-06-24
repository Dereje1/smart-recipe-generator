import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SignIn() {
  const router = useRouter();
  const { error } = router.query;

  useEffect(() => {
    console.log('SignIn Page Loaded with Error:', error);
    if (error) {
      router.push(`/auth/error?error=${error}`)
    }
  }, [error, router]);

  return null;
}
