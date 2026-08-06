export interface DeliverySettings {
  fee: number;
  freeThreshold: number;
}

const IS_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  fee: 49,
  freeThreshold: 999,
};

const SETTINGS_COLLECTION = 'platform_settings';
const DELIVERY_DOC = 'delivery';

let firestoreDb: typeof import('firebase/firestore') | null = null;
let dbInstance: ReturnType<typeof import('firebase/firestore').getFirestore> | null = null;

async function getFirestore() {
  if (IS_MOCK) return null;
  if (dbInstance) return dbInstance;
  try {
    const mod = await import('firebase/firestore');
    firestoreDb = mod;
    const config = await import('@/services/firebase/config');
    dbInstance = config.db;
    return dbInstance;
  } catch {
    return null;
  }
}

/**
 * PlatformSettingsService
 * Persists platform-wide configuration (e.g. delivery charges) to Firestore.
 * Falls back to sensible defaults when Firestore is unavailable or in mock mode.
 */
export const PlatformSettingsService = {
  async getDeliverySettings(): Promise<DeliverySettings> {
    const db = await getFirestore();
    if (!db || !firestoreDb) return DEFAULT_DELIVERY_SETTINGS;
    try {
      const { doc, getDoc } = firestoreDb;
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, DELIVERY_DOC));
      if (!snap.exists()) return DEFAULT_DELIVERY_SETTINGS;
      const data = snap.data() as Partial<DeliverySettings>;
      return {
        fee: typeof data.fee === 'number' ? data.fee : DEFAULT_DELIVERY_SETTINGS.fee,
        freeThreshold: typeof data.freeThreshold === 'number' ? data.freeThreshold : DEFAULT_DELIVERY_SETTINGS.freeThreshold,
      };
    } catch {
      return DEFAULT_DELIVERY_SETTINGS;
    }
  },

  async updateDeliverySettings(settings: DeliverySettings): Promise<void> {
    const db = await getFirestore();
    if (!db || !firestoreDb) throw new Error('Firestore not available in mock mode');
    const { doc, setDoc } = firestoreDb;
    await setDoc(doc(db, SETTINGS_COLLECTION, DELIVERY_DOC), settings);
  },
};
