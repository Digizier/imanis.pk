import { supabase } from '@/lib/supabase/client';
import { CouponItem } from '@/app/admin/coupons/page';

export interface CouponValidationResult {
  success: boolean;
  code?: string;
  discountAmount?: number;
  message: string;
}

export async function validateCouponCode(code: string, subtotal: number): Promise<CouponValidationResult> {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { success: false, message: 'Please enter a coupon code.' };
  }

  // Fetch active coupon from Supabase DB
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    return { success: false, message: 'Invalid coupon code. Please check and try again.' };
  }

  const coupon = data as CouponItem;

  // Check Minimum Order Amount
  if (coupon.min_spend && subtotal < coupon.min_spend) {
    return {
      success: false,
      message: `Minimum spend of Rs. ${coupon.min_spend.toLocaleString()} required for code ${coupon.code}.`,
    };
  }

  // Calculate Discount Amount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round(subtotal * (coupon.discount_value / 100));
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else if (coupon.discount_type === 'fixed_amount') {
    discount = Math.min(subtotal, coupon.discount_value);
  }

  return {
    success: true,
    code: coupon.code,
    discountAmount: discount,
    message: `Coupon "${coupon.code}" applied successfully! You saved Rs. ${discount.toLocaleString()}.`,
  };
}

export async function fetchPublicCoupons(): Promise<CouponItem[]> {
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_public', true)
    .eq('is_active', true)
    .order('discount_value', { ascending: false });

  return (data as CouponItem[]) || [];
}
