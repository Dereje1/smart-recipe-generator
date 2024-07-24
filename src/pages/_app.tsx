import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '../components/Loading';
import Head from 'next/head'
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const start = () => {
            setLoading(true);
        };
        const end = () => {
            setLoading(false);
        };
        router.events.on('routeChangeStart', start)
        router.events.on('routeChangeComplete', end)
        router.events.on('routeChangeError', end)
        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', start)
            router.events.off('routeChangeComplete', end)
            router.events.off('routeChangeError', end)
        }
    }, [router])

    return loading ? <Loading /> : (
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
