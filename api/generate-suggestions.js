// Vercel Serverless Function - Proxy seguro para OpenAI
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cliente } = req.body;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured in Vercel' });
  }

  const prompt = `Cliente: ${cliente.nome}. Win Rate: ${cliente.win_rate_historico}% caiu para ${cliente.win_rate_recente}%. ${cliente.dias_sem_venda} dias sem venda. Gere 5 sugestões práticas em JSON: [{"titulo":"emoji TÍTULO prazo","descricao":"ação específica"}]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Responda APENAS JSON válido, sem texto adicional' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API error');
    }

    const texto = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';

    const match = texto.match(/\[[\s\S]*\]/);
    if (!match) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    const sugestoes = JSON.parse(match[0]);

    return res.status(200).json({ sugestoes });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return res.status(500).json({ error: error.message });
  }
}
