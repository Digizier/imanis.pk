/**
 * Organic Product Review & Rating Helper
 * Generates natural, deterministic ratings (4.6 - 4.9) and review counts (18 - 48)
 * per product based on its unique slug or id, ensuring complete consistency
 * across Homepage, Category, Shop, and Product Detail pages.
 */
export interface ProductReviewData {
  rating: number;
  reviewCount: number;
}

export function getProductReviewData(product?: {
  id?: string;
  slug?: string;
  name?: string;
  rating?: number;
  reviews_count?: number;
} | null): ProductReviewData {
  if (!product) {
    return { rating: 4.8, reviewCount: 32 };
  }

  // If custom review data is explicitly provided, respect it
  if (product.rating && product.reviews_count) {
    return {
      rating: product.rating,
      reviewCount: product.reviews_count,
    };
  }

  // Deterministic seed based on product slug or id
  const seed = product.slug || product.id || product.name || 'product';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Organic rating distribution between 4.6 and 4.9 (4.8 most common)
  const ratingVariations = [4.7, 4.8, 4.9, 4.8, 4.6, 4.8, 4.7, 4.9, 4.8, 4.7, 4.9, 4.8];
  const rating = product.rating || ratingVariations[absHash % ratingVariations.length];

  // Review count in range 18 to 48 (e.g. 19, 23, 27, 31, 36, 41, 44, 48)
  const range = 48 - 18 + 1; // 31 possible values
  const reviewCount = product.reviews_count || (18 + ((absHash >> 2) % range));

  return { rating, reviewCount };
}
