import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import styles from "./ReviewSystem.module.css";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  images: string[];
}

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6",
];

type SortMode = "newest" | "highest" | "lowest" | "helpful";

const SAMPLE_REVIEWS: Review[] = [
  { id: "rev-001", userId: "u1", userName: "Arjun Mehta", rating: 5, title: "Absolutely love it!", comment: "My dog goes crazy for this food. His coat is shinier and he has so much more energy. Highly recommend to any dog parent out there.", createdAt: "2026-07-20T10:30:00Z", verifiedPurchase: true, helpfulVotes: 24, images: [] },
  { id: "rev-002", userId: "u2", userName: "Priya Sharma", rating: 4, title: "Great quality, slightly expensive", comment: "The product quality is excellent and my pet loves it. Just wish it was a bit more affordable. Still, worth the price for the quality you get.", createdAt: "2026-07-18T14:15:00Z", verifiedPurchase: true, helpfulVotes: 15, images: [] },
  { id: "rev-003", userId: "u3", userName: "Rahul Verma", rating: 3, title: "Decent but not the best", comment: "It's okay for the price. My cat eats it but not as enthusiastically as the previous brand I used. Might switch back after this bag.", createdAt: "2026-07-15T09:45:00Z", verifiedPurchase: true, helpfulVotes: 8, images: [] },
  { id: "rev-004", userId: "u4", userName: "Sneha Patel", rating: 5, title: "Perfect for my senior dog", comment: "I was looking for something gentle on my older dog's stomach and this is perfect. No more tummy troubles and she loves the taste!", createdAt: "2026-07-12T16:20:00Z", verifiedPurchase: true, helpfulVotes: 31, images: [] },
  { id: "rev-005", userId: "u5", userName: "Vikram Singh", rating: 2, title: "Not what I expected", comment: "The product arrived damaged and the packaging was poor. The food itself seems okay but I expected better quality control for the price.", createdAt: "2026-07-08T11:00:00Z", verifiedPurchase: false, helpfulVotes: 5, images: [] },
  { id: "rev-006", userId: "u6", userName: "Ananya Gupta", rating: 4, title: "Good product, fast delivery", comment: "Ordered this on a Monday and it arrived Wednesday. The food looks fresh and my rabbit loves the hay pellets. Will order again for sure.", createdAt: "2026-07-05T08:30:00Z", verifiedPurchase: true, helpfulVotes: 12, images: [] },
];

