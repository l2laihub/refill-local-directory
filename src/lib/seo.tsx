import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * SEO component for managing document head metadata
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Find refill and zero-waste stores near you. Discover places to shop plastic-free and live more sustainably.',
  canonicalUrl,
  ogType = 'website',
  ogImage = '/images/og-image.jpg',
  city,
  state,
  country,
}) => {
  // Create a page title with site name
  const pageTitle = city 
    ? `${title} in ${city}, ${state} | RefillLocal` 
    : `${title} | RefillLocal`;

  // Create structured location data if city is provided
  const structuredData = city ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RefillLocal',
    url: 'https://refilllocal.com',
    description: description,
    location: {
      '@type': 'Place',
      name: city,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city,
        addressRegion: state,
        addressCountry: country,
      },
    },
  } : {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RefillLocal',
    url: 'https://refilllocal.com',
    description: description,
  };

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Structured data for search engines */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
