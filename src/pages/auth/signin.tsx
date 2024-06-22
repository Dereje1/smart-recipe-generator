import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers';
import { LiteralUnion } from 'next-auth/react/types';

export default function SignIn({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            {providers && Object.values(providers).map((provider: ClientSafeProvider) => (
                <div key={provider.name}>
                    <button onClick={() => signIn(provider.id)}>
                        Sign in with {provider.name}
                    </button>
                </div>
            ))}
        </>
    );
}

export const getServerSideProps: GetServerSideProps<{
    providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null;
}> = async (context) => {
    const providers = await getProviders();
    return {
        props: { providers },
    };
};
