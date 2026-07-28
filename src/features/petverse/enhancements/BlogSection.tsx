import { useState } from 'react';
import styles from './BlogSection.module.css';

interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorColor: string;
  date: string;
  readTime: string;
  imageColor: string;
  imageEmoji: string;
  relatedProducts: { name: string; price: string }[];
}

interface RelatedProduct {
  name: string;
  price: string;
}

const CATEGORIES = ['All', 'Nutrition', 'Health', 'Training', 'Grooming', 'Behavior'];

const POSTS: BlogPost[] = [
  {
    id: 'b1',
    category: 'Nutrition',
    title: 'Complete Guide to Puppy Nutrition',
    excerpt: 'Learn what to feed your growing puppy for optimal health and development.',
    content: '<p>Puppies have unique nutritional needs that differ from adult dogs. Their growing bodies require higher levels of protein, fat, calcium, and phosphorus to support bone development and energy levels.</p><p>It is essential to choose a high-quality puppy food that meets AAFCO standards. Feed your puppy 3-4 times a day until they are 6 months old, then reduce to 2-3 meals. Always provide fresh water and avoid table scraps.</p><p>Consult your veterinarian for a personalized feeding plan tailored to your puppy\'s breed, size, and activity level.</p>',
    authorName: 'Dr. Ananya Sharma',
    authorColor: '#6366f1',
    date: '15 Jul 2026',
    readTime: '5 min read',
    imageColor: '#fef3c7',
    imageEmoji: '🍖',
    relatedProducts: [
      { name: 'Royal Canin Puppy Food', price: '₹1,299' },
      { name: 'Nutri-Pet Puppy Formula', price: '₹899' },
      { name: 'Wellness CORE Puppy', price: '₹1,599' },
    ],
  },
  {
    id: 'b2',
    category: 'Health',
    title: '5 Signs Your Cat Needs a Vet Visit',
    excerpt: 'Watch out for these warning signs that indicate your feline friend needs medical attention.',
    content: '<p>Cats are masters at hiding illness, making it crucial for owners to recognize subtle changes. Here are five signs that warrant a veterinary visit: changes in appetite or thirst, lethargy or hiding, vomiting or diarrhea, coughing or sneezing, and changes in litter box habits.</p><p>Early detection can make a significant difference in treatment outcomes. Keep a log of any behavioral changes and share them with your vet.</p>',
    authorName: 'Priya Patel',
    authorColor: '#ec4899',
    date: '12 Jul 2026',
    readTime: '4 min read',
    imageColor: '#e0f2fe',
    imageEmoji: '🐱',
    relatedProducts: [
      { name: 'Pet Health Monitor', price: '₹2,499' },
      { name: 'Wellness Checkup Kit', price: '₹599' },
    ],
  },
  {
    id: 'b3',
    category: 'Training',
    title: 'Basic Obedience Commands Every Dog Should Know',
    excerpt: 'Start training your dog with these essential commands for a well-behaved companion.',
    content: '<p>Training your dog is one of the most rewarding experiences for both of you. Start with these five basic commands: Sit, Stay, Come, Down, and Leave It.</p><p>Use positive reinforcement techniques — reward good behavior with treats, praise, and play. Keep training sessions short (5-10 minutes) and end on a positive note. Consistency is key to success.</p><p>Remember that every dog learns at their own pace. Patience and regular practice will yield the best results.</p>',
    authorName: 'Rahul Verma',
    authorColor: '#f59e0b',
    date: '8 Jul 2026',
    readTime: '6 min read',
    imageColor: '#dbeafe',
    imageEmoji: '🐕',
    relatedProducts: [
      { name: 'Training Treats Pack', price: '₹299' },
      { name: 'Clicker Training Tool', price: '₹149' },
      { name: 'Training Lead & Harness', price: '₹799' },
    ],
  },
  {
    id: 'b4',
    category: 'Grooming',
    title: 'DIY Grooming Tips for Long-Haired Breeds',
    excerpt: 'Keep your long-haired pet looking their best with these at-home grooming techniques.',
    content: '<p>Long-haired breeds require regular grooming to prevent mats and tangles. Invest in quality tools: a slicker brush, metal comb, and detangling spray. Brush your pet at least 3-4 times per week, paying special attention to areas prone to matting like behind the ears and under the legs.</p><p>Bathe your pet every 4-6 weeks using a moisturizing shampoo. Trim nails monthly and clean ears weekly. Regular grooming not only keeps your pet looking great but also helps you spot skin issues early.</p>',
    authorName: 'Sofia Khan',
    authorColor: '#8b5cf6',
    date: '5 Jul 2026',
    readTime: '5 min read',
    imageColor: '#f3e8ff',
    imageEmoji: '✂️',
    relatedProducts: [
      { name: 'Pro Grooming Kit', price: '₹1,999' },
      { name: 'De-shedding Brush', price: '₹449' },
    ],
  },
  {
    id: 'b5',
    category: 'Behavior',
    title: 'Understanding Your Cat\'s Body Language',
    excerpt: 'Decode what your cat is trying to tell you through their tail, ears, and posture.',
    content: '<p>Cats communicate primarily through body language. A tail held high indicates confidence and happiness, while a tucked tail signals fear. Ears pointed forward show interest, and flattened ears mean aggression or fear.</p><p>Slow blinking is a sign of trust and affection. Purring usually indicates contentment, but can also signal stress. Learn to read these cues to strengthen your bond with your feline companion.</p>',
    authorName: 'Dr. Arjun Mehta',
    authorColor: '#10b981',
    date: '2 Jul 2026',
    readTime: '4 min read',
    imageColor: '#ecfdf5',
    imageEmoji: '🐈',
    relatedProducts: [
      { name: 'Cat Behavior Book', price: '₹399' },
      { name: 'Interactive Cat Toy Set', price: '₹599' },
      { name: 'Cat Calming Diffuser', price: '₹899' },
    ],
  },
  {
    id: 'b6',
    category: 'Nutrition',
    title: 'Raw vs. Kibble: Pros and Cons',
    excerpt: 'Compare raw diets and commercial kibble to decide what is best for your pet.',
    content: '<p>The debate between raw feeding and commercial kibble continues among pet owners and veterinarians. Raw diets offer minimally processed nutrition and can improve coat health, but carry risks of bacterial contamination and nutritional imbalances. High-quality kibble is convenient, balanced, and shelf-stable, but may contain fillers.</p><p>Consult your vet before making any major dietary changes. Some owners opt for a mixed approach, combining high-quality kibble with fresh food toppers.</p>',
    authorName: 'Neha Gupta',
    authorColor: '#ef4444',
    date: '28 Jun 2026',
    readTime: '7 min read',
    imageColor: '#fee2e2',
    imageEmoji: '🥩',
    relatedProducts: [
      { name: 'Premium Kibble Blend', price: '₹1,199' },
      { name: 'Freeze-Dried Raw Topper', price: '₹699' },
    ],
  },
  {
    id: 'b7',
    category: 'Health',
    title: 'Seasonal Allergies in Pets: What to Know',
    excerpt: 'Help your pet find relief from seasonal allergies with these tips and treatments.',
    content: '<p>Just like humans, pets can suffer from seasonal allergies. Common symptoms include excessive scratching, licking paws, red or watery eyes, sneezing, and ear infections. Allergens like pollen, mold, and dust mites are typical triggers.</p><p>Treatment options include antihistamines (always consult your vet first), medicated shampoos, omega-3 supplements, and keeping your home clean. In severe cases, your vet may recommend allergy testing or immunotherapy.</p>',
    authorName: 'Dr. Ananya Sharma',
    authorColor: '#6366f1',
    date: '24 Jun 2026',
    readTime: '5 min read',
    imageColor: '#fce7f3',
    imageEmoji: '🌸',
    relatedProducts: [
      { name: 'Hypoallergenic Shampoo', price: '₹449' },
      { name: 'Omega-3 Supplement', price: '₹599' },
      { name: 'Allergy Relief Chews', price: '₹799' },
    ],
  },
  {
    id: 'b8',
    category: 'Training',
    title: 'House Training Your New Puppy',
    excerpt: 'A step-by-step guide to successfully house train your puppy in record time.',
    content: '<p>House training requires patience, consistency, and a positive attitude. Start by establishing a routine: take your puppy outside first thing in the morning, after meals, after naps, and before bedtime. Choose a designated potty spot and use a consistent command.</p><p>Reward immediately when your puppy eliminates outdoors. Supervise indoors and watch for signs like circling or sniffing. Accidents will happen — clean them thoroughly with an enzymatic cleaner to prevent repeat offenses.</p>',
    authorName: 'Rahul Verma',
    authorColor: '#f59e0b',
    date: '20 Jun 2026',
    readTime: '6 min read',
    imageColor: '#fef9c3',
    imageEmoji: '🐾',
    relatedProducts: [
      { name: 'Puppy Training Pads', price: '₹349' },
      { name: 'Enzymatic Cleaner', price: '₹249' },
      { name: 'Treat Pouch for Training', price: '₹199' },
    ],
  },
];

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState(false);

  const filtered = POSTS.filter(p => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleShare = (type: string, title: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out: ${title}`);
    switch (type) {
      case 'facebook':
        window.open(`https://facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopyToast(true);
          setTimeout(() => setCopyToast(false), 2000);
        });
        break;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>📝 Petverse Blog</h2>

      <div className={styles.controls}>
        <div className={styles.categoryFilters}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ''}`}
              onClick={() => { setActiveCategory(cat); setExpandedId(null); }}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.blogGrid}>
        {filtered.map(post => (
          <div key={post.id}>
            <div className={styles.card} onClick={() => toggleExpand(post.id)}>
              <div className={styles.cardImage} style={{ background: post.imageColor }}>
                <span>{post.imageEmoji}</span>
                <span className={styles.categoryBadge}>{post.category}</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{post.title}</div>
                <div className={styles.cardExcerpt}>{post.excerpt}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.authorAvatar} style={{ background: post.authorColor }}>
                    {getInitials(post.authorName)}
                  </span>
                  <span className={styles.authorName}>{post.authorName}</span>
                  <span className={styles.metaDivider}>·</span>
                  <span>{post.date}</span>
                  <span className={styles.metaDivider}>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            {expandedId === post.id && (
              <div className={styles.detailView}>
                <button className={styles.closeDetailBtn} onClick={() => setExpandedId(null)}>
                  ✕ Close
                </button>

                <div className={styles.detailImage} style={{ background: post.imageColor }}>
                  <span>{post.imageEmoji}</span>
                  <span className={styles.detailCategoryBadge}>{post.category}</span>
                </div>

                <h3 className={styles.detailTitle}>{post.title}</h3>
                <div className={styles.detailMeta}>
                  <span className={styles.authorAvatar} style={{ background: post.authorColor }}>
                    {getInitials(post.authorName)}
                  </span>
                  <span>{post.authorName}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>

                <div
                  className={styles.detailContent}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {(post.relatedProducts as RelatedProduct[]).length > 0 && (
                  <div className={styles.relatedSection}>
                    <div className={styles.relatedTitle}>Related Products</div>
                    <div className={styles.relatedProducts}>
                      {(post.relatedProducts as RelatedProduct[]).map((rp, i) => (
                        <div key={i} className={styles.relatedProduct}>
                          <div>{rp.name}</div>
                          <div className={styles.relatedProductPrice}>{rp.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.shareSection}>
                  <span className={styles.shareLabel}>Share:</span>
                  {['Facebook', 'Twitter', 'WhatsApp', 'Copy Link'].map(s => (
                    <button
                      key={s}
                      className={styles.shareBtn}
                      onClick={() => handleShare(s.toLowerCase().replace(' ', ''), post.title)}
                    >
                      {s === 'Copy Link' ? '🔗' : ''} {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {copyToast && <div className={styles.copyToast}>Link copied to clipboard!</div>}
    </div>
  );
}
