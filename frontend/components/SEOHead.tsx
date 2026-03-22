import Head from 'next/head';
import { dashboardBranding } from '../config/branding';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = dashboardBranding.seoKeywords,
  canonical,
  ogImage = `${dashboardBranding.siteUrl}/features/dashboard.jpg`,
  ogType = 'website',
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = `${title} | ${dashboardBranding.brandNameUpper} - ${dashboardBranding.marketingTagline}`;
  const url = canonical ? `${dashboardBranding.siteUrl}${canonical}` : dashboardBranding.siteUrl;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <link rel="canonical" href={url} />

      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={dashboardBranding.brandNameUpper} />
      <meta property="og:locale" content="pt_BR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description,
            url,
            publisher: {
              '@type': 'Organization',
              name: dashboardBranding.brandNameUpper,
              url: dashboardBranding.siteUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${dashboardBranding.siteUrl}/logo.svg`,
              },
            },
          }),
        }}
      />
    </Head>
  );
}
