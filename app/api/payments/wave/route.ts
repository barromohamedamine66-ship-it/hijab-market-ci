import { NextResponse } from 'next/server';
import { createWaveCheckoutSession } from '@/lib/payment/wave';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, amount, customerName, customerPhone } = body;

    if (!orderNumber || !amount) {
      return NextResponse.json({ error: 'Données de commande incomplètes' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://hijab-market-ci.vercel.app';

    const result = await createWaveCheckoutSession({
      orderNumber,
      amount,
      customerName: customerName || 'Cliente HIJAB MARKET CI',
      customerPhone: customerPhone || '',
      successUrl: `${origin}/orders?payment=success&order=${orderNumber}`,
      errorUrl: `${origin}/checkout?payment=error&order=${orderNumber}`,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error, fallback: true }, { status: 200 });
    }

    return NextResponse.json({ wave_launch_url: result.wave_launch_url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}
