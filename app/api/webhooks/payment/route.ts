import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ce webhook serait appelé par le prestataire de paiement (ex: CinetPay, Paystack)
// après qu'un client ait validé ou échoué son paiement via Wave, Orange Money ou MTN.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Vérification de la signature du webhook (à implémenter avec la clé secrète du prestataire)
    // const signature = req.headers.get('x-provider-signature');
    // if (!verifySignature(body, signature, process.env.PAYMENT_PROVIDER_SECRET)) return 401;

    // Structure fictive basée sur un prestataire type
    const { transaction_id, order_id, status, amount, currency } = body;

    // 2. Trouver le paiement correspondant
    const payment = await prisma.payment.findUnique({
      where: { internalRef: order_id } // On suppose que order_id envoyé au prestataire est notre internalRef
    });

    if (!payment) {
      return NextResponse.json({ message: 'Paiement introuvable' }, { status: 404 });
    }

    // 3. Idempotence : si le paiement est déjà success/failed, on ne fait rien
    if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
      return NextResponse.json({ message: 'Déjà traité' }, { status: 200 });
    }

    // 4. Enregistrer l'événement de webhook (Audit log)
    await prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        status: status,
        payload: JSON.stringify(body)
      }
    });

    // 5. Mettre à jour le paiement et la commande selon le statut
    if (status === 'ACCEPTED' || status === 'SUCCESS') {
      
      // Utilisation d'une transaction Prisma pour garantir l'intégrité
      await prisma.$transaction(async (tx) => {
        
        // MàJ Paiement
        await tx.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'SUCCESS',
            externalRef: transaction_id,
            providerResponse: JSON.stringify(body),
            confirmedAt: new Date()
          }
        });

        // MàJ Commande Principale
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'SUCCESS' }
        });

        // MàJ Sous-commandes (Vendeurs)
        await tx.sellerOrder.updateMany({
          where: { orderId: payment.orderId },
          data: { status: 'PAYEE' } // Passe du statut EN_ATTENTE_PAIEMENT à PAYEE
        });

        // Générer les codes OTP pour les livraisons à cette étape ou plus tard lors de la préparation
      });

      // TODO: Envoyer Notification (Email/SMS) au client et aux vendeurs
      
      return NextResponse.json({ message: 'Paiement validé avec succès' }, { status: 200 });
      
    } else if (status === 'REFUSED' || status === 'FAILED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          externalRef: transaction_id,
          providerResponse: JSON.stringify(body)
        }
      });
      return NextResponse.json({ message: 'Paiement échoué enregistré' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Statut inconnu' }, { status: 400 });

  } catch (error) {
    console.error('Erreur Webhook Paiement:', error);
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 });
  }
}
