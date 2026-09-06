import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const transactionId = body.cpm_trans_id || body.transaction_id;
    const siteId = body.cpm_site_id || process.env.NEXT_PUBLIC_CINETPAY_SITE_ID;
    const apiKey = process.env.CINETPAY_API_KEY || process.env.NEXT_PUBLIC_CINETPAY_API_KEY;

    if (!transactionId) {
      return NextResponse.json({ message: 'Identifiant de transaction manquant' }, { status: 400 });
    }

    // Si les clés API sont configurées, vérifier l'authenticité auprès de CinetPay
    if (apiKey && siteId) {
      try {
        const verifyRes = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apikey: apiKey,
            site_id: siteId,
            transaction_id: transactionId,
          }),
        });

        const verifyData = await verifyRes.json();

        // Si CinetPay confirme que le paiement est ACCEPTED
        if (verifyData.code === '00' && verifyData.data?.status === 'ACCEPTED') {
          if (isSupabaseConfigured()) {
            await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_status: 'success',
                updated_at: new Date().toISOString(),
              })
              .eq('order_number', transactionId);

            await supabase.from('payments').insert({
              order_id: transactionId,
              provider: verifyData.data?.payment_method || 'cinetpay',
              amount: verifyData.data?.amount,
              status: 'success',
              transaction_reference: verifyData.data?.operator_id || transactionId,
              created_at: new Date().toISOString(),
            });
          }

          return NextResponse.json({ message: 'Paiement confirmé avec succès' }, { status: 200 });
        }
      } catch (checkErr) {
        console.warn('Erreur vérification CinetPay:', checkErr);
      }
    }

    return NextResponse.json({ message: 'Notification reçue' }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur webhook CinetPay:', error);
    return NextResponse.json({ message: 'Erreur interne', error: error?.message }, { status: 500 });
  }
}
