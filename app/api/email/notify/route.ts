import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      charName,
      charLevel,
      vocation,
      world,
      serviceType,
      paymentMethod,
      totalBrl,
      totalRc,
      orderId,
    } = body;

    const paymentLabel =
      paymentMethod === 'pix'
        ? 'PIX'
        : paymentMethod === 'card'
        ? 'Cartão'
        : `Rubini Coins (${totalRc} RC)`;

    await resend.emails.send({
      from: 'FB Services <onboarding@resend.dev>',
      to: 'fbservices.onrubinot@gmail.com',
      subject: `🔔 Novo pedido — ${serviceType} (${customerName})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#c026d3);padding:28px 32px;">
            <h1 style="margin:0;font-size:22px;color:white;">🔔 Novo Pedido Recebido</h1>
            <p style="margin:6px 0 0;opacity:0.85;color:white;font-size:14px;">FB Services — Painel de Notificações</p>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td colspan="2" style="padding-bottom:16px;font-size:16px;font-weight:700;color:#a78bfa;border-bottom:1px solid #1e2a3a;">📋 Dados do Pedido</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;width:40%;">Service</td><td style="padding:10px 0;font-weight:600;color:#f1f5f9;">${serviceType}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Pagamento</td><td style="padding:10px 0;font-weight:600;color:#f1f5f9;">${paymentLabel}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Valor</td><td style="padding:10px 0;font-weight:600;color:#4ade80;">R$ ${Number(totalBrl).toFixed(2).replace('.', ',')}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Pedido ID</td><td style="padding:10px 0;font-size:12px;color:#64748b;">${orderId}</td></tr>
              <tr><td colspan="2" style="padding:20px 0 16px;font-size:16px;font-weight:700;color:#a78bfa;border-bottom:1px solid #1e2a3a;border-top:1px solid #1e2a3a;">👤 Dados do Cliente</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Nome</td><td style="padding:10px 0;font-weight:600;color:#f1f5f9;">${customerName}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">E-mail</td><td style="padding:10px 0;color:#f1f5f9;">${customerEmail}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Telefone</td><td style="padding:10px 0;color:#f1f5f9;">${customerPhone}</td></tr>
              <tr><td colspan="2" style="padding:20px 0 16px;font-size:16px;font-weight:700;color:#a78bfa;border-bottom:1px solid #1e2a3a;border-top:1px solid #1e2a3a;">🎮 Dados do Personagem</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Char</td><td style="padding:10px 0;font-weight:600;color:#f1f5f9;">${charName}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Level</td><td style="padding:10px 0;color:#f1f5f9;">${charLevel}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Vocação</td><td style="padding:10px 0;color:#f1f5f9;">${vocation}</td></tr>
              <tr><td style="padding:10px 0;color:#94a3b8;">Mundo</td><td style="padding:10px 0;color:#f1f5f9;">${world}</td></tr>
            </table>
            <div style="margin-top:24px;text-align:center;">
              <a href="https://fbservices.vercel.app/admin" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#c026d3);color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Abrir Painel Admin</a>
            </div>
          </div>
          <div style="padding:16px 32px;background:#060a14;text-align:center;font-size:12px;color:#475569;">FB Services © 2026</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}