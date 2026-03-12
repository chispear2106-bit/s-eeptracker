const https = require("https");

exports.handler = async function(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  try {

    const body = JSON.parse(event.body || "{}");
    const userMsg = body.messages?.slice(-1)[0]?.content || "Hello";

    const payload = JSON.stringify({
      contents: [{
        parts: [{ text: userMsg }]
      }]
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };

    const response = await new Promise((resolve, reject) => {

      const req = https.request(options, res => {

        let data = "";

        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));

      });

      req.on("error", reject);
      req.write(payload);
      req.end();

    });

    const json = JSON.parse(response);

    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI tidak memberi jawaban.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [{ type: "text", text }]
      })
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };

  }

};
