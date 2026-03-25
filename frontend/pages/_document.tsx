import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://api.whilab.com.br' : 'http://localhost:4000');
    const developmentCSP = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${apiUrl} https://*.supabase.co wss://*.supabase.co; worker-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self';`;
    const productionCSP = `default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${apiUrl} https://*.supabase.co wss://*.supabase.co; worker-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self';`;

    const csp = process.env.NODE_ENV === 'production' ? productionCSP : developmentCSP;

  return (
      <Html lang="pt-BR">
      <Head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/whilab-mark.png" />
        <meta name="application-name" content="WHILAB Encomendas" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WHILAB Encomendas" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
        <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    );
  }
}

export default MyDocument;
