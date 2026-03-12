const https = require("https");

exports.handler = async function(event) {
  // 1. Penanganan CORS (Penting agar web bisa panggil fungsi ini)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  // 2. Ambil Key dan Bersihkan (Trim)
  const API_KEY = (process.env.GEMINI_API_KEY || "").trim();

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API Key tidak terbaca. Pastikan sudah input GEMINI_API_KEY di Netlify." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    // Mengambil pesan terakhir dari array messages
    const userMsg = body.messages?.slice(-1)[0]?.content || "Halo";

    const payload = JSON.stringify({
      contents: [{ parts: [{ text: userMsg }] }]
    });

    // 3. Konfigurasi Request ke Google Gemini v1
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`,

      method: "POST",
      headers: { "Content-Type": "application/json" }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve({
          statusCode: res.statusCode,
          body: data
        }));
      });

      req.on("error", (e) => reject(e));
      req.write(payload);
      req.end();
    });

    const json = JSON.parse(response.body);

    // 4. Jika Google membalas dengan error (Bukan 200 OK)
    if (response.statusCode !== 200) {
      return {
        statusCode: response.statusCode,
        headers,
        body: JSON.stringify({ 
          error: json.error?.message || "Google API Error",
          debug: "Pastikan API Key benar dan project aktif."
        })
      };
    }

    // 5. Ambil teks jawaban
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "AI tidak memberi jawaban.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content: [{ type: "text", text }]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Kesalahan Server: " + err.message })
    };
  }
};
