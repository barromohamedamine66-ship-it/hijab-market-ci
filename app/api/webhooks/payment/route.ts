import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Ce webhook serait appelé par le prestataire de paiement (ex: CinetPay, Paystack)
// après qu'un client ait validé ou échoué son paiement via Wave, Orange Money ou MTN.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Vérification de la signature du webhook (à implémenter avec la clé secrète du prestataire)
    // const signature = req.headers.get('x-provider-signature');
    // if (!verifySignature(body, signature, process.env.PAYMENT_PROVIDER_SECRET)) return 401;

    const { transaction_id, order_id, status, amount, currency } = body;

    // 2. Trouver le paiement correspondant
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('id, status, order_id')
      .eq('internal_ref', order_id)
      .single();

    if (!payment) {
      return NextResponse.json({ message: 'Paiement introuvable' }, { status: 404 });
    }

    // 3. Idempotence
    if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
      return NextResponse.json({ message: 'Déjà traité' }, { status: 200 });
    }

    // 4. Enregistrer l'événement webhook
    await supabaseAdmin
      .from('payment_events')
      .insert({
        payment_id: payment.id,
        status: status,
        payload: JSON.stringify(body)
      });

    // 5. Mettre à jour selon le statut
    if (status === 'ACCEPTED' || status === 'SUCCESS') {
      // MàJ Paiement
      await supabaseAdmin
        .from('payments')
        .update({ 
          status: 'SUCCESS',
          external_ref: transaction_id,
          provider_response: JSON.stringify(body),
          confirmed_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      // MàJ Commande Principale
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'SUCCESS' })
        .eq('id', payment.order_id);

      // MàJ Sous-commandes
      await supabaseAdmin
        .from('seller_orders')
        .update({ status: 'PAYEE' })
        .eq('order_id', payment.order_id);

      // TODO: Envoyer Notification (Email/SMS) au client et aux vendeurs
      
      return NextResponse.json({ message: 'Paiement validé avec succès' }, { status: 200 });
      
    } else if (status === 'REFUSED' || status === 'FAILED') {
      await supabaseAdmin
        .from('payments')
        .update({ 
          status: 'FAILED',
          external_ref: transaction_id,
          provider_response: JSON.stringify(body)
        })
        .eq('id', payment.id);

      return NextResponse.json({ message: 'Paiement échoué enregistré' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Statut inconnu' }, { status: 400 });

  } catch (error) {
    console.error('Erreur Webhook Paiement:', error);
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
