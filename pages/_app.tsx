import type { AppProps } from 'next/app';
import AppProviders from '../components/providers/AppProviders';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}

export default MyApp; 