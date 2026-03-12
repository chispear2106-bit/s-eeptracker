const https = require("https");

exports.handler = async function(event) {

  try {

    const body = JSON.parse(event.body || "{}");

    const system = body.system || "";
    const messages = body.messages || [];

    const payload = JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: system },
        ...messages
      ]
    });

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      }
    };

    const response = await new Promise((resolve) => {

      const req = https.request(options, res => {

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
      json?.choices?.[0]?.message?.content ||
      "AI tidak memberi jawaban.";

    return {
      statusCode: 200,
      headers:{
        "Access-Control-Allow-Origin":"*",
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        content:[{type:"text",text}]
      })
    };

  } catch(err){

    return {
      statusCode:200,
      body: JSON.stringify({
        content:[{type:"text",text:"AI error: "+err.message}]
      })
    };

  }

};
