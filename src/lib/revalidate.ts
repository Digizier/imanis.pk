/**
 * Helper to trigger targeted cache invalidation on Next.js Edge CDN from Admin mutation actions.
 */
export async function triggerRevalidate(paths: string[]) {
  const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET || 'imanis_revalidation_secret_key_2026_prod';
  if (!paths || paths.length === 0) return;

  try {
    for (const path of paths) {
      if (!path) continue;
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, secret }),
      });
    }
  } catch (err) {
    console.error('[Revalidate] Failed to trigger targeted revalidation:', err);
  }
}
