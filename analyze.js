// Vercel Serverless Function - Analyze 3D Tour
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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are an AI analyzing 3D property tours to provide marketing intelligence. 

Given this 3D tour URL: ${url}

Based on the platform (${url.includes('matterport') ? 'Matterport' : url.includes('zillow') ? 'Zillow 3D Home' : 'iGUIDE'}), generate UNIQUE and VARIED analysis.

IMPORTANT: Make each analysis different by varying:
- Engagement scores between 65-95
- Different top converting spaces based on URL patterns
- Varied durations between 2:30 and 5:45
- Different marketing angles
- Unique property descriptions

Provide:
1. A realistic engagement score (65-95) with brief insight
2. Most likely high-converting space (kitchen/master bedroom/living/outdoor/bathroom/entry/etc) with why
3. Estimated average tour duration (in minutes:seconds format) with insight
4. Primary marketing angle to emphasize based on typical engagement patterns
5. A compelling 3-4 sentence property marketing description that emphasizes engagement-driven selling points

Return ONLY valid JSON in this exact format with no markdown formatting:
{
  "engagementScore": "85",
  "engagementInsight": "Above average - indicates strong property appeal",
  "topSpace": "Kitchen",
  "spaceInsight": "Modern kitchens drive 40% higher engagement",
  "avgDuration": "4:23",
  "durationInsight": "Extended viewing suggests serious buyer interest",
  "marketingAngle": "Lifestyle & Entertaining",
  "angleInsight": "Focus on social spaces and flow",
  "marketingCopy": "Your compelling marketing description here..."
}`
        }]
      })
    });

    if (!response.ok) {
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
