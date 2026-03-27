import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('WEBHOOK ASAAS:', body);

    const event = body.event;
    const payment = body.payment;

    const webhookToken = req.headers.get('asaas-access-token');

if (!process.env.ASAAS_WEBHOOK_TOKEN) {
  return NextResponse.json(
    { error: 'ASAAS_WEBHOOK_TOKEN não configurado.' },
    { status: 500 }
  );
}

if (webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
  return NextResponse.json(
    { error: 'Token de webhook inválido.' },
    { status: 401 }
  );
}

    if (!payment) {
      return NextResponse.json({ ok: true });
    }

    const orderId = payment.externalReference;

    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    // 🔥 PAGAMENTO CONFIRMADO
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      await supabase
        .from('orders')
        .update({
          status: 'approved',
        })
        .eq('id', orderId);
    }

    // ❌ PAGAMENTO FALHOU
    if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED') {
      await supabase
        .from('orders')
        .update({
          status: 'failed',
        })
        .eq('id', orderId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WEBHOOK ERROR:', error);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}