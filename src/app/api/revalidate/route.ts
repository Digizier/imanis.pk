import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, secret } = body;

    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ message: 'Unauthorized secret token' }, { status: 401 });
    }

    if (!path || typeof path !== 'string' || !path.startsWith('/')) {
      return NextResponse.json({ message: 'Invalid or missing target path for revalidation' }, { status: 400 });
    }

    // Perform targeted cache invalidation for the exact path specified
    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server revalidation error' }, { status: 500 });
  }
}
