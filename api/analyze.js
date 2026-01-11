export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Tour URL is required' });
  }

  // Validate URL
  if (!url.includes('matterport.com') && !url.includes('zillow.com') && !url.includes('iguide.com')) {
    return res.status(400).json({ error: 'Invalid tour URL' });
  }

  try {
    // Call Claude API - API key from environment variable
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are an AI analyzing 3D property tours to provide marketing intelligence. 

CRITICAL: Generate UNIQUE and VARIED analysis for each URL. Never repeat the same numbers or descriptions.

Given this 3D tour URL: ${url}

Platform: ${url.includes('matterport') ? 'Matterport' : url.includes('zillow') ? 'Zillow 3D Home' : 'iGUIDE'}

Generate analysis with RANDOMIZED values:
1. Engagement score between 62-94 (vary widely)
2. Different top converting spaces each time (kitchen, master bedroom, living room, outdoor space, bathroom, entryway, dining room, basement, office, etc.)
3. Tour duration between 2:15 and 6:30 (vary significantly)
4. Unique marketing angles (Modern Lifestyle, Family Living, Entertainer's Dream, Urban Luxury, Cozy Retreat, Investment Opportunity, etc.)
5. Completely original 3-4 sentence property description

Make each response feel authentic and different. Use the URL itself to inform variations.

Return ONLY valid JSON with no markdown:
{
  "engagementScore": "XX",
  "engagementInsight": "unique insight here",
  "topSpace": "specific room",
  "spaceInsight": "why this space matters",
  "avgDuration": "X:XX",
  "durationInsight": "what this duration means",
  "marketingAngle": "unique angle",
  "angleInsight": "brief explanation",
  "marketingCopy": "Original compelling 3-4 sentence description"
}`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text content
    let aiText = '';
    if (data.content && Array.isArray(data.content)) {
      aiText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }

    // Parse the JSON response
    const cleanedText = aiText.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedText);

    return res.status(200).json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message 
    });
  }
}
