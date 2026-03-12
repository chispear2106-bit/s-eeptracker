exports.handler = async function(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" })
    };
  }

  try {

    const body = JSON.parse(event.body || "{}");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: body.model || "claude-3-5-sonnet-20241022",
        max_tokens: body.max_tokens || 1000,
        messages: body.messages || [
          { role: "user", content: "Hello" }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }

};
