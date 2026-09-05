export default async function handler(req, res) {
  // Header CORS agar bisa dipanggil dari domain mana saja (termasuk GitHub Pages & Localhost)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tangani preflight request HTTP OPTIONS dari browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel.' });
  }

  try {
    const { contents } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const systemInstruction = `Kamu adalah PALOPOTA AI 2.0, Asisten Layanan Publik Cerdas Kota Palopo.
Tugas utama: Memberikan informasi resmi, solutif, dan ramah terkait dokumen kependudukan, perizinan UMKM, bantuan sosial, serta pelayanan publik Pemkot Palopo.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents || [],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error dari Gemini API' });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal memproses permintaan di server backend: ' + error.message });
  }
}
