import React, { useState, useCallback } from 'react';
import styles from './DeliveryEstimation.module.css';

type DeliveryOption = 'standard' | 'express' | 'sameday';

interface DeliveryResult {
  serviceable: boolean;
  options: {
    type: DeliveryOption;
    label: string;
    days: string;
    cost: number;
  }[];
  estimatedDateRange: string;
  metroCity: boolean;
  storeName: string;
}

const METRO_CODES = ['110', '400', '560', '600', '700', '500', '411', '380'];

const PIN_DATA: Record<string, DeliveryResult> = {
  '110001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Delhi Hub',
    estimatedDateRange: 'Jul 30 – Aug 1',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 149 },
      { type: 'sameday', label: 'Same Day Delivery', days: 'Today', cost: 299 },
    ],
  },
  '400001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Mumbai Store',
    estimatedDateRange: 'Jul 30 – Aug 1',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 149 },
      { type: 'sameday', label: 'Same Day Delivery', days: 'Today', cost: 299 },
    ],
  },
  '560001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Bangalore Center',
    estimatedDateRange: 'Jul 29 – Jul 31',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '4-6 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 129 },
      { type: 'sameday', label: 'Same Day Delivery', days: 'Today', cost: 249 },
    ],
  },
  '600001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Chennai Outlet',
    estimatedDateRange: 'Jul 30 – Aug 2',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 59 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 159 },
      { type: 'sameday', label: 'Same Day Delivery', days: 'Today', cost: 299 },
    ],
  },
  '500001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Hyderabad Hub',
    estimatedDateRange: 'Jul 30 – Aug 1',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 139 },
    ],
  },
  '700001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Kolkata Store',
    estimatedDateRange: 'Jul 31 – Aug 3',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 59 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 169 },
    ],
  },
  '411001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Pune Express',
    estimatedDateRange: 'Jul 30 – Aug 1',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 139 },
    ],
  },
  '380001': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Ahmedabad Point',
    estimatedDateRange: 'Jul 30 – Aug 2',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 149 },
    ],
  },
  '110075': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Delhi Hub',
    estimatedDateRange: 'Jul 30 – Aug 1',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '5-7 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 149 },
      { type: 'sameday', label: 'Same Day Delivery', days: 'Today', cost: 299 },
    ],
  },
  '400053': {
    serviceable: true,
    metroCity: true,
    storeName: 'AniSell Mumbai Store',
    estimatedDateRange: 'Jul 29 – Jul 31',
    options: [
      { type: 'standard', label: 'Standard Delivery', days: '4-6 business days', cost: 49 },
      { type: 'express', label: 'Express Delivery', days: '2-3 business days', cost: 149 },
    ],
  },
};

const OPTION_ICONS: Record<DeliveryOption, string> = {
  standard: '📦',
  express: '⚡',
  sameday: '🚀',
};

const DeliveryEstimation: React.FC = () => {
  const [pinCode, setPinCode] = useState('');
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedPin, setCheckedPin] = useState('');
  const [weight, setWeight] = useState(1);

  const isValidPin = (pin: string) => /^\d{6}$/.test(pin);

  const checkDelivery = useCallback(() => {
    if (!isValidPin(pinCode)) {
      setError('Please enter a valid 6-digit PIN code');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    setTimeout(() => {
      const data = PIN_DATA[pinCode];
      if (data) {
        setResult(data);
        setCheckedPin(pinCode);
      } else {
        setError('Sorry, delivery is not available at this PIN code yet.');
        setCheckedPin(pinCode);
      }
      setLoading(false);
    }, 800);
  }, [pinCode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkDelivery();
  };

  const getCostEstimate = () => {
    const base = weight <= 1 ? 49 : weight <= 5 ? 99 : 149;
    const metro = METRO_CODES.includes(pinCode.substring(0, 3));
    const distFactor = metro ? 1 : 1.5;
    return Math.round(base * distFactor);
  };

  return (
    <div className={styles.container}>
      <div className="pv-section-header">
        <h2 className="pv-section-title">Delivery Estimation</h2>
      </div>

      <div className={styles.inputSection}>
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Enter PIN Code</label>
            <input
              className={styles.pinInput}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 110001"
              value={pinCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPinCode(val);
                setResult(null);
                setError('');
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            className="pv-btn pv-btn-primary"
            onClick={checkDelivery}
            disabled={loading || pinCode.length !== 6}
          >
            {loading ? 'Checking...' : 'Check Availability'}
          </button>
        </div>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Checking delivery availability...</span>
        </div>
      )}

      {result && result.serviceable && (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.serviceableBadge}>✓ Serviceable</span>
            <span className={styles.storeName}>{result.storeName}</span>
          </div>
          {result.metroCity && <span className={styles.metroBadge}>Metro City</span>}
          <p className={styles.estimatedDate}>
            Estimated Delivery: <strong>{result.estimatedDateRange}</strong>
          </p>

          <div className={styles.optionsGrid}>
            {result.options.map((opt) => (
              <div key={opt.type} className={styles.optionCard}>
                <span className={styles.optionIcon}>{OPTION_ICONS[opt.type]}</span>
                <h5 className={styles.optionLabel}>{opt.label}</h5>
                <span className={styles.optionDays}>{opt.days}</span>
                <span className={styles.optionCost}>₹{opt.cost}</span>
              </div>
            ))}
          </div>

          <div className={styles.weightCalc}>
            <h5 className={styles.calcTitle}>Delivery Cost Calculator</h5>
            <div className={styles.calcRow}>
              <label className={styles.calcLabel}>Package Weight (kg)</label>
              <select
                className={styles.calcSelect}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 8, 10].map((w) => (
                  <option key={w} value={w}>{w} kg</option>
                ))}
              </select>
              <span className={styles.calcCost}>Est. ₹{getCostEstimate()}</span>
            </div>
          </div>
        </div>
      )}

      {result && !result.serviceable && (
        <div className={styles.unserviceable}>
          <span className={styles.unserviceableIcon}>🚫</span>
          <h4>Not Serviceable</h4>
          <p>We don't deliver to PIN code <strong>{checkedPin}</strong> yet. Try a nearby metro city PIN.</p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>🚚</span>
          <p>Enter your PIN code to check delivery options and estimated arrival.</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryEstimation;
