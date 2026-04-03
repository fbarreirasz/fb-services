import { NextRequest, NextResponse } from 'next/server';

const ASAAS_BASE_URL = 'https://api.asaas.com/v3';

function onlyDigits(value: string) {
  return (value || '').replace(/\D/g, '');
}

async function findCustomerByEmail(email: string, apiKey: string) {
  const response = await fetch(
    `${ASAAS_BASE_URL}/customers?email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        access_token: apiKey,
      },
      cache: 'no-store',
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.description || 'Erro ao buscar cliente no Asaas.');
  }

  return data?.data?.[0] || null;
}

async function createCustomer({
  name,
  email,
  phone,
  cpfCnpj,
  apiKey,
}: {
  name: string;
  email: string;
  phone: string;
  cpfCnpj?: string;
  apiKey: string;
}) {
  const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey,
    },
    body: JSON.stringify({
  name,
  email,
  mobilePhone: onlyDigits(phone),
  cpfCnpj: cpfCnpj ? onlyDigits(cpfCnpj) : undefined,
}),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.description || 'Erro ao criar cliente no Asaas.');
  }

  return data;
}

async function updateCustomer({
  customerId,
  name,
  email,
  phone,
  cpfCnpj,
  apiKey,
}: {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj?: string;
  apiKey: string;
}) {
  const response = await fetch(`${ASAAS_BASE_URL}/customers/${customerId}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey,
    },
    body: JSON.stringify({
      name,
      email,
      mobilePhone: onlyDigits(phone),
      cpfCnpj: cpfCnpj ? onlyDigits(cpfCnpj) : undefined,
    }),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.description || 'Erro ao atualizar cliente.'
    );
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASAAS_API_KEY;
    console.log('ASAAS_API_KEY:', apiKey);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ASAAS_API_KEY não configurada.' },
        { status: 500 }
      );
    }

    if (!siteUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SITE_URL não configurada.' },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
  customerName,
  customerEmail,
  customerPhone,
  customerCpfCnpj,
  value,
  paymentMethod,
  orderId,
  description,
} = body as {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpfCnpj?: string;
  value: number;
  paymentMethod: 'pix' | 'card';
  orderId: string;
  description: string;
};

    if (!customerName || !customerEmail || !customerPhone || !value || !orderId) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes.' },
        { status: 400 }
      );
    }

    let customer = await findCustomerByEmail(customerEmail, apiKey);

    if (!customer) {
  customer = await createCustomer({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    cpfCnpj: customerCpfCnpj,
    apiKey,
  });
} else {
  customer = await updateCustomer({
    customerId: customer.id,
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    cpfCnpj: customerCpfCnpj,
    apiKey,
  });

    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const formattedDueDate = dueDate.toISOString().slice(0, 10);

    const billingType = paymentMethod === 'card' ? 'CREDIT_CARD' : 'PIX';

    const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: apiKey,
      },
      body: JSON.stringify({
        customer: customer.id,
        billingType,
        value,
        dueDate: formattedDueDate,
        description,
        externalReference: orderId,
      
      }),
      cache: 'no-store',
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return NextResponse.json(
        {
          error:
            paymentData?.errors?.[0]?.description ||
            'Erro ao criar cobrança no Asaas.',
        },
        { status: 400 }
      );
    }

    let pixData: any = null;

    if (billingType === 'PIX') {
      const qrResponse = await fetch(
        `${ASAAS_BASE_URL}/payments/${paymentData.id}/pixQrCode`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            access_token: apiKey,
          },
          cache: 'no-store',
        }
      );

      pixData = await qrResponse.json();

      if (!qrResponse.ok) {
        return NextResponse.json(
          {
            error:
              pixData?.errors?.[0]?.description ||
              'Erro ao obter QR Code PIX no Asaas.',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      paymentId: paymentData.id,
      invoiceUrl: paymentData.invoiceUrl,
      billingType,
      pixQrCodeImage: pixData?.encodedImage
  ? `data:image/png;base64,${pixData.encodedImage}`
  : null,
      pixCopyPaste: pixData?.payload || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro inesperado no checkout Asaas.' },
      { status: 500 }
    );
  }
}