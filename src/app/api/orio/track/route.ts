import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { trackOrderWithOrio } from '@/lib/orio/orioService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orioOrderId } = body;

    let targetOrioId = orioOrderId;

    if (!targetOrioId && orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('orio_order_id, tracking_number')
        .eq('id', orderId)
        .single();

      targetOrioId = order?.orio_order_id || order?.tracking_number;
    }

    if (!targetOrioId) {
      return NextResponse.json({
        success: false,
        message: 'No ORIO Order ID found for this order. It may not have been booked with Orio yet.',
      }, { status: 400 });
    }

    const trackResult = await trackOrderWithOrio(targetOrioId);

    // Sync updated courier details back to database when available
    if (trackResult.success && trackResult.data) {
      try {
        const cn = trackResult.data.consignment_no;
        const courierName = trackResult.data.courier_name;
        const updates: any = {};
        if (cn) updates.orio_consignment_no = cn;
        if (courierName) updates.courier = courierName;

        if (Object.keys(updates).length > 0) {
          if (orderId) {
            await supabase.from('orders').update(updates).eq('id', orderId);
          } else if (targetOrioId) {
            await supabase.from('orders').update(updates).eq('orio_order_id', String(targetOrioId));
          }
        }
      } catch (syncErr) {
        console.warn('Non-fatal: failed to sync courier details to supabase:', syncErr);
      }
    }

    return NextResponse.json(trackResult);
  } catch (error: any) {
    console.error('Error in /api/orio/track:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal error tracking order',
    }, { status: 500 });
  }
}