function loadReviews(productId: string): Review[] {
  try {
    const raw = localStorage.getItem(`pv_reviews_${productId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function saveReviews(productId: string, reviews: Review[]) {
  localStorage.setItem(`pv_reviews_${productId}`, JSON.stringify(reviews));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function renderStars(rating: number, className: string, filledClass: string, emptyClass: string) {
  return (
    <span className={className}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? filledClass : emptyClass}
        >
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

export default function ReviewSystem() {
  const { productId = "default" } = useParams<{ productId: string }>();
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = loadReviews(productId);
    return stored.length > 0 ? stored : SAMPLE_REVIEWS;
  });

  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [filterStars, setFilterStars] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [helpfulVoted, setHelpfulVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    saveReviews(productId, reviews);
  }, [productId, reviews]);

  const totalReviews = reviews.length;
  const averageRating = useMemo(
    () =>
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0,
    [reviews, totalReviews]
  );

  const starDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
      }
    });
    return dist;
  }, [reviews]);

  const toggleFilterStar = useCallback((star: number) => {
    setFilterStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  }, []);

  const filteredReviews = useMemo(() => {
    let result =
      filterStars.length > 0
        ? reviews.filter((r) => filterStars.includes(r.rating))
        : [...reviews];

    switch (sortMode) {
      case "newest":
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        result.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
        break;
    }
    return result;
  }, [reviews, filterStars, sortMode]);

  const handleHelpful = useCallback(
    (reviewId: string) => {
      if (helpfulVoted.has(reviewId)) return;
      setHelpfulVoted((prev) => new Set(prev).add(reviewId));
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r
        )
      );
    },
    [helpfulVoted]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formRating === 0 || !formTitle.trim() || !formBody.trim()) return;

      const newReview: Review = {
        id: `rev-${Date.now()}`,
        userId: "current-user",
        userName: "You",
        rating: formRating,
        title: formTitle.trim(),
        comment: formBody.trim(),
        createdAt: new Date().toISOString(),
        verifiedPurchase: false,
        helpfulVotes: 0,
        images: [],
      };

      setReviews((prev) => [newReview, ...prev]);
      setFormRating(0);
      setFormHoverRating(0);
      setFormTitle("");
      setFormBody("");
      setShowForm(false);
    },
    [formRating, formTitle, formBody, productId]
  );

  const canSubmit = formRating > 0 && formTitle.trim().length > 0 && formBody.trim().length > 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Customer Reviews</h2>

      {/* Summary Card */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryRating}>
          <span className={styles.averageRating}>{averageRating.toFixed(1)}</span>
          {renderStars(
            Math.round(averageRating),
            styles.starsRow,
            styles.starIcon + " " + styles.starFilled,
            styles.starIcon + " " + styles.starEmpty
          )}
          <span className={styles.totalReviews}>
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.breakdown}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starDistribution[star - 1];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div
                key={star}
                className={styles.breakdownRow}
                onClick={() => toggleFilterStar(star)}
                style={{ cursor: "pointer" }}
              >
                <span
                  className={`${styles.breakdownLabel} ${
                    filterStars.includes(star) ? styles.breakdownLabelActive : ""
                  }`}
                >
                  {star}
                </span>
                <div className={styles.breakdownBarTrack}>
                  <div
                    className={styles.breakdownBarFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={styles.breakdownCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`${styles.filterStarBtn} ${
                filterStars.includes(star) ? styles.filterStarBtnActive : ""
              }`}
              onClick={() => toggleFilterStar(star)}
            >
              {star} {"\u2605"}
            </button>
          ))}
        </div>
        <select
          className={styles.sortSelect}
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Write Review Form */}
      {!showForm && (
        <button
          className={styles.writeReviewToggle}
          onClick={() => setShowForm(true)}
        >
          + Write a Review
        </button>
      )}

      {showForm && (
        <form className={styles.reviewForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Rating</label>
            <div className={styles.starSelector}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (formHoverRating || formRating);
                return (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starSelectBtn} ${
                      active ? styles.starSelectBtnSelected : ""
                    } ${star <= formHoverRating ? styles.starSelectBtnHovered : ""}`}
                    onClick={() => setFormRating(star)}
                    onMouseEnter={() => setFormHoverRating(star)}
                    onMouseLeave={() => setFormHoverRating(0)}
                  >
                    {"\u2605"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="rev-title">
              Title
            </label>
            <input
              id="rev-title"
              className={styles.formInput}
              type="text"
              placeholder="Summary of your review"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="rev-body">
              Review
            </label>
            <textarea
              id="rev-body"
              className={styles.formTextarea}
              placeholder="Share your experience with this product..."
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Images</label>
            <div className={styles.imageUpload}>
              Click to upload images (coming soon)
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setShowForm(false);
                setFormRating(0);
                setFormHoverRating(0);
                setFormTitle("");
                setFormBody("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.submitBtn} ${
                !canSubmit ? styles.submitBtnDisabled : ""
              }`}
              disabled={!canSubmit}
            >
              Submit Review
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>&#128221;</div>
          <p className={styles.emptyText}>No reviews yet</p>
          <p className={styles.emptyHint}>
            Be the first to share your thoughts on this product
          </p>
        </div>
      ) : (
        <div className={styles.reviewList}>
          {filteredReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div
                  className={styles.avatar}
                  style={{ background: getAvatarColor(review.userName) }}
                >
                  {getInitial(review.userName)}
                </div>
                <div>
                  <div className={styles.avatarName}>{review.userName}</div>
                  <div className={styles.avatarDate}>
                    {formatDate(review.createdAt)}
                  </div>
                  {review.verifiedPurchase && (
                    <div className={styles.verifiedBadge}>
                      {"\u2705"} Verified Purchase
                    </div>
                  )}
                </div>
              </div>

              {renderStars(
                review.rating,
                styles.reviewStars,
                styles.starIcon + " " + styles.starFilled,
                styles.starIcon + " " + styles.starEmpty
              )}

              <h4 className={styles.reviewTitle}>{review.title}</h4>
              <p className={styles.reviewBody}>{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className={styles.reviewImages}>
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Review"
                      className={styles.reviewImage}
                    />
                  ))}
                </div>
              )}

              <div className={styles.helpfulRow}>
                <button
                  className={`${styles.helpfulBtn} ${
                    helpfulVoted.has(review.id) ? styles.helpfulBtnActive : ""
                  }`}
                  onClick={() => handleHelpful(review.id)}
                >
                  {"\U0001F44D"} Helpful
                </button>
                <span className={styles.helpfulCount}>
                  {review.helpfulVotes} {review.helpfulVotes === 1 ? "person" : "people"} found this helpful
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
