// Drží jednu adresu webu: http, www i workers.dev přesměruje na https://tadeas-ujvary.cz, soubory servíruje platforma.
const HOST = "tadeas-ujvary.cz";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!local && (url.protocol !== "https:" || url.hostname !== HOST)) {
      url.protocol = "https:";
      url.hostname = HOST;
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    // Platforma přesměrovává /index.html dočasně (307); pro vyhledávače má být trvale.
    if (res.status === 307) return new Response(null, { status: 301, headers: res.headers });
    return res;
  },
};
