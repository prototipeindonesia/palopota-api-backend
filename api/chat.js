export default async function handler(req, res) {
  // Izinkan akses CORS agar dapat dipanggil dari GitHub Pages Anda
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ambil API Key dari Environment Variable Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key server belum dikonfigurasi.' });
  }

  const { contents } = req.body;
  const systemInstruction = `Kamu adalah PALOPOTA AI 2.0, Asisten Layanan Publik Cerdas Kota Palopo.
Tugas utama: Memberikan informasi resmi, solutif, dan ramah terkait dokumen kependudukan, perizinan UMKM, bantuan sosial, serta pelayanan publik Pemkot Palopo.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Gagal menghubungkan ke layanan Gemini AI.' });
  }
}
