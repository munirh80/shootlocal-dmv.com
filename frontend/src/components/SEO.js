import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'DMV Gun Range';
const SITE_URL = process.env.REACT_APP_BACKEND_URL || 'https://dmvgunrange.com';
const DEFAULT_IMAGE = '/og-image.png';

// Default SEO for the site
export const DefaultSEO = () => (
  <Helmet>
    <title>{SITE_NAME} - Find Shooting Ranges in DC, Maryland & Virginia</title>
    <meta name="description" content="Find the best shooting ranges in the DMV area. Browse 78+ gun ranges in Virginia, Maryland, and DC with reviews, photos, hours, and directions." />
    <meta name="keywords" content="shooting range, gun range, DMV, Virginia, Maryland, DC, indoor range, outdoor range, firearms, pistol range, rifle range" />
    
    {/* Open Graph */}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:title" content={`${SITE_NAME} - Find Shooting Ranges in DC, Maryland & Virginia`} />
    <meta property="og:description" content="Find the best shooting ranges in the DMV area. Browse 78+ gun ranges in Virginia, Maryland, and DC." />
    <meta property="og:image" content={`${SITE_URL}${DEFAULT_IMAGE}`} />
    <meta property="og:url" content={SITE_URL} />
    
    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={`${SITE_NAME} - Find Shooting Ranges in DC, Maryland & Virginia`} />
    <meta name="twitter:description" content="Find the best shooting ranges in the DMV area. Browse 78+ gun ranges in Virginia, Maryland, and DC." />
    <meta name="twitter:image" content={`${SITE_URL}${DEFAULT_IMAGE}`} />
    
    {/* Canonical */}
    <link rel="canonical" href={SITE_URL} />
    
    {/* Additional SEO */}
    <meta name="robots" content="index, follow" />
    <meta name="author" content={SITE_NAME} />
    <meta name="geo.region" content="US-VA" />
    <meta name="geo.placename" content="DMV Area" />
    
    {/* Structured Data - Organization */}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": "Directory of shooting ranges in DC, Maryland, and Virginia",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      })}
    </script>
  </Helmet>
);

// SEO for individual range pages
export const RangeSEO = ({ range }) => {
  if (!range) return null;
  
  const title = `${range.name} - Shooting Range in ${range.location?.city}, ${range.location?.state}`;
  const description = range.description 
    ? range.description.substring(0, 160) 
    : `${range.name} is a shooting range located in ${range.location?.city}, ${range.location?.state}. View hours, amenities, reviews, and contact information.`;
  const url = `${SITE_URL}/range/${range.id}`;
  const image = range.photos?.[0] || `${SITE_URL}${DEFAULT_IMAGE}`;
  
  // Build amenities list for structured data
  const amenities = [];
  if (range.amenities?.indoor) amenities.push('Indoor Range');
  if (range.amenities?.outdoor) amenities.push('Outdoor Range');
  if (range.amenities?.handgun) amenities.push('Handgun');
  if (range.amenities?.rifle) amenities.push('Rifle');
  if (range.amenities?.shotgun) amenities.push('Shotgun');
  if (range.amenities?.equipment_rentals) amenities.push('Equipment Rentals');
  if (range.amenities?.instruction) amenities.push('Instruction');
  
  // Build hours for structured data
  const openingHours = [];
  if (range.hours) {
    const dayMap = {
      monday: 'Mo', tuesday: 'Tu', wednesday: 'We', 
      thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su'
    };
    Object.entries(range.hours).forEach(([day, hours]) => {
      if (hours && hours !== 'Closed') {
        openingHours.push(`${dayMap[day]} ${hours}`);
      }
    });
  }
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": range.name,
    "description": description,
    "url": url,
    "telephone": range.phone || undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": range.location?.address,
      "addressLocality": range.location?.city,
      "addressRegion": range.location?.state,
      "postalCode": range.location?.zip_code,
      "addressCountry": "US"
    },
    "geo": range.location?.latitude && range.location?.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": range.location.latitude,
      "longitude": range.location.longitude
    } : undefined,
    "image": image,
    "openingHours": openingHours.length > 0 ? openingHours : undefined,
    "amenityFeature": amenities.map(a => ({ "@type": "LocationFeatureSpecification", "name": a })),
    "aggregateRating": range.user_rating ? {
      "@type": "AggregateRating",
      "ratingValue": range.user_rating,
      "reviewCount": range.user_reviews_count || 1
    } : undefined
  };
  
  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );
  
  return (
    <Helmet>
      <title>{title} | {SITE_NAME}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${range.name}, shooting range, ${range.location?.city}, ${range.location?.state}, gun range, ${amenities.join(', ')}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content="place" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="place:location:latitude" content={range.location?.latitude} />
      <meta property="place:location:longitude" content={range.location?.longitude} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

// SEO for search/filter pages
export const SearchSEO = ({ query, state, count }) => {
  let title = `Shooting Ranges`;
  let description = `Browse ${count} shooting ranges`;
  
  if (state) {
    const stateNames = { VA: 'Virginia', MD: 'Maryland', DC: 'Washington DC' };
    title = `Shooting Ranges in ${stateNames[state] || state}`;
    description = `Find ${count} shooting ranges in ${stateNames[state] || state}. Indoor and outdoor ranges with reviews, photos, and directions.`;
  }
  
  if (query) {
    title = `Shooting Ranges near ${query}`;
    description = `Find shooting ranges near ${query}. ${count} results found in the DMV area.`;
  }
  
  return (
    <Helmet>
      <title>{title} | {SITE_NAME}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
};

export default { DefaultSEO, RangeSEO, SearchSEO };
