exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.messages?.[0]?.content || "Hello";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer sk-or-v1-APIKEYLU",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: [
          {
            type: "text",
            text: JSON.stringify(data)
          }
        ]
      })
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        content: [
          { type: "text", text: "ERROR: " + err.message }
        ]
      })
    };
  }
};
