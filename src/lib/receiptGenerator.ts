import { categories } from '@/data/gharunData';

export interface ReceiptData {
  receipt_number: string;
  request_number: string;
  client_name: string;
  service_type: string;
  location?: string;
  amount: number;
  payment_method: string;
  generated_at: string;
}

export function generateReceiptHTML(receipt: ReceiptData): string {
  const serviceName = categories.find(c => c.id === receipt.service_type)?.name || receipt.service_type;
  const paymentMethodLabel = receipt.payment_method === 'online' ? 'Online Payment' : 'Cash';
  const dateStr = new Date(receipt.generated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${receipt.receipt_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 20px; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e40af, #1d4ed8); color: white; padding: 32px 32px 24px; text-align: center; }
    .header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.5px; }
    .header p { font-size: 12px; opacity: 0.8; }
    .header .subtitle { font-size: 11px; opacity: 0.6; margin-top: 2px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-top: 16px; letter-spacing: 0.5px; }
    .body { padding: 32px; }
    .receipt-title { text-align: center; margin-bottom: 24px; }
    .receipt-title h2 { font-size: 18px; font-weight: 700; color: #111827; }
    .receipt-title .receipt-num { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: #6b7280; font-weight: 500; }
    .detail-value { font-size: 13px; color: #111827; font-weight: 600; text-align: right; }
    .amount-section { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .amount-label { font-size: 12px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .amount-value { font-size: 32px; font-weight: 800; color: #166534; margin-top: 4px; }
    .amount-currency { font-size: 16px; font-weight: 600; }
    .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px; }
    .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 11px; color: #9ca3af; line-height: 1.6; }
    .footer .brand { font-weight: 700; color: #6b7280; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Gharun Nepal</h1>
      <p>Trusted Home Services Platform</p>
      <p class="subtitle">घरन नेपाल — विश्वसनीय घर सेवा प्लेटफर्म</p>
      <div class="badge">PAYMENT RECEIPT</div>
    </div>
    <div class="body">
      <div class="receipt-title">
        <h2>Payment Confirmation</h2>
        <div class="receipt-num">${receipt.receipt_number}</div>
      </div>
      <div class="divider"></div>
      <div class="detail-row">
        <span class="detail-label">Request Number</span>
        <span class="detail-value">${receipt.request_number}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Client Name</span>
        <span class="detail-value">${receipt.client_name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">${serviceName}</span>
      </div>
      ${receipt.location ? `
      <div class="detail-row">
        <span class="detail-label">Location</span>
        <span class="detail-value">${receipt.location}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Payment Method</span>
        <span class="detail-value">${paymentMethodLabel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${dateStr}</span>
      </div>
      <div class="amount-section">
        <div class="amount-label">Amount Paid</div>
        <div class="amount-value"><span class="amount-currency">Rs.</span> ${Number(receipt.amount).toLocaleString()}</div>
        <div class="status-badge">PAID</div>
      </div>
    </div>
    <div class="footer">
      <p class="brand">Gharun Nepal / घरन नेपाल</p>
      <p>Jhapa District, Nepal</p>
      <p style="margin-top: 8px;">This is a computer-generated receipt. No signature required.</p>
      <p>For support: WhatsApp +977 9713242471</p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 20px;" class="no-print">
    <button onclick="window.print()" style="background: #1d4ed8; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
      Print Receipt
    </button>
  </div>
</body>
</html>`;
}

export function openReceiptWindow(receipt: ReceiptData) {
  const html = generateReceiptHTML(receipt);
  const win = window.open('', '_blank', 'width=700,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
