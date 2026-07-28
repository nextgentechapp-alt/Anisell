# Firestore Data Cleanup & Normalization

I have reviewed `products.json` and the Firestore seeding logic in the codebase. As requested, I have corrected the details stored in Firestore by removing redundant and unwanted mock data fields and normalizing the schema to match common Firebase standards.

### 🛠️ What has been corrected?

1.  **Redundant Field Removal**:
    *   Removed `UserId`, `UserName`, and `UserEmail` when syncing from `products.json`. These are now consistently stored as `uid`, `displayName`, and `email` to match Firebase Auth.
    *   Stopped the storage of mock `orders` in the user document. In a production-ready setup, orders should live in their own collection, and mock orders inside a user document were considered "unwanted noise".

2.  **Field Normalization**:
    *   **Phone Number**: Renamed `UserNumber` to `phone`.
    *   **Date of Birth**: Renamed `dateOfBirth` to `dob` (in code) or kept as `dateOfBirth` but ensured consistent mapping.
    *   **Gender**: Normalized to lowercase `gender` or ensured fallback support for `Gender`.

3.  **Clean Seeding on Login**:
    *   Updated `src/pages/Login.tsx` to precisely pick only essential fields (`phone`, `addresses`, `location`, `certification`, `analytics`) from the `products.json` mock data instead of spreading the whole mock object.

4.  **UI Data Mapping**:
    *   Updated `src/pages/Profile.tsx` and `src/pages/Admin.tsx` to handle both the new normalized fields and the legacy mock fields (as fallbacks) to ensure the UI doesn't break for existing accounts.

### 📝 Next Steps for Firestore Quality

If you have already manually uploaded `products.json` to Firestore using the Firebase console, you may still see "unwanted details" like `oldSalesCount` or `newSalesCount` in the `products` collection.

I recommend running a simple cleanup script to delete those specific fields. Below is a suggested utility you can use or integrate into your admin panel:

```typescript
// Proposed cleanup logic for products collection
const cleanupProducts = async () => {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    snapshot.docs.forEach(async (d) => {
        const data = d.data();
        // Remove unwanted mock details
        const { oldSalesCount, newSalesCount, productId, ...cleanData } = data;
        await setDoc(doc(db, 'products', d.id), cleanData);
    });
};
```

I have already applied the structural fixes to your source code.
