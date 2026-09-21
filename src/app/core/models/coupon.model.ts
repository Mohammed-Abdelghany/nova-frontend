export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  value: number;
  active: boolean;
  expiryDate: string | null;
  createdAt: string;
}

export interface CouponCreateRequest {
  code: string;
  discountType: DiscountType;
  value: number;
  expiryDate?: string | null;
}

export interface CouponValidationResponse {
  code: string;
  discountAmount: number;
  finalAmount: number;
}
