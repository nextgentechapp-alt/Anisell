import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { PetProduct } from "@/types/petverse";
import { PETVERSE_PRODUCTS } from "@/data/petverseCatalog";
import styles from "./ProductComparison.module.css";

const STORAGE_KEY = "pv_comparison";
const MAX_PRODUCTS = 4;

function loadComparison(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function saveComparison(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function toCurrency(n: number): string {
  return "\u20B9" + n.toLocaleString("en-IN");
}

const ROWS: {
  label: string;
  render: (p: PetProduct) => React.ReactNode;
  compare: (a: PetProduct, b: PetProduct) => boolean;
}[] = [
  {
    label: "Price",
    render: (p) => (
      <span className={styles.price}>
        {toCurrency(p.price)}
        {p.mrp > p.price && <span className={styles.mrp}>{toCurrency(p.mrp)}</span>}
        {p.discountPercent > 0 && (
          <span className={styles.discount}>-{p.discountPercent}%</span>
        )}
      </span>
    ),
    compare: (a, b) => a.price === b.price && a.mrp === b.mrp,
  },
  {
    label: "Rating",
    render: (p) => (
      <span>
        <span className={styles.rating}>
          {"\u2605"} {p.rating.toFixed(1)}
        </span>
        <span className={styles.ratingCount}> ({p.ratingCount})</span>
      </span>
    ),
    compare: (a, b) => a.rating === b.rating,
  },
  {
    label: "Stock",
    render: (p) => (
      <span className={p.stock > 0 ? styles.stockInStock : styles.stockOutOfStock}>
        {p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}
      </span>
    ),
    compare: (a, b) => (a.stock > 0) === (b.stock > 0),
  },
  {
    label: "Brand",
    render: (p) => p.brand,
    compare: (a, b) => a.brand === b.brand,
  },
  {
    label: "Category",
    render: (p) => p.categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    compare: (a, b) => a.categorySlug === b.categorySlug,
  },
  {
    label: "Animal Type",
    render: (p) => p.animalType.charAt(0).toUpperCase() + p.animalType.slice(1),
    compare: (a, b) => a.animalType === b.animalType,
  },
  {
    label: "Delivery",
    render: (p) => `${p.deliveryEtaDays} day${p.deliveryEtaDays > 1 ? "s" : ""}`,
    compare: (a, b) => a.deliveryEtaDays === b.deliveryEtaDays,
  },
  {
    label: "Specifications",
    render: (p) =>
      p.specifications.length > 0 ? (
        <ul className={styles.specList}>
          {p.specifications.map((s, i) => (
            <li key={i} className={styles.specItem}>
              <span className={styles.specLabel}>{s.label}:</span>
              {s.value}
            </li>
          ))}
        </ul>
      ) : (
        "-"
      ),
    compare: (a, b) => JSON.stringify(a.specifications) === JSON.stringify(b.specifications),
  },
];

export default function ProductComparison() {
  const [productIds, setProductIds] = useState<string[]>(loadComparison);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveComparison(productIds);
  }, [productIds]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const products = useMemo(
    () => PETVERSE_PRODUCTS.filter((p) => productIds.includes(p.id)),
    [productIds]
  );

  const availableProducts = useMemo(
    () => PETVERSE_PRODUCTS.filter((p) => !productIds.includes(p.id)),
    [productIds]
  );

  const handleAdd = useCallback(
    (id: string) => {
      if (productIds.length >= MAX_PRODUCTS) return;
      setProductIds((prev) => [...prev, id]);
      setIsDropdownOpen(false);
    },
    [productIds.length]
  );

  const handleRemove = useCallback((id: string) => {
    setProductIds((prev) => prev.filter((pid) => pid !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setProductIds([]);
  }, []);

  const isMaxed = productIds.length >= MAX_PRODUCTS;

  if (products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Compare Products</h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>&#128196;</div>
          <p className={styles.emptyText}>Select products to compare</p>
          <p className={styles.emptyHint}>
            Add up to {MAX_PRODUCTS} products to see a side-by-side comparison
          </p>
          <button
            className={styles.addBtn}
            onClick={() => setIsDropdownOpen(true)}
            style={{ marginTop: 16 }}
          >
            + Add Product
          </button>
          {isDropdownOpen && (
            <div ref={dropdownRef} className={styles.dropdownWrapper}>
              <div className={styles.dropdown}>
                {availableProducts.map((p) => (
                  <button
                    key={p.id}
                    className={styles.dropdownItem}
                    onClick={() => handleAdd(p.id)}
                  >
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className={styles.dropdownThumb}
                      />
                    ) : (
                      <div className={styles.dropdownThumbPlaceholder} />
                    )}
                    <span>{p.title}</span>
                  </button>
                ))}
                {availableProducts.length === 0 && (
                  <div style={{ padding: "12px 14px", color: "var(--color-text-muted)", fontSize: "0.813rem" }}>
                    No more products available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Compare Products</h1>
        <div className={styles.actions}>
          {isMaxed && (
            <span className={styles.maxWarning}>Max {MAX_PRODUCTS} products</span>
          )}
          <div ref={dropdownRef} className={styles.dropdownWrapper}>
            <button
              className={`${styles.addBtn} ${isMaxed ? styles.addBtnDisabled : ""}`}
              disabled={isMaxed}
              onClick={() => setIsDropdownOpen((o) => !o)}
            >
              + Add Product
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                {availableProducts.map((p) => (
                  <button
                    key={p.id}
                    className={styles.dropdownItem}
                    onClick={() => handleAdd(p.id)}
                  >
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className={styles.dropdownThumb}
                      />
                    ) : (
                      <div className={styles.dropdownThumbPlaceholder} />
                    )}
                    <span>{p.title}</span>
                  </button>
                ))}
                {availableProducts.length === 0 && (
                  <div style={{ padding: "12px 14px", color: "var(--color-text-muted)", fontSize: "0.813rem" }}>
                    No more products available
                  </div>
                )}
              </div>
            )}
          </div>
          <button className={styles.clearBtn} onClick={handleClearAll}>
            Clear All
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}></th>
              {products.map((p) => (
                <th key={p.id} className={styles.tableHeaderCell}>
                  <div className={styles.tableHeaderInner}>
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className={styles.productImage}
                      />
                    ) : (
                      <div
                        className={styles.productImage}
                        style={{ background: "var(--color-bg)" }}
                      />
                    )}
                    <span className={styles.productTitle}>{p.title}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const allSame =
                products.length < 2 ||
                products.every((p) => row.compare(p, products[0]));
              return (
                <tr key={row.label} className={styles.tableRow}>
                  <td className={styles.tableLabel}>{row.label}</td>
                  {products.map((p) => (
                    <td
                      key={p.id}
                      className={`${styles.tableCell} ${
                        !allSame ? styles.tableCellHighlight : ""
                      }`}
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
