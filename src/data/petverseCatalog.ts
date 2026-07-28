import type { PetCategory, PetProduct, PetVerseCategorySlug, PetBrand } from '@/types/petverse';

/**
 * PETVERSE_CATEGORIES
 * The 17 categories required by the PetVerse Store spec.
 */
export const PETVERSE_CATEGORIES: PetCategory[] = [
  { id: 'cat-dogs', slug: 'dogs', name: 'Dogs', icon: '🐶', heroImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800' },
  { id: 'cat-cats', slug: 'cats', name: 'Cats', icon: '🐱', heroImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800' },
  { id: 'cat-birds', slug: 'birds', name: 'Birds', icon: '🦜', heroImage: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800' },
  { id: 'cat-fish', slug: 'fish', name: 'Fish', icon: '🐠', heroImage: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800' },
  { id: 'cat-rabbit', slug: 'rabbit', name: 'Rabbit', icon: '🐰', heroImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800' },
  { id: 'cat-horse', slug: 'horse', name: 'Horse', icon: '🐴', heroImage: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800' },
  { id: 'cat-cow', slug: 'cow', name: 'Cow', icon: '🐄', heroImage: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800' },
  { id: 'cat-accessories', slug: 'accessories', name: 'Accessories', icon: '🎀', heroImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800' },
  { id: 'cat-food', slug: 'food', name: 'Food', icon: '🍖', heroImage: 'https://images.unsplash.com/photo-1585846888147-303d39253234?w=800' },
  { id: 'cat-medicine', slug: 'medicine', name: 'Medicine', icon: '💊', heroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
  { id: 'cat-supplements', slug: 'supplements', name: 'Supplements', icon: '🧪', heroImage: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800' },
  { id: 'cat-toys', slug: 'toys', name: 'Toys', icon: '🧸', heroImage: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=800' },
  { id: 'cat-beds', slug: 'beds', name: 'Beds', icon: '🛏️', heroImage: 'https://images.unsplash.com/photo-1601758125946-6ac8dc8e19cb?w=800' },
  { id: 'cat-clothes', slug: 'clothes', name: 'Clothes', icon: '🧥', heroImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800' },
  { id: 'cat-training', slug: 'training', name: 'Training', icon: '🎯', heroImage: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800' },
  { id: 'cat-cleaning', slug: 'cleaning', name: 'Cleaning', icon: '🧴', heroImage: 'https://images.unsplash.com/photo-1585421514284-efb74320e6c9?w=800' },
  { id: 'cat-healthcare', slug: 'healthcare', name: 'Healthcare', icon: '🩺', heroImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800' },
];

export const PETVERSE_BRANDS: PetBrand[] = [
  { id: 'brand-royal-canin', name: 'Royal Canin', logo: '🏷️' },
  { id: 'brand-pedigree', name: 'Pedigree', logo: '🏷️' },
  { id: 'brand-himalaya', name: 'Himalaya', logo: '🏷️' },
  { id: 'brand-drools', name: 'Drools', logo: '🏷️' },
  { id: 'brand-whiskas', name: 'Whiskas', logo: '🏷️' },
  { id: 'brand-petzlifeworld', name: 'PetzLifeWorld', logo: '🏷️' },
  { id: 'brand-heads-up-for-tails', name: 'Heads Up For Tails', logo: '🏷️' },
  { id: 'brand-mars-petcare', name: 'Mars Petcare', logo: '🏷️' },
];

interface ProductTemplate {
  name: string;
  brandIndex: number;
  price: number;
  animalType: string;
}

const TEMPLATES: Record<PetVerseCategorySlug, ProductTemplate[]> = {
  dogs: [
    { name: 'Adjustable Nylon Dog Collar', brandIndex: 6, price: 349, animalType: 'Dog' },
    { name: 'Retractable Dog Leash 5m', brandIndex: 6, price: 599, animalType: 'Dog' },
    { name: 'Anti-Bark Ultrasonic Trainer', brandIndex: 6, price: 899, animalType: 'Dog' },
  ],
  cats: [
    { name: 'Scratch-Resistant Cat Tree Tower', brandIndex: 6, price: 2499, animalType: 'Cat' },
    { name: 'Self-Cleaning Litter Box', brandIndex: 6, price: 1799, animalType: 'Cat' },
    { name: 'Interactive Laser Cat Toy', brandIndex: 6, price: 649, animalType: 'Cat' },
  ],
  birds: [
    { name: 'Powder-Coated Bird Cage Large', brandIndex: 6, price: 2199, animalType: 'Bird' },
    { name: 'Wooden Bird Perch Stand', brandIndex: 6, price: 399, animalType: 'Bird' },
    { name: 'Bird Feeding Cup Set (4pc)', brandIndex: 6, price: 249, animalType: 'Bird' },
  ],
  fish: [
    { name: 'Aquarium LED Light Bar', brandIndex: 6, price: 799, animalType: 'Fish' },
    { name: 'Submersible Aquarium Filter Pump', brandIndex: 6, price: 1099, animalType: 'Fish' },
    { name: 'Fish Tank Gravel Substrate 2kg', brandIndex: 6, price: 349, animalType: 'Fish' },
  ],
  rabbit: [
    { name: 'Wooden Rabbit Hutch Indoor', brandIndex: 6, price: 3299, animalType: 'Rabbit' },
    { name: 'Rabbit Water Bottle Dispenser', brandIndex: 6, price: 229, animalType: 'Rabbit' },
    { name: 'Timothy Hay Bedding 1kg', brandIndex: 6, price: 299, animalType: 'Rabbit' },
  ],
  horse: [
    { name: 'Leather Horse Riding Halter', brandIndex: 6, price: 2899, animalType: 'Horse' },
    { name: 'Horse Grooming Brush Kit', brandIndex: 6, price: 1299, animalType: 'Horse' },
    { name: 'Waterproof Horse Rug Blanket', brandIndex: 6, price: 4499, animalType: 'Horse' },
  ],
  cow: [
    { name: 'Cattle Feed Supplement Block 5kg', brandIndex: 2, price: 899, animalType: 'Cow' },
    { name: 'Cow Milking Machine Attachment', brandIndex: 2, price: 8999, animalType: 'Cow' },
    { name: 'Livestock Ear Tag Set (50pc)', brandIndex: 2, price: 599, animalType: 'Cow' },
  ],
  accessories: [
    { name: 'Premium Pet Carrier Backpack', brandIndex: 6, price: 1899, animalType: 'All' },
    { name: 'Stainless Steel Feeding Bowl Set', brandIndex: 6, price: 499, animalType: 'All' },
    { name: 'Reflective Pet ID Tag', brandIndex: 6, price: 149, animalType: 'All' },
  ],
  food: [
    { name: 'Adult Dog Dry Food 3kg', brandIndex: 0, price: 1499, animalType: 'Dog' },
    { name: 'Kitten Wet Food Pouches (12pk)', brandIndex: 4, price: 899, animalType: 'Cat' },
    { name: 'Puppy Starter Food 1.5kg', brandIndex: 1, price: 649, animalType: 'Dog' },
  ],
  medicine: [
    { name: 'Broad Spectrum Deworming Tablets', brandIndex: 2, price: 249, animalType: 'All' },
    { name: 'Tick & Flea Spot-On Treatment', brandIndex: 2, price: 399, animalType: 'Dog' },
    { name: 'Antiseptic Wound Healing Spray', brandIndex: 2, price: 299, animalType: 'All' },
  ],
  supplements: [
    { name: 'Omega-3 Skin & Coat Chews', brandIndex: 5, price: 799, animalType: 'Dog' },
    { name: 'Joint Care Glucosamine Tablets', brandIndex: 5, price: 899, animalType: 'Dog' },
    { name: 'Multivitamin Syrup for Cats', brandIndex: 5, price: 499, animalType: 'Cat' },
  ],
  toys: [
    { name: 'Squeaky Plush Bone Toy', brandIndex: 6, price: 299, animalType: 'Dog' },
    { name: 'Feather Wand Cat Teaser', brandIndex: 6, price: 199, animalType: 'Cat' },
    { name: 'Durable Rubber Chew Ring', brandIndex: 6, price: 349, animalType: 'Dog' },
  ],
  beds: [
    { name: 'Orthopedic Memory Foam Pet Bed', brandIndex: 6, price: 2299, animalType: 'All' },
    { name: 'Round Plush Cat Bed', brandIndex: 6, price: 999, animalType: 'Cat' },
    { name: 'Water-Resistant Outdoor Dog Bed', brandIndex: 6, price: 1699, animalType: 'Dog' },
  ],
  clothes: [
    { name: 'Winter Fleece Dog Jacket', brandIndex: 6, price: 799, animalType: 'Dog' },
    { name: 'Cotton Cat Bandana Set (3pc)', brandIndex: 6, price: 349, animalType: 'Cat' },
    { name: 'Rain Poncho for Small Dogs', brandIndex: 6, price: 599, animalType: 'Dog' },
  ],
  training: [
    { name: 'Clicker Training Kit', brandIndex: 6, price: 249, animalType: 'Dog' },
    { name: 'Puppy Training Pads (50pc)', brandIndex: 6, price: 699, animalType: 'Dog' },
    { name: 'Long Line Training Leash 10m', brandIndex: 6, price: 549, animalType: 'Dog' },
  ],
  cleaning: [
    { name: 'Enzyme Stain & Odor Remover', brandIndex: 6, price: 449, animalType: 'All' },
    { name: 'Waterless Pet Shampoo Foam', brandIndex: 6, price: 349, animalType: 'All' },
    { name: 'Deshedding Grooming Brush', brandIndex: 6, price: 599, animalType: 'All' },
  ],
  healthcare: [
    { name: 'Digital Pet Thermometer', brandIndex: 2, price: 699, animalType: 'All' },
    { name: 'First Aid Kit for Pets', brandIndex: 2, price: 899, animalType: 'All' },
    { name: 'Nail Clipper with Safety Guard', brandIndex: 2, price: 299, animalType: 'All' },
  ],
};

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600',
  'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=600',
  'https://images.unsplash.com/photo-1601758064952-11f9f6c2f9a3?w=600',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildProducts(): PetProduct[] {
  const products: PetProduct[] = [];
  let counter = 1;

  (Object.keys(TEMPLATES) as PetVerseCategorySlug[]).forEach((slug) => {
    TEMPLATES[slug].forEach((tpl, idx) => {
      const id = `pv-${slug}-${idx + 1}`;
      const mrp = Math.round(tpl.price * 1.25);
      const discountPercent = Math.round(((mrp - tpl.price) / mrp) * 100);
      const rating = Number((3.8 + ((counter * 7) % 12) / 10).toFixed(1));
      const stock = 5 + ((counter * 13) % 60);

      products.push({
        id,
        title: tpl.name,
        slug: slugify(`${tpl.name}-${id}`),
        categorySlug: slug,
        brand: PETVERSE_BRANDS[tpl.brandIndex].name,
        price: tpl.price,
        mrp,
        discountPercent,
        rating: Math.min(rating, 5),
        ratingCount: 20 + ((counter * 37) % 480),
        stock,
        images: [IMAGE_POOL[counter % IMAGE_POOL.length], IMAGE_POOL[(counter + 1) % IMAGE_POOL.length], IMAGE_POOL[(counter + 2) % IMAGE_POOL.length]],
        description: `${tpl.name} — a premium, vet-approved choice for your ${tpl.animalType === 'All' ? 'pets' : tpl.animalType.toLowerCase()}. Designed for everyday reliability, durability, and comfort, backed by thousands of happy pet parents across India.`,
        specifications: [
          { label: 'Brand', value: PETVERSE_BRANDS[tpl.brandIndex].name },
          { label: 'Category', value: slug.charAt(0).toUpperCase() + slug.slice(1) },
          { label: 'Suitable For', value: tpl.animalType },
          { label: 'Country of Origin', value: 'India' },
        ],
        variants: [
          { id: `${id}-std`, label: 'Standard', priceDelta: 0, stock: Math.ceil(stock / 2) },
          { id: `${id}-lg`, label: 'Large / Pack of 2', priceDelta: Math.round(tpl.price * 0.4), stock: Math.floor(stock / 2) },
        ],
        deliveryEtaDays: 2 + (counter % 4),
        tags: [slug, tpl.animalType.toLowerCase()],
        isFeatured: counter % 5 === 0,
        isBestSeller: counter % 4 === 0,
        isNewArrival: counter % 6 === 0,
        isFlashSale: counter % 7 === 0,
        animalType: tpl.animalType,
        ageGroup: 'all-ages',
        sellerId: 'petverse-official',
        sellerName: 'AniSell Official Store',
        createdAt: new Date(Date.now() - counter * 86400000).toISOString(),
      });
      counter += 1;
    });
  });

  return products;
}

export const PETVERSE_PRODUCTS: PetProduct[] = buildProducts();

export const PETVERSE_COUPONS = [
  { code: 'PET50', description: 'Flat ₹50 off on orders above ₹499', discountType: 'flat' as const, discountValue: 50, minOrderValue: 499, expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), active: true },
  { code: 'PETVERSE10', description: '10% off up to ₹200 on your first order', discountType: 'percent' as const, discountValue: 10, minOrderValue: 799, maxDiscount: 200, expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), active: true },
];
