/**
 * Ribyon Studios — Brevo email templates & sender
 *
 * Emails styled to the actual Ribyon brand ("Ink & Ember"):
 *   - warm paper page (#efebe2), white floating card (14px radius)
 *   - dark ink hero band (#0a0908) carrying the orange RIBYON wordmark
 *     (the brand logo is neon-orange on transparent — designed for dark)
 *   - gold STUDIOS lockup, orange eyebrow, Syne display headline
 *   - Sora body copy, orange accent bar, pill button, hairline rows
 *   - clean footer with wordmark, tagline and contact
 *
 * Sending uses the Brevo transactional API:
 *   POST https://api.brevo.com/v3/smtp/email
 *   Header: api-key: <BREVO_API_KEY>
 */

const BRAND = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  gold: '#fbbf24',
  paper: '#efebe2',
  card: '#ffffff',
  ink: '#0a0908',
  inkSoft: '#11100e',
  text: '#3a3730',
  sub: '#7d786e',
  faint: '#a39e94',
  line: 'rgba(0,0,0,0.07)',
  border: '#e5e0d6',
  fontBody: "'Sora', 'Segoe UI', Tahoma, Arial, sans-serif",
  fontDisplay: "'Syne', 'Arial Black', 'Segoe UI', Tahoma, Arial, sans-serif",
  studio: 'Ribyon Studios',
  tagline: 'Brand direction &amp; design &middot; built in Nairobi, for the world',
  siteUrl: 'https://ribyon-studios.vercel.app',
};

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function money(v, currency) {
  const n = parseFloat(v);
  if (isNaN(n)) return (currency || 'KSh') + ' 0';
  return (currency || 'KSh') + ' ' + n.toLocaleString('en-KE');
}
function fmtDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
const B = {
  h1: 'margin:0 0 6px;font-size:18px;font-weight:700;color:' + BRAND.ink + ';font-family:' + BRAND.fontBody,
  p: 'margin:0 0 22px;font-size:14px;color:' + BRAND.text + ';line-height:1.75;font-family:' + BRAND.fontBody,
  body: 'margin:0;font-size:14px;color:' + BRAND.ink + ';line-height:1.75;font-family:' + BRAND.fontBody,
};

