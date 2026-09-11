import orioCitiesData from './orioCities.json';

export interface OrioCity {
  id: number;
  name: string;
}

const ORIO_CITIES: OrioCity[] = orioCitiesData as OrioCity[];

// Normalized map for O(1) city lookup
const cityLookupMap = new Map<string, number>();
ORIO_CITIES.forEach((c) => {
  cityLookupMap.set(c.name.toLowerCase().trim(), c.id);
});

// Common Pakistani city aliases & abbreviations
const CITY_ALIASES: Record<string, string> = {
  'isb': 'islamabad',
  'lhr': 'lahore',
  'khi': 'karachi',
  'fsd': 'faisalabad',
  'rwp': 'rawalpindi',
  'mux': 'multan',
  'pew': 'peshawar',
  'qta': 'quetta',
  'guj': 'gujranwala',
  'skt': 'sialkot',
  'bwp': 'bahawalpur',
  'islamabad capital territory (ict)': 'islamabad',
  'islamabad capital territory': 'islamabad',
  'ict': 'islamabad',
  'khyber pakhtunkhwa (kpk)': 'peshawar',
  'kpk': 'peshawar',
  'ajk': 'muzaffarabad',
  'azad jammu & kashmir (ajk)': 'muzaffarabad',
  'gilgit-baltistan (gb)': 'gilgit',
};

/**
 * Resolves any customer entered city name into an official ORIO destination_city_id
 */
export function getOrioCityId(cityName?: string | null, provinceName?: string | null): number {
  if (!cityName) return 791; // Default to Lahore

  const clean = cityName.toLowerCase().trim().replace(/[^a-zA-Z0-9\s]/g, '');

  // 1. Direct match
  if (cityLookupMap.has(clean)) {
    return cityLookupMap.get(clean)!;
  }

  // 2. Alias match
  const aliasTarget = CITY_ALIASES[clean];
  if (aliasTarget && cityLookupMap.has(aliasTarget)) {
    return cityLookupMap.get(aliasTarget)!;
  }

  // 3. Substring match (e.g., "Lahore Cantt" -> "Lahore", "Karachi South" -> "Karachi")
  for (const city of ORIO_CITIES) {
    const cLower = city.name.toLowerCase();
    if (clean.includes(cLower) || cLower.includes(clean)) {
      return city.id;
    }
  }

  // 4. Province based fallback
  if (provinceName) {
    const provLower = provinceName.toLowerCase();
    if (provLower.includes('sindh')) return 655; // Karachi
    if (provLower.includes('punjab')) return 791; // Lahore
    if (provLower.includes('islamabad')) return 538; // Islamabad
    if (provLower.includes('kpk') || provLower.includes('khyber')) return 1015; // Peshawar
    if (provLower.includes('balochistan')) return 1064; // Quetta
  }

  return 791; // Safe Default: Lahore (ID: 791)
}

export interface OrioBookOrderParams {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  province?: string | null;
  city?: string | null;
  area?: string | null;
  full_address: string;
  landmark?: string | null;
  payment_method: string;
  shipping_fee?: number | null;
  total_amount: number;
  order_notes?: string | null;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal?: number;
  }>;
}

export interface OrioBookOrderResult {
  success: boolean;
  message: string;
  orioOrderId?: number;
  consignmentNo?: string;
  rawPayload?: any;
}

/**
 * Sends an order to ORIO Multi-Courier OMS via V2 Bulk Create API
 */
