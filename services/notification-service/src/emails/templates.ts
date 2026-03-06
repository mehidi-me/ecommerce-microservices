export const orderConfirmationTemplate = (data: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    currency: string;
    address: Record<string, string>;
}) => ({
    subject: `Order Confirmed — #${data.orderId.slice(-8).toUpperCase()}`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px">✅ Order Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">We've received your order and are processing it.</p>
    </div>
    <div style="padding:32px">
      <p style="color:#374151;font-size:16px">Order ID: <strong>#${data.orderId.slice(-8).toUpperCase()}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:12px;text-align:left;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb">Item</th>
            <th style="padding:12px;text-align:center;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb">Qty</th>
            <th style="padding:12px;text-align:right;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb">Price</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td style="padding:12px;color:#111827;border-bottom:1px solid #f3f4f6">${item.name}</td>
            <td style="padding:12px;text-align:center;color:#374151;border-bottom:1px solid #f3f4f6">${item.quantity}</td>
            <td style="padding:12px;text-align:right;color:#374151;border-bottom:1px solid #f3f4f6">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 12px;font-weight:700;color:#111827">Total</td>
            <td style="padding:16px 12px;text-align:right;font-weight:700;color:#6366f1;font-size:18px">$${data.total.toFixed(2)} ${data.currency.toUpperCase()}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-top:16px">
        <p style="margin:0 0 4px;font-weight:600;color:#374151">Shipping to:</p>
        <p style="margin:0;color:#6b7280">${data.address.street}, ${data.address.city}, ${data.address.country} ${data.address.postalCode}</p>
      </div>
      <div style="text-align:center;margin-top:32px">
        <a href="#" style="background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">View Order</a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:24px;text-align:center;color:#9ca3af;font-size:13px">
      <p style="margin:0">Questions? <a href="mailto:support@yourstore.com" style="color:#6366f1">support@yourstore.com</a></p>
    </div>
  </div>
</body>
</html>`,
});

export const paymentSuccessTemplate = (data: {
    orderId: string;
    total: number;
    currency: string;
    paymentIntentId: string;
}) => ({
    subject: '💳 Payment Received — Thank You!',
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px">Payment Successful</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="font-size:48px;margin:0">💳</p>
      <p style="color:#374151;font-size:18px">We received your payment of <strong>$${data.total.toFixed(2)} ${data.currency.toUpperCase()}</strong></p>
      <p style="color:#6b7280">Order: <strong>#${data.orderId.slice(-8).toUpperCase()}</strong></p>
      <p style="color:#6b7280;font-size:12px">Payment ID: ${data.paymentIntentId}</p>
      <a href="#" style="background:#10b981;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:16px">View Order</a>
    </div>
  </div>
</body>
</html>`,
});

export const paymentFailedTemplate = (data: { orderId: string }) => ({
    subject: '❌ Payment Failed — Action Required',
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#ef4444;padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0">Payment Failed</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="color:#374151">Your payment for order <strong>#${data.orderId.slice(-8).toUpperCase()}</strong> was unsuccessful.</p>
      <p style="color:#6b7280">Please try again with a different payment method.</p>
      <a href="#" style="background:#ef4444;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Retry Payment</a>
    </div>
  </div>
</body>
</html>`,
});

export const shippingTemplate = (data: { orderId: string; trackingNumber?: string }) => ({
    subject: '🚚 Your Order Has Shipped!',
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0">Your Order Is On Its Way!</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="font-size:48px;margin:0">🚚</p>
      <p style="color:#374151">Order <strong>#${data.orderId.slice(-8).toUpperCase()}</strong> has been shipped.</p>
      ${data.trackingNumber ? `<div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0"><p style="margin:0;color:#1d4ed8;font-weight:600">Tracking Number: ${data.trackingNumber}</p></div>` : ''}
      <a href="#" style="background:#3b82f6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:16px">Track Order</a>
    </div>
  </div>
</body>
</html>`,
});

export const welcomeTemplate = (data: { email: string }) => ({
    subject: '👋 Welcome to Our Store!',
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0">Welcome! 🎉</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="color:#374151;font-size:18px">Thanks for joining us, <strong>${data.email}</strong>!</p>
      <p style="color:#6b7280">Explore our catalog and find something you'll love.</p>
      <a href="#" style="background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Start Shopping</a>
    </div>
  </div>
</body>
</html>`,
});