// Shared responsive shell — matches newsletter popup: white card, warm gradient header, envelope, pill button
function shell({ preHeader, eyebrow, title, subtitle, bodyHTML, cta }) {
  // Email-safe envelope — pure SVG, no divs
  var envelopeSVG =
    '<table cellpadding="0" cellspacing="0" border="0" align="center" width="120" style="margin:0 auto 6px"><tr>' +
    '<td align="center" height="100" style="line-height:0;font-size:0">' +
    '<svg width="108" height="90" viewBox="0 0 108 90" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="envB" x1="0" y1="0" x2="108" y2="90" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0%" stop-color="#ff9a3c"/><stop offset="100%" stop-color="#f97316"/></linearGradient>' +
    '<linearGradient id="envF" x1="0" y1="0" x2="108" y2="40" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0%" stop-color="#ffb870"/><stop offset="100%" stop-color="#f97316" stop-opacity="0.75"/></linearGradient>' +
    '</defs>' +
    '<ellipse cx="54" cy="86" rx="44" ry="6" fill="#f97316" opacity="0.18"/>' +
    '<rect x="0" y="20" width="108" height="66" rx="10" fill="url(#envB)"/>' +
    '<path d="M0 86 L54 58 L108 86 Z" fill="#dc6a0a" opacity="0.38"/>' +
    '<path d="M0 20 Q5 6 11 3 L54 30 L97 3 Q103 6 108 20 Z" fill="url(#envF)"/>' +
    '<line x1="0" y1="86" x2="46" y2="60" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
    '<line x1="108" y1="86" x2="62" y2="60" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
    '</svg></td></tr></table>';

  var ctaHTML = cta
    ? '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 6px"><tr><td align="center">' +
      '<a href="' + esc(cta.href) + '" style="display:inline-block;background:#f97316;color:#0a0908;text-decoration:none;padding:16px 52px;border-radius:50px;font-size:15px;font-weight:800;letter-spacing:0.01em;font-family:' + BRAND.fontBody + ';mso-padding-alt:0;white-space:nowrap">' +
      '<!--[if mso]><i style="letter-spacing:26px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->' +
      esc(cta.label) + ' \u2192' +
      '<!--[if mso]><i style="letter-spacing:26px;mso-font-width:-100%">&nbsp;</i><![endif]-->' +
      '</a></td></tr></table>'
    : '';

  var noteText = (cta && cta.note) || 'Questions? Just reply to this email.';

  return '<!DOCTYPE html><html lang="en" xmlns:v="urn:schemas-microsoft-com:vml"><head>' +
    '<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' +
    '<meta name="x-apple-disable-message-reformatting"/>' +
    '<title>' + esc(title || 'Ribyon Studios') + '</title>' +
    '<style>' +
    'body,table,td,p,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}' +
    'table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}' +
    '@media only screen and (max-width:600px){' +
    '.ew{padding:16px 8px!important}' +
    '.ec{border-radius:20px!important}' +
    '.eh{padding:36px 24px 16px!important}' +
    '.eb{padding:8px 24px 36px!important}' +
    '}' +
    '</style>' +
    '</head>' +
    '<body style="margin:0;padding:0;background:#f0ece4;font-family:' + BRAND.fontBody + ';-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">' +
    '<span style="display:none;font-size:1px;color:#f0ece4;mso-hide:all;max-height:0;overflow:hidden">' + esc(preHeader || title) + '&#847;</span>' +

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="ew" style="background:#f0ece4;padding:40px 16px">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px">' +

    // White rounded card
    '<tr><td class="ec" style="background:#ffffff;border-radius:28px;overflow:hidden">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +

    // Warm gradient header
    '<tr><td class="eh" bgcolor="#fff8f3" style="background:#fff8f3;padding:44px 40px 16px;text-align:center">' +
    envelopeSVG +
    '</td></tr>' +

    // Content
    '<tr><td class="eb" align="center" style="padding:8px 40px 44px;text-align:center">' +
    (eyebrow ? '<p style="margin:0 0 12px;font-family:' + BRAND.fontBody + ';font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#f97316">' + esc(eyebrow) + '</p>' : '') +
    '<h1 style="margin:0 0 12px;font-family:' + BRAND.fontBody + ';font-size:26px;font-weight:800;color:#0a0908;letter-spacing:-0.02em;line-height:1.2">' + title + '</h1>' +
    (subtitle ? '<p style="margin:0 0 4px;font-family:' + BRAND.fontBody + ';font-size:15px;color:#7d786e;line-height:1.65">' + subtitle + '</p>' : '') +
    '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="height:16px;font-size:0">&nbsp;</td></tr></table>' +
    bodyHTML +
    ctaHTML +
    '<p style="margin:14px 0 0;font-family:' + BRAND.fontBody + ';font-size:12px;color:#a39e94">' + noteText + '</p>' +
    '</td></tr>' +

    // Footer
    '<tr><td align="center" style="border-top:1px solid rgba(0,0,0,0.06);padding:18px 40px 24px">' +
    '<p style="margin:0 0 4px;font-family:' + BRAND.fontBody + ';font-size:13px;font-weight:700;color:#0a0908"><span style="color:#f97316">Ribyon</span> Studios</p>' +
    '<p style="margin:0;font-family:' + BRAND.fontBody + ';font-size:11px;color:#a39e94;line-height:1.6">' + BRAND.tagline + '<br><a href="' + BRAND.siteUrl + '" style="color:#f97316;text-decoration:none">ribyonstudios.com</a></p>' +
    '</td></tr>' +

    '</table></td></tr>' +
    '</table></td></tr></table>' +
    '</body></html>';
}

  const ctaHTML = cta
    ? '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 4px"><tr><td align="center">' +
      '<a href="' + esc(cta.href) + '" style="display:inline-block;background:' + BRAND.orange + ';color:#0a0908;text-decoration:none;padding:16px 48px;border-radius:999px;font-size:15px;font-weight:800;letter-spacing:0.01em;font-family:' + BRAND.fontBody + '">' + esc(cta.label) + ' \u2192</a>' +
      '</td></tr></table>'
    : '';

  const noteText = (cta && cta.note) || 'Questions? Just reply to this email.';

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>' +
    '<meta name="x-apple-disable-message-reformatting"/>' +
    '<title>' + esc(title || 'Ribyon Studios') + '</title>' +
    '<style>@media only screen and (max-width:600px){.ew{padding:16px 8px!important}.ec{border-radius:20px!important}.eb{padding:28px 20px 32px!important}}</style>' +
    '</head>' +
    '<body style="margin:0;padding:0;background:#f0ece4;font-family:' + BRAND.fontBody + ';-webkit-text-size-adjust:100%">' +
    '<span style="display:none;font-size:1px;color:#f0ece4;mso-hide:all;opacity:0;max-height:0;overflow:hidden">' + esc(preHeader || title) + '</span>' +

    // Outer
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" class="ew" style="background:#f0ece4;padding:36px 16px">' +
    '<tr><td align="center">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px">' +

    // Card
    '<tr><td class="ec" bgcolor="#ffffff" style="background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 56px rgba(0,0,0,0.1)">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +

    // Top gradient background + envelope
    '<tr><td bgcolor="#fff8f3" style="background:linear-gradient(160deg,#fff8f3 0%,#ffffff 60%);padding:44px 40px 16px;text-align:center">' +
    envelopeSVG +
    '</td></tr>' +

    // Content
    '<tr><td class="eb" align="center" style="padding:8px 40px 44px;text-align:center">' +
    (eyebrow ? '<p style="margin:0 0 12px;font-family:' + BRAND.fontBody + ';font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:' + BRAND.orange + '">' + esc(eyebrow) + '</p>' : '') +
    '<h1 style="margin:0 0 12px;font-family:' + BRAND.fontBody + ';font-size:26px;font-weight:800;color:#0a0908;letter-spacing:-0.03em;line-height:1.2">' + title + '</h1>' +
    (subtitle ? '<p style="margin:0 0 6px;font-family:' + BRAND.fontBody + ';font-size:15px;color:' + BRAND.sub + ';line-height:1.6">' + subtitle + '</p>' : '') +
    '<div style="height:20px;font-size:0">&nbsp;</div>' +
    bodyHTML +
    ctaHTML +
    '<p style="margin:16px 0 0;font-family:' + BRAND.fontBody + ';font-size:12px;color:' + BRAND.faint + '">' + noteText + '</p>' +
    '</td></tr>' +

    // Footer inside card
    '<tr><td style="border-top:1px solid rgba(0,0,0,0.06);padding:18px 40px 24px;text-align:center">' +
    '<p style="margin:0 0 4px;font-family:' + BRAND.fontBody + ';font-size:13px;font-weight:700;color:#0a0908"><span style="color:' + BRAND.orange + '">Ribyon</span> Studios</p>' +
    '<p style="margin:0;font-family:' + BRAND.fontBody + ';font-size:11px;color:' + BRAND.faint + ';line-height:1.6">' + BRAND.tagline + '<br>' +
    '<a href="' + BRAND.siteUrl + '" style="color:' + BRAND.orange + ';text-decoration:none">ribyonstudios.com</a></p>' +
    '</td></tr>' +

    '</table></td></tr>' +
    // END CARD

    '</table></td></tr></table>' +
    '</body></html>';
}

