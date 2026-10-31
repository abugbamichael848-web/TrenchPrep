// Keeps your API key on the server. Set GROQ_API_KEY in Netlify's environment variables.
exports.handler = async (ev) => {
  if (ev.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };
  let prompt;
  try { prompt = JSON.parse(ev.body).prompt; } catch (e) { return { statusCode: 400, body: 'Bad request' }; }
  if (typeof prompt !== 'string' || !prompt || prompt.length > 6000) return { statusCode: 400, body: 'Bad prompt' };
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.GROQ_API_KEY },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1200
    })
  });
  if (!r.ok) return { statusCode: 502, body: 'AI error' };
  const d = await r.json();
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: d.choices[0].message.content }) };
};
