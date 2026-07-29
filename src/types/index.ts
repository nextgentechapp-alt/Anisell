export interface Review {
  userId: string;
  rating: number;
  comment: string;
  datetime: string;
}

export interface Address {
  name: string;
  phone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'seller' | 'buyer';
  status?: 'active' | 'suspended';
  createdAt?: string;
  lastLogin?: string;
}

export interface Buyer {
  buyerId: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  addresses?: Address[];
  orders?: Order[];
  status?: 'active' | 'onboarding';
}

export interface Product {
  productId: string;
  sellerId: string;
  sellerName?: string;
  sellerLocation?: string;
  productPrice: number;
  productCategory: string;
  productSubCategory: string;
  productType: string;
  productAge: string;
  productGender: string;
  productMedia: string[];
  productReviews?: Review[];
  productVaccinated?: boolean;
  productIsPair?: boolean;
  productDescription?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD';
  newSalesCount?: number;
  rejectionReason?: string;
}

import type { PaymentInfo } from './payment';

export interface Order {
  orderId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  quantity: number;
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  payment?: PaymentInfo;
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export interface Seller {
  sellerId: string;
  shopName: string;
  sellerLocation: string;
  sellerNumber: string;
  productIds: string[];
  sellerCertificateUrl?: string;
  shopPhotoUrls?: string[];
  analytics?: {
    totalSales: number;
    revenue: number;
    storeViews: number;
    conversion: number;
    storeRating: number;
    salesHistory: number[];
  };
  status?: 'onboarding' | 'pending' | 'verified' | 'rejected';
  dateOfBirth?: string;
}

export interface Inquiry {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}