function greeting(name) {
  return '<p style="margin:0 0 16px;font-family:' + BRAND.fontBody + ';font-size:15px;font-weight:700;color:' + BRAND.ink + ';text-align:center">Hi ' + esc(name) + ',</p>';
}
function para(html) {
  return '<p style="margin:0 0 16px;font-family:' + BRAND.fontBody + ';font-size:14px;color:' + BRAND.text + ';line-height:1.75;text-align:center">' + html + '</p>';
}
// info rows: [[label, valueHTML], ...]
function infoCard(rows) {
  const parts = [];
  for (let i = 0; i < rows.length; i++) {
    const x = rows[i];
    parts.push('<tr>' +
      '<td style="font-size:13px;color:' + BRAND.sub + ';padding:11px 0;width:120px;vertical-align:top;font-family:' + BRAND.fontBody + '">' + esc(x[0]) + '</td>' +
      '<td style="font-size:14px;color:' + BRAND.ink + ';font-weight:600;padding:11px 0;word-break:break-word;font-family:' + BRAND.fontBody + '">' + x[1] + '</td></tr>');
    if (i < rows.length - 1) parts.push('<tr><td colspan="2" style="border-top:1px solid ' + BRAND.line + ';padding:0;height:1px;font-size:0;line-height:0">&nbsp;</td></tr>');
  }
  return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 4px">' + parts.join('') + '</table>';
}
// line items table for invoices: [{desc, amount}]
function itemsTable(items, currency) {
  if (!items || !items.length) return '';
  const rows = items.map(function (i) {
    return '<tr>' +
      '<td style="font-family:' + BRAND.fontBody + ';font-size:13.5px;padding:11px 0;color:' + BRAND.ink + '">' + esc(i.desc || i.name || '') + '</td>' +
      '<td align="right" style="font-family:' + BRAND.fontBody + ';font-size:13.5px;padding:11px 0;color:' + BRAND.ink + ';font-weight:700">' + money(i.amount, currency) + '</td></tr>' +
      '<tr><td colspan="2" style="border-top:1px solid ' + BRAND.line + ';height:1px;font-size:0;line-height:0;padding:0">&nbsp;</td></tr>';
  }).join('');
  return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px">' +
    '<tr><td style="padding:0 0 8px;border-bottom:1px solid ' + BRAND.border + ';font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:' + BRAND.faint + ';font-family:' + BRAND.fontBody + ';font-weight:600">Item</td>' +
    '<td align="right" style="padding:0 0 8px;border-bottom:1px solid ' + BRAND.border + ';font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:' + BRAND.faint + ';font-family:' + BRAND.fontBody + ';font-weight:600">Amount</td></tr>' +
    rows + '</table>';
}

