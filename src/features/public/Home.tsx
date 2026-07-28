import React from 'react';
import { useSearchData } from '@/hooks/useSearchData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ListingGrid } from '@/features/public/ListingGrid';
import BreedBrowser from "@/components/home/BreedBrowser"; // Will refactor to features/public next
import TopSellingPets from "@/components/home/SellerGrid"; // Will refactor to features/public next
import TrustFeatures from "@/components/home/TrustFeatures";
import { useSEO } from '@/hooks/useSEO';
import { MarketplaceSwitcher } from "@/features/petverse/components/MarketplaceSwitcher";
import "@/App.css";

/**
 * Home Page.
 * Orchestrates the primary pet marketplace experience with breed browsing,
 * featured listings, and trust-building components.
 * Refactored to eliminate duplicate listing JSX by leveraging the Public ListingGrid feature.
 */
const Home: React.FC = () => {
  const { approvedProducts, loading } = useSearchData();

  useSEO({
    title: "Buy & Sell Verified Pets Online in India",
    description: "Anisell is India's leading verified pet marketplace. Connect directly with KCI-registered breeders, buy healthy puppies, kittens, birds, and fish securely.",
    keywords: "buy pets online india, pet marketplace india, sell pets online, verified dog breeders, buy puppies bangalore, cats for sale chennai, pet shop mumbai, anisell",
    canonical: "https://anisell.in/"
  });

  if (loading) return (
     <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', maxWidth: '1440px', margin: '0 auto' }}>
           {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
     </div>
  );

  return (
    <div className="home-content">
      {/* PetVerse Store switcher — additive only, does not alter existing sections below */}
      <MarketplaceSwitcher />

      {/* 1. Specialized Browsing Experiences */}
      <BreedBrowser products={approvedProducts} />

      {/* 2. Core Listing Discovery - Unified Grid Feature */}
      <ListingGrid
        products={approvedProducts as any}
        title="Trending Pet Listings"
        subtitle="Explore the latest additions to the AniSell community."
        columns={4}
      />

      {/* 3. Social Proof and Verified Merchants */}
      <TopSellingPets products={approvedProducts} />

      {/* 4. Strategic Platform Differentiators */}
      <TrustFeatures />
    </div>
  );
};

export default Home;