export async function bookOrderWithOrio(params: OrioBookOrderParams): Promise<OrioBookOrderResult> {
  const apiUrl = process.env.ORIO_API_URL || 'https://apis.orio.digital';
  const apiKey = process.env.ORIO_API_KEY || '/iryzMsUVM3EI5jZisbNj+RX6CzgDEcD3Ko3/9b0yPb3345iQf5Sfqdw2Hy5ZF80r4iga6/1TbYzzXlRCTwU2A==';
  const acno = process.env.ORIO_ACCOUNT_NUMBER || 'OR-05878';
  const userId = parseInt(process.env.ORIO_USER_ID || '6044', 10);

  const destinationCityId = getOrioCityId(params.city, params.province);
  const customerPlatformId = parseInt(process.env.ORIO_CUSTOMER_PLATFORM_ID || '6514', 10);

  // Build clean address with landmarks & area
  const fullAddress = [
    params.full_address,
    params.area ? `Area: ${params.area}` : '',
    params.landmark ? `Near: ${params.landmark}` : '',
    params.city || '',
    params.province || '',
  ]
    .filter(Boolean)
    .join(', ');

  // Clean phone number format (e.g. 03121222333)
  const cleanPhone = (params.customer_phone || '').replace(/[^0-9]/g, '');

  // Map Line items
  const lineItems = (params.items && params.items.length > 0)
    ? params.items.map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity || 1,
        amount: Math.round(item.unit_price * (item.quantity || 1)),
      }))
    : [
        {
          product_name: `Order ${params.order_number}`,
          quantity: 1,
          amount: Math.round(params.total_amount),
        },
      ];

  const orioOrderObject = {
    consignee_name: params.customer_name || 'Valued Customer',
    consignee_address: fullAddress,
    consignee_email: params.customer_email || 'imanisbyanila@gmail.com',
    consignee_contact: cleanPhone,
    destination_city_id: destinationCityId,
    order_ref: params.order_number,
    platform_id: 7, // 7 = Custom Web Platform
    customer_platform_id: customerPlatformId,
    payment_method_id: params.payment_method.toLowerCase() === 'cod' ? 1 : 2, // 1 = COD, 2 = Prepaid
    remarks: params.order_notes || `Order ${params.order_number} from Imani's Collection`,
    shipping_charges: Math.round(params.shipping_fee || 0),
    line_items: lineItems,
  };

  const requestPayload = {
    acno,
    user_id: userId,
    orders: [orioOrderObject],
  };

  try {
    const response = await fetch(`${apiUrl}/api/v2/order/bulk-create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (data.status === 1 || data.status === '1') {
      const orderResult = data.payload?.[0];

      // Check if individual order failed validation
      if (orderResult && (orderResult.status === 0 || orderResult.status === '0')) {
        return {
          success: false,
          message: orderResult.message || 'ORIO order booking validation failed',
          rawPayload: data,
        };
      }

      const orioId = orderResult?.payload?.id || orderResult?.id;
      const consignmentNo = orderResult?.payload?.consignment_no || orderResult?.consignment_no;

      if (!orioId) {
        return {
          success: false,
          message: orderResult?.message || data.message || 'Failed to retrieve ORIO Order ID',
          rawPayload: data,
        };
      }

      return {
        success: true,
        message: orderResult?.message || data.message || 'Order successfully booked in ORIO OMS!',
        orioOrderId: orioId,
        consignmentNo: consignmentNo,
        rawPayload: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to book order with ORIO',
        rawPayload: data,
      };
    }
  } catch (error: any) {
    console.error('[ORIO API Error]:', error);
    return {
      success: false,
      message: error.message || 'Network error connecting to ORIO API',
    };
  }
}

/**
 * Tracks an order using ORIO Track API
 */
export async function trackOrderWithOrio(orderId: number | string): Promise<{ success: boolean; data?: any; message?: string }> {
  const apiUrl = process.env.ORIO_API_URL || 'https://apis.orio.digital';
  const apiKey = process.env.ORIO_API_KEY || '/iryzMsUVM3EI5jZisbNj+RX6CzgDEcD3Ko3/9b0yPb3345iQf5Sfqdw2Hy5ZF80r4iga6/1TbYzzXlRCTwU2A==';
  const acno = process.env.ORIO_ACCOUNT_NUMBER || 'OR-05878';

  try {
    const response = await fetch(`${apiUrl}/api/track`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acno,
        order_id: Number(orderId),
      }),
    });

    const result = await response.json();

    if (result.status === 1 || result.status === '1') {
      return {
        success: true,
        data: result.payload?.[0] || result.payload,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Tracking information not yet updated by courier',
      };
    }
  } catch (error: any) {
    console.error('[ORIO Track Error]:', error);
    return {
      success: false,
      message: error.message || 'Failed to query tracking information from ORIO',
    };
  }
}