// ── scenarios ──────────────────────────────────────────────────────────────

// 1. generic / test
function genericScenario(v) {
  const rows = v.rows || [];
  return {
    subject: v.subject || 'Message from Ribyon Studios',
    eyebrow: v.eyebrow || 'Updates',
    subtitle: v.subtitle,
    bodyHTML: greeting(v.toName || 'there') + para(v.message || '') + (rows.length ? infoCard(rows) : ''),
    cta: v.cta,
  };
}

// 2. lead / inquiry (to studio)
function leadScenario(v) {
  const name = v.name || 'New inquiry';
  const rows = [
    ['Name', v.name], ['Email', v.email], ['Company', v.company],
    ['Service', v.service], ['Budget', v.budget], ['Date', v.date],
  ].filter(x => x[1]);
  return {
    subject: 'New lead: ' + esc(name),
    eyebrow: 'New Lead',
    title: 'A lead just came through',
    subtitle: 'Follow up while it\u2019s warm.',
    bodyHTML: para('A new inquiry just arrived on the Ribyon site.') + infoCard(rows) +
      (v.message ? '<p style="' + B.body + ';border-left:3px solid ' + BRAND.orange + ';padding:12px 16px;background:' + BRAND.paper + '"><b>Message:</b> ' + esc(v.message) + '</p>' : ''),
    cta: { href: v.cmsUrl || 'https://ribyon-cms.vercel.app', label: 'Open in CMS' },
  };
}

