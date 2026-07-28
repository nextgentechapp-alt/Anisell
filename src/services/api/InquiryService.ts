import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import type { Inquiry } from '@/types';

/**
 * Platform Inquiry Service Layer.
 * Centralizes all customer-to-merchant communication and admin oversight logic.
 */
export const InquiryService = {
  /**
   * Captures a new marketplace inquiry and queues it for administrative review.
   */
  async saveInquiry(data: Omit<Inquiry, 'id' | 'timestamp' | 'status'>) {
    const inquiryRef = collection(db, 'inquiries');
    const newInquiry: Inquiry = {
      ...data,
      id: `inq_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    await addDoc(inquiryRef, newInquiry);
    return newInquiry;
  }
};
