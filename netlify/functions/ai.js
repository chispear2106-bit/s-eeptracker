const https = require("https");

exports.handler = async function(event) {
  // Hanya izinkan POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  
  // Cek apakah API Key sudah diset di Netlify
  if (!API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "API Key belum diset di Environment Variables Netlify!" }) 
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    // Ambil pesan terakhir atau default
    const userMsg = body.messages?.[body.messages.length - 1]?.content || "Halo, siapa ini?";

    const payload = JSON.stringify({
      contents: [{ parts: [{ text: userMsg }] }]
    });

    // Menggunakan v1 (Stable) dan model terbaru
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json" }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve({ status: res.statusCode, data }));
      });
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

    const json = JSON.parse(response.data);

    // Cek jika Google mengirim error (misal: API Key salah atau Kuota Habis)
    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: json.error?.message || "Google API Error" })
      };
    }

    const aiResponse = json.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa menjawab itu.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [{ type: "text", text: aiResponse }]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Terjadi kesalahan sistem: " + err.message })
    };
  }
};
