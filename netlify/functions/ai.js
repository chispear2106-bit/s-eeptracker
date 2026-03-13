const https = require("https");

exports.handler = async function(event) {

  const API_KEY = process.env.OPENROUTER_API_KEY;

  const body = JSON.parse(event.body || "{}");

  const system = body.system || "";
  const userMsg =
    body.messages?.slice(-1)[0]?.content || "halo";

  const payload = JSON.stringify({
    model: "meta-llama/llama-3-8b-instruct",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg }
    ]
  });

  const options = {
    hostname: "openrouter.ai",
    path: "/api/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    }
  };

  const response = await new Promise((resolve) => {

    const req = https.request(options, (res) => {

      let data = "";

      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));

    });

    req.write(payload);
    req.end();

  });

  return {
    statusCode: 200,
    headers:{
      "Access-Control-Allow-Origin":"*",
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      content:[
        {
          type:"text",
          text: response
        }
      ]
    })
  };

};
