import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactElement, ComponentType } from 'react';
import Loading from './Loading';

/* 
This component is not currently being used as authentication is verified by layout component
But if needed, can wrap a component in this HOC to validate authentication 
*/
const withAuth = <P extends object>(Component: ComponentType<P>): ComponentType<P> => {
  const Auth = (props: P): ReactElement | null => {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
      return <Loading />;
    }

    if (!session) {
      router.push('/');
      return null;
    }

    return <Component {...props} />;
  };

  Auth.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;

  return Auth;
};

export default withAuth;
