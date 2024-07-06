import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head'
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <Layout>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                </Head>
                <Component {...pageProps} />
            </Layout>
        </SessionProvider>
    );
}

export default MyApp;
