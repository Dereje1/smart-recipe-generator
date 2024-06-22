import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';

interface ProtectedPageProps {
    session: Session | null;
}

export default function Protected({ session }: ProtectedPageProps) {
    if (!session) {
        return (
            <div>
                <h1>You are not signed in</h1>
                <button onClick={() => signIn()}>Sign in</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Protected Page</h1>
            <p>Welcome, {session.user?.name}</p>
            <button onClick={() => signOut()}>Sign out</button>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};
