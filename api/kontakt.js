/**
 * Poptávkový formulář — Vercel Serverless Function.
 *
 * Nepotřebuje žádné npm balíčky ani package.json — jen nativní fetch (Node 18+).
 * Odesílá přes Resend (https://resend.com) — free tier 3 000 e-mailů měsíčně.
 *
 * Nastav ve Vercelu (Settings → Environment Variables):
 *   RESEND_API_KEY   povinné, klíč z resend.com
 *   MAIL_TO          kam chodí notifikace       (výchozí: taujvyk@gmail.com)
 *   MAIL_FROM        odesílatel                 (výchozí: onboarding@resend.dev)
 *
 * MAIL_FROM na "poptavka@tadeas-ujvary.cz" přepni až po ověření domény v Resendu.
 * Dokud běží onboarding@resend.dev, autoodpověď zákazníkovi Resend zahodí —
 * notifikace tobě chodí dál a formulář hlásí úspěch.
 */

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const send = (key, payload) => fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('Chybí RESEND_API_KEY');
    return res.status(500).json({ error: 'Server není nastavený' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { jmeno = '', email = '', telefon = '', typ = '', zprava = '', web = '' } = body;

  // honeypot — boti vyplní skryté pole; tvař se úspěšně a zahoď
  if (web.trim()) return res.status(200).json({ ok: true });

  if (!jmeno.trim() || !zprava.trim()) {
    return res.status(400).json({ error: 'Chybí jméno nebo zpráva' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'Neplatný e-mail' });
  }
  if (zprava.length > 5000 || jmeno.length > 200) {
    return res.status(400).json({ error: 'Příliš dlouhý vstup' });
  }

  const to = process.env.MAIL_TO || 'taujvyk@gmail.com';
  const from = process.env.MAIL_FROM || 'onboarding@resend.dev';

  // 1) notifikace mně — tahle musí projít
  const notify = await send(key, {
    from: `Poptávka z webu <${from}>`,
    to: [to],
    reply_to: email,
    subject: `Poptávka: ${jmeno}${typ ? ` — ${typ}` : ''}`,
    html: `
      <h2 style="font:600 18px system-ui;margin:0 0 16px">Nová poptávka z tadeas-ujvary.cz</h2>
      <table style="font:14px system-ui;border-collapse:collapse">
        <tr><td style="padding:4px 16px 4px 0;color:#666">Jméno</td><td>${esc(jmeno)}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#666">E-mail</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#666">Telefon</td><td>${esc(telefon) || '—'}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;color:#666">Typ</td><td>${esc(typ) || '—'}</td></tr>
      </table>
      <p style="font:14px system-ui;white-space:pre-wrap;margin-top:20px;padding-top:16px;border-top:1px solid #eee">${esc(zprava)}</p>
    `
  });

  if (!notify.ok) {
    console.error('Resend notifikace selhala:', await notify.text());
    return res.status(502).json({ error: 'E-mail se nepodařilo odeslat' });
  }

  // 2) autoodpověď zákazníkovi — když selže, poptávku už mám, takže nevadí
  let autoreply = false;
  try {
    const auto = await send(key, {
      from: `Tadeáš Ujváry <${from}>`,
      to: [email],
      reply_to: to,
      subject: 'Vaše poptávka dorazila',
      html: `
        <div style="font:15px/1.6 system-ui;color:#14110F;max-width:520px">
          <p>Dobrý den,</p>
          <p>vaše poptávka mi dorazila a ozvu se do 24 hodin. Tenhle e-mail
             odeslala automatizace — přesně ta věc, kterou stavím firmám vedle webů.</p>
          <p style="padding:14px 16px;background:#F4F2EE;border-radius:8px;white-space:pre-wrap">${esc(zprava)}</p>
          <p>Kdyby to spěchalo, volejte rovnou na +420 723 065 427.</p>
          <p style="margin-top:24px">Tadeáš Ujváry<br>
             <a href="https://tadeas-ujvary.cz" style="color:#B4502C">tadeas-ujvary.cz</a></p>
        </div>
      `
    });
    if (auto.ok) autoreply = true;
    else console.warn('Autoodpověď neodešla:', await auto.text());
  } catch (e) {
    console.warn('Autoodpověď selhala:', e.message);
  }

  // autoreply=false → web zákazníkovi neslíbí potvrzení, které nedorazilo
  return res.status(200).json({ ok: true, autoreply });
};