// 3. invoice issued (to client)
function invoiceScenario(v) {
  return {
    subject: 'Invoice ' + (v.number || '') + ' from Ribyon Studios — ' + money(v.total, v.currency),
    eyebrow: 'Invoice ' + (v.number || ''),
    title: 'You have a new invoice',
    subtitle: (v.clientName || ''),
    bodyHTML: greeting(v.clientName || 'there') +
      para('Here are the details for invoice <b>' + esc(v.number || '') + '</b>.') +
      itemsTable(v.items, v.currency) +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
      '<td style="padding:14px 0 4px;border-top:2px solid ' + BRAND.ink + ';font-family:' + BRAND.fontBody + ';font-size:13px;color:' + BRAND.ink + ';font-weight:700">Total due</td>' +
      '<td align="right" style="padding:14px 0 4px;border-top:2px solid ' + BRAND.ink + ';font-family:' + BRAND.fontDisplay + ';font-size:22px;font-weight:800;color:' + BRAND.orangeDark + '">' + money(v.total, v.currency) + '</td></tr>' +
      '<tr><td style="padding:4px 0 0;font-family:' + BRAND.fontBody + ';font-size:12px;color:' + BRAND.sub + '">Due ' + fmtDate(v.dueDate) + '</td></tr></table>' +
      para('Need changes? Reply to this email and we&rsquo;ll sort it out. You can also track everything from your client portal.'),
    cta: { href: v.payUrl || 'https://ribyon-portal.vercel.app', label: 'View &amp; pay invoice' },
  };
}

// 4. payment received (receipt)
function paymentScenario(v) {
  const bal = parseFloat(v.balance);
  return {
    subject: 'Receipt for invoice ' + (v.number || '') + ' — Ribyon Studios',
    eyebrow: 'Payment Received',
    title: 'Thank you for your payment',
    subtitle: money(v.amount, v.currency),
    bodyHTML: greeting(v.clientName || 'there') +
      para('Your payment has landed. Here is your receipt.') +
      infoCard([
        ['Invoice', esc(v.number || '—')],
        ['Amount paid', money(v.amount, v.currency)],
        ['Method', v.method || '—'],
        ['Paid on', fmtDate(v.paidAt || v.date)],
        ['Balance', (bal && bal > 0) ? money(bal, v.currency) : 'Paid in full'],
      ]) +
      para('Thank you for working with Ribyon Studios. Your project continues in the client portal.'),
    cta: { href: 'https://ribyon-portal.vercel.app', label: 'Open client portal' },
  };
}

// 5. payment reminder / overdue (to client)
function reminderScenario(v) {
  const overdue = v.overdue === true || (v.daysLate || 0) > 0;
  return {
    subject: 'Reminder: Invoice ' + (v.number || '') + ' — ' + money(v.total, v.currency),
    eyebrow: overdue ? 'Payment Overdue' : 'Invoice Due Soon',
    title: overdue ? 'This invoice is overdue' : 'Your invoice is due soon',
    subtitle: 'Invoice ' + esc(v.number || ''),
    bodyHTML: greeting(v.clientName || 'there') +
      para('Just a friendly reminder that invoice <b>' + esc(v.number || '') + '</b> for <b>' + money(v.total, v.currency) + '</b> was due on ' + fmtDate(v.dueDate) + (overdue && v.daysLate ? ' &mdash; ' + v.daysLate + ' day(s) ago.' : '.') + '</p>') +
      infoCard([
        ['Invoice', esc(v.number || '—')],
        ['Amount', money(v.total, v.currency)],
        ['Due date', fmtDate(v.dueDate)],
      ]) +
      para('If payment has already been sent, kindly ignore this reminder. Otherwise you can settle from the client portal.'),
    cta: { href: v.payUrl || 'https://ribyon-portal.vercel.app', label: 'Pay now', note: 'Payment link expires in 7 days.' },
  };
}

// 6. portal invite (to client)
function inviteScenario(v) {
  return {
    subject: 'Your private portal with Ribyon Studios',
    eyebrow: 'Client Portal',
    title: 'Welcome to your client portal',
    subtitle: 'Ribyon Studios',
    bodyHTML: greeting(v.clientName || v.name || 'there') +
      para('Ribyon Studios has created a private portal for you. In it you can follow your project, download files, chat with the team, view invoices and approve work — all in one place.') +
      infoCard([
        ['Client', v.clientName || '—'],
        ['Project', esc(v.projectName || '—')],
      ]) +
      para('Click below to accept the invitation and set your account password.'),
    cta: { href: v.inviteUrl, label: 'Accept invitation', note: 'This link expires in 7 days.' },
  };
}

