export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    let body;
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries(fd.entries());
    }

    const {
      name = '',
      company = '',
      email = '',
      phone = '',
      product = '',
      enquiry_type = 'Price Quote',
      quantity = '',
      message = '',
    } = body;

    const RESEND_API_KEY = env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // 1. Internal notification to info@rajaansh.com
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rajaansh Website <enquiries@rajaansh.com>',
        to: ['info@rajaansh.com'],
        reply_to: email,
        subject: `New Enquiry — ${name}${company ? ' (' + company + ')' : ''} [${product || enquiry_type}]`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0D1B2A;padding:24px 32px;border-radius:8px 8px 0 0;">
              <h2 style="color:#E8BC6A;margin:0;font-size:20px;">New Enquiry from rajaansh.com</h2>
            </div>
            <div style="border:1px solid #e5e0d5;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;width:130px;vertical-align:top;"><strong>Name</strong></td>
                  <td style="padding:10px 0;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Company</strong></td>
                  <td style="padding:10px 0;">${company || '—'}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Email</strong></td>
                  <td style="padding:10px 0;"><a href="mailto:${email}" style="color:#C9963A;">${email}</a></td>
                </tr>
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Phone</strong></td>
                  <td style="padding:10px 0;">${phone || '—'}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Product</strong></td>
                  <td style="padding:10px 0;">${product || '—'}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Enquiry Type</strong></td>
                  <td style="padding:10px 0;">${enquiry_type}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0ebe0;">
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Quantity</strong></td>
                  <td style="padding:10px 0;">${quantity || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#6b7280;vertical-align:top;"><strong>Message</strong></td>
                  <td style="padding:10px 0;">${message || '—'}</td>
                </tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#f8f5ee;border-radius:6px;font-size:13px;color:#6b7280;">
                Reply directly to this email to respond to ${name}.
              </div>
            </div>
          </div>
        `,
      }),
    });

    // 2. Auto-reply to enquirer
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rajaansh Industries <info@rajaansh.com>',
        to: [email],
        subject: 'We received your enquiry — Rajaansh Industries',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0D1B2A;padding:24px 32px;border-radius:8px 8px 0 0;">
              <h2 style="color:#E8BC6A;margin:0;font-size:20px;">Rajaansh Industries Pvt. Ltd.</h2>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">PP / HDPE Woven Bag Manufacturers · Bangalore</p>
            </div>
            <div style="border:1px solid #e5e0d5;border-top:none;padding:32px;border-radius:0 0 8px 8px;">
              <p style="font-size:15px;color:#1c1c1c;">Dear ${name.split(' ')[0]},</p>
              <p style="font-size:14px;color:#6b7280;line-height:1.7;">Thank you for reaching out to us. We have received your enquiry${product ? ' regarding <strong style="color:#1c1c1c;">' + product + '</strong>' : ''} and our team will get back to you within <strong style="color:#1c1c1c;">1 business day</strong> with pricing and details.</p>
              <p style="font-size:14px;color:#6b7280;line-height:1.7;">If you need to reach us urgently, please call or WhatsApp us at <a href="tel:+917022845849" style="color:#C9963A;">+91 70228 45849</a>.</p>
              <div style="margin:28px 0;padding:20px;background:#f8f5ee;border-left:3px solid #C9963A;border-radius:0 6px 6px 0;">
                <p style="font-size:13px;color:#6b7280;margin:0 0 4px;"><strong style="color:#1c1c1c;">Your enquiry reference:</strong></p>
                <p style="font-size:13px;color:#6b7280;margin:0;">${product || enquiry_type} — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <p style="font-size:14px;color:#6b7280;line-height:1.7;">Warm regards,<br><strong style="color:#1c1c1c;">Rajaansh Industries Pvt. Ltd.</strong><br>Bangalore, Karnataka</p>
            </div>
            <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:16px;">ISO 9001:2015 Certified · rajaansh.com</p>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
