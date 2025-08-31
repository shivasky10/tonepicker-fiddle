const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const MistralClient = require('@mistralai/mistralai').default;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MISTRAL_API_KEY exists:', !!process.env.MISTRAL_API_KEY);

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://yourdomain.com'] 
//     : ['http://localhost:3000'],
//   credentials: true
// }));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://tonepicker-fiddle-frontend.onrender.com"
  ],
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));

let client;
let useMockResponse = false;
try {
  if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY !== 'your_mistral_api_key_here') {
    client = new MistralClient(process.env.MISTRAL_API_KEY);
    console.log('MistralClient initialized successfully with real API key');
  } else {
    useMockResponse = true;
    console.log('Using mock responses (no valid API key provided)');
  }
} catch (error) {
  console.error('Failed to initialize MistralClient:', error.message);
  useMockResponse = true;
  client = null;
}

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const toneMatrix = {
  '0,0': { x: 'formal', y: 'professional', description: 'Very formal and professional' },
  '0,1': { x: 'formal', y: 'neutral', description: 'Formal but neutral' },
  '0,2': { x: 'formal', y: 'casual', description: 'Formal but approachable' },
  '1,0': { x: 'neutral', y: 'professional', description: 'Neutral and professional' },
  '1,1': { x: 'neutral', y: 'neutral', description: 'Balanced and neutral' },
  '1,2': { x: 'neutral', y: 'casual', description: 'Neutral but casual' },
  '2,0': { x: 'casual', y: 'professional', description: 'Casual but professional' },
  '2,1': { x: 'casual', y: 'neutral', description: 'Casual and neutral' },
  '2,2': { x: 'casual', y: 'casual', description: 'Very casual and friendly' }
};

const generateCacheKey = (text, x, y) => {
  return `${text.substring(0, 100)}_${x}_${y}`;
};

const generateMockResponse = (text, tone) => {
  const mockResponses = {
    'Very formal and professional': text.replace(/\b(hello|hi|hey)\b/gi, 'Greetings').replace(/\b(thanks|thank you)\b/gi, 'I appreciate your assistance'),
    'Formal but neutral': text.replace(/\b(hello|hi|hey)\b/gi, 'Hello').replace(/\b(thanks|thank you)\b/gi, 'Thank you'),
    'Formal but approachable': text.replace(/\b(hello|hi|hey)\b/gi, 'Hello there').replace(/\b(thanks|thank you)\b/gi, 'Thank you kindly'),
    'Neutral and professional': text.replace(/\b(hello|hi|hey)\b/gi, 'Hello').replace(/\b(thanks|thank you)\b/gi, 'Thank you'),
    'Balanced and neutral': text,
    'Neutral but casual': text.replace(/\b(hello|hi|hey)\b/gi, 'Hi').replace(/\b(thanks|thank you)\b/gi, 'Thanks'),
    'Casual but professional': text.replace(/\b(hello|hi|hey)\b/gi, 'Hi there').replace(/\b(thanks|thank you)\b/gi, 'Thanks a lot'),
    'Casual and neutral': text.replace(/\b(hello|hi|hey)\b/gi, 'Hey').replace(/\b(thanks|thank you)\b/gi, 'Thanks'),
    'Very casual and friendly': text.replace(/\b(hello|hi|hey)\b/gi, 'Hey there!').replace(/\b(thanks|thank you)\b/gi, 'Thanks so much!')
  };
  
  return mockResponses[tone.description] || text;
};

app.post('/api/adjust-tone', async (req, res) => {
  try {
    const { text, x, y } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (x === undefined || y === undefined || x < 0 || x > 2 || y < 0 || y > 2) {
      return res.status(400).json({ error: 'Invalid tone coordinates' });
    }

    const cacheKey = generateCacheKey(text, x, y);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        adjustedText: cached.result,
        tone: toneMatrix[`${x},${y}`],
        cached: true
      });
    }

    const tone = toneMatrix[`${x},${y}`];
    let adjustedText;

    if (useMockResponse) {
      adjustedText = generateMockResponse(text, tone);
      console.log('Using mock response for tone adjustment');
    } else {
      if (!client) {
        return res.status(500).json({ 
          error: 'MistralClient not initialized. Please check your API key configuration.' 
        });
      }

      const prompt = `Rewrite the following text to have a ${tone.description} tone. Maintain the same meaning and content, but adjust the language style accordingly. Return ONLY the rewritten text without any explanations, quotes, or formatting.

Original text: "${text}"

Rewritten text:`;

      const chatResponse = await client.chat({
        model: 'mistral-small-latest',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 1000
      });

      adjustedText = chatResponse.choices[0].message.content.trim();
      
      adjustedText = adjustedText
        .replace(/^["']|["']$/g, '')
        .replace(/^\*\*.*?\*\*:?\s*/g, '')
        .replace(/^Rewritten text:?\s*/gi, '')
        .replace(/^Certainly!?\s*/gi, '')
        .replace(/^Here is.*?:\s*/gi, '')
        .replace(/^This version.*$/gim, '')
        .replace(/^Good \[.*?\]/gi, 'Good morning')
        .trim();
    }

    cache.set(cacheKey, {
      result: adjustedText,
      timestamp: Date.now()
    });

    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }

    res.json({
      adjustedText,
      tone,
      cached: false,
      mockResponse: useMockResponse
    });

  } catch (error) {
    console.error('Error adjusting tone:', error);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your Mistral API configuration.' 
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to adjust text tone. Please try again.' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cacheSize: cache.size,
    mistralClientInitialized: !!client,
    usingMockResponse: useMockResponse
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