// 7. project update (to client)
function projectUpdateScenario(v) {
  return {
    subject: (v.projectName ? 'Update on ' : '') + (v.projectName || 'your project'),
    eyebrow: 'Project Update',
    title: 'Update on ' + (v.projectName || 'your project'),
    subtitle: v.status || 'New update',
    bodyHTML: greeting(v.clientName || 'there') +
      (v.message ? para(v.message) : '') +
      (v.milestone ? para('Next milestone: <b>' + esc(v.milestone) + '</b> &mdash; ' + fmtDate(v.milestoneDate)) : ''),
    cta: { href: 'https://ribyon-portal.vercel.app', label: 'Open project' },
  };
}

// 8. milestone / approval (to client)
function approvalScenario(v) {
  const approved = v.approved === true;
  return {
    subject: approved ? 'Milestone approved' : 'Please review: ' + esc(v.item || 'new deliverable'),
    eyebrow: 'Milestone',
    title: approved ? 'Milestone approved' : 'Awaiting your approval',
    subtitle: v.item || 'Deliverable',
    bodyHTML: greeting(v.clientName || 'there') +
      para(approved
        ? 'Thank you for approving <b>' + esc(v.item || 'the latest milestone') + '</b>. The team has been notified and work continues.'
        : '<b>' + esc(v.item || 'A new deliverable') + '</b> is ready for your review. Take a look and confirm it&rsquo;s good to go — or request changes.') +
      infoCard([
        ['Item', esc(v.item || '—')],
        ['Project', esc(v.projectName || '—')],
        ['Status', approved ? 'Approved' : 'Pending review'],
      ]),
    cta: { href: 'https://ribyon-portal.vercel.app', label: 'Open client portal' },
  };
}

// 9. complaint / support reply (to client)
function complaintScenario(v) {
  return {
    subject: 'Complaint received — ' + (v.ticket || 'Ribyon Studios'),
    eyebrow: 'Support',
    title: 'We\u2019ve received your feedback',
    subtitle: v.ticket ? 'Ref ' + esc(v.ticket) : '',
    bodyHTML: greeting(v.clientName || v.name || 'there') +
      para('Thank you for reaching out. We take feedback seriously and are already looking into your message.') +
      infoCard([['Reference', esc(v.ticket || '—')], ['Submitted', fmtDate(v.date)]]),
    cta: { href: 'https://ribyon-portal.vercel.app', label: 'Open client portal' },
  };
}

const SCENARIOS = {
  generic: genericScenario,
  lead: leadScenario,
  invoice: invoiceScenario,
  payment: paymentScenario,
  reminder: reminderScenario,
  invite: inviteScenario,
  project: projectUpdateScenario,
  approval: approvalScenario,
  complaint: complaintScenario,
};

function buildEmail(scenario, params) {
  const fn = SCENARIOS[scenario] || genericScenario;
  const built = fn(params || {});
  const html = shell({
    eyebrow: built.eyebrow || 'Ribyon Studios',
    title: built.title || (built.subject || 'Ribyon Studios'),
    subtitle: built.subtitle,
    bodyHTML: built.bodyHTML || '',
    cta: built.cta,
  });
  return { subject: built.subject || 'Ribyon Studios', html: html, cta: built.cta };
}

// Brevo transactional send.
async function sendBrevo(env, { to, toName, subject, html, text, replyTo, tags, attachments }) {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return { ok: false, status: 503, body: { message: 'Email not configured (BREVO_API_KEY missing)' } };
  const payload = {
    sender: { name: env.EMAIL_FROM_NAME || 'Ribyon Studios', email: env.EMAIL_FROM || 'ribyonstudios@gmail.com' },
    to: toName ? [{ email: to, name: toName }] : [{ email: to }],
    subject: String(subject || 'Message from Ribyon Studios').slice(0, 300),
    htmlContent: html,
    textContent: text || undefined,
  };
  if (replyTo) payload.replyTo = { email: replyTo };
  if (tags && tags.length) payload.tags = tags;
  if (attachments && attachments.length) payload.attachment = attachments;
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await r.json().catch(function () { return {}; });
  return { ok: r.ok, status: r.status, body: body };
}

export { BRAND, buildEmail, sendBrevo, money, fmtDate, esc, SCENARIOS };
