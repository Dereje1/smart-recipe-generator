// pages/index.tsx
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/Home',
    permanent: false,
  },
});

export default function Index() {
  // Next.js never renders this component because it
  // performs the redirect on the server.
  return null;
}