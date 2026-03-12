const https = require("https");

exports.handler = async function(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const API_KEY = process.env.GROQ_API_KEY;

  try {

    const body = JSON.parse(event.body || "{}");

    let userMsg = "Hello";

    if (body.messages && body.messages.length) {
      userMsg = body.messages[body.messages.length - 1].content;
    }

    const payload = JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: userMsg
        }
      ]
    });

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
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
      json?.choices?.[0]?.message?.content ||
      "AI tidak memberi jawaban.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          { type: "text", text }
        ]
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
