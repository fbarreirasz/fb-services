// TESTE GIT

export async function GET() {
  return new Response('WEBHOOK OK');
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurado.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: Request) {
  try {
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

    const body = await req.json();

    console.log('WEBHOOK ASAAS BODY:', JSON.stringify(body, null, 2));

    const event = body?.event;
    const payment = body?.payment;
    const orderId = payment?.externalReference;

    console.log('WEBHOOK ASAAS EVENT:', event);
    console.log('WEBHOOK ASAAS ORDER ID:', orderId);
    console.log('WEBHOOK ASAAS PAYMENT ID:', payment?.id);

    if (!payment || !orderId) {
      return NextResponse.json({ ok: true });
    }

    let nextStatus: string | null = null;

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      nextStatus = 'paid';
    }

    if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED') {
      nextStatus = 'failed';
    }

    if (!nextStatus) {
      return NextResponse.json({ ok: true });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('SUPABASE UPDATE ERROR:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar pedido no banco.' },
        { status: 500 }
      );
    }

    console.log('SUPABASE UPDATE SUCCESS:', data);

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (error) {
    console.error('WEBHOOK ERROR:', error);
    return NextResponse.json(
      { error: 'Erro no webhook.' },
      { status: 500 }
    );
  }
}