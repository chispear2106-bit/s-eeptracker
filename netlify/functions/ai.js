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

    const system = body.system || "";
    const userMsg =
      body.messages?.[body.messages.length - 1]?.content ||
      "halo";

    const prompt = system + "\n\n" + userMsg;

    const payload = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };

    const response = await new Promise((resolve) => {

      const req = https.request(options, (res) => {

        let data = "";

        res.on("data", chunk => data += chunk);
        res.on("end", () => resolve(data));

      });

      req.on("error", () => resolve("{}"));
      req.write(payload);
      req.end();

    });

    const json = JSON.parse(response);

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
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
      statusCode: 200,
      body: JSON.stringify({
        content: [{ type: "text", text: "AI error: " + err.message }]
      })
    };

  }

};
