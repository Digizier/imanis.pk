import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { bookOrderWithOrio } from '@/lib/orio/orioService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId is required' }, { status: 400 });
    }

    // 1. Fetch Order and items from Supabase
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Order not found in database' }, { status: 404 });
    }

    // 2. Dispatch to ORIO API
    const bookResult = await bookOrderWithOrio({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      province: order.province,
      city: order.city,
      area: order.area,
      full_address: order.full_address,
      landmark: order.landmark,
      payment_method: order.payment_method || 'cod',
      shipping_fee: order.shipping_fee,
      total_amount: order.total_amount,
      order_notes: order.order_notes,
      items: (order.items || []).map((i: any) => ({
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      })),
    });

    if (!bookResult.success) {
      return NextResponse.json({
        success: false,
        message: bookResult.message,
        details: bookResult.rawPayload,
      }, { status: 400 });
    }

    // 3. Update Order in Supabase with Orio Tracking details
    const orioIdStr = bookResult.orioOrderId ? String(bookResult.orioOrderId) : null;
    const cnNo = bookResult.consignmentNo || orioIdStr;

    await supabase
      .from('orders')
      .update({
        courier: 'ORIO',
        orio_order_id: orioIdStr,
        orio_consignment_no: cnNo,
        tracking_number: cnNo,
        order_status: 'dispatched',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      message: bookResult.message,
      orioOrderId: bookResult.orioOrderId,
      consignmentNo: cnNo,
    });
  } catch (error: any) {
    console.error('Error in /api/orio/book:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error booking with ORIO',
    }, { status: 500 });
  }
}
