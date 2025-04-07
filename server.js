import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import xss from 'xss';
import rateLimit from 'express-rate-limit';
import { createAssistant } from './src/createAssistant.js';
import { logMemoryUsage } from './src/memoryReporting.js';
import { main } from './src/index.js';
import { fetchFromS3 } from './src/fetchFromS3.js';
import { uploadFileToOpenAI } from './src/uploadFile.js';

// Load environment variables
dotenv.config();

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Store assistant ID in memory
let assistantId = null;
let fileId = null;

// Initialize assistant
async function initializeAssistant() {
    try {
        // Fetch health data from S3
        const healthData = await fetchFromS3();
        console.log ("fetching completed")
        logMemoryUsage('fetching data');

        // Upload the file to OpenAI
        const file = await uploadFileToOpenAI(healthData);
        fileId = file.id;
        console.log ("uploading file to openai completed")
        logMemoryUsage('uploading file');

        // Create the assistant with the file
        const assistant = await createAssistant();
        assistantId = assistant.id;
        console.log ("creating assistant completed")
        logMemoryUsage('creating assistant');
        
        
    } catch (error) {
        console.error('Failed to initialize assistant:', error);
        process.exit(1);
    }
}

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Apply rate limiting to all routes
app.use(limiter);

// Middleware to parse JSON bodies with size limit
app.use(express.json({ limit: '10kb' }));

// Basic logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        });
    }
    next();
};

// Apply sanitization to all routes
app.use(sanitizeInput);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Chat endpoint with stricter rate limiting
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: {
        error: 'Too many chat requests, please wait a minute before trying again'
    }
});

app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        if (!assistantId) {
            return res.status(500).json({ 
                error: 'Assistant not initialized. Please try again in a moment.' 
            });
        }

        const { message } = req.body;
        
        // Input validation
        if (!message) {
            console.log('Error: Empty message received');
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        if (typeof message !== 'string') {
            console.log('Error: Invalid message type received');
            return res.status(400).json({ 
                error: 'Message must be a string' 
            });
        }

        if (message.length > 1000) {
            console.log('Error: Message too long');
            return res.status(400).json({ 
                error: 'Message is too long (max 1000 characters)' 
            });
        }

        // Set the assistant ID in the environment for the main function
        process.env.ASSISTANT_ID = assistantId;
        process.env.FILE_ID = fileId;
        // Process the message using our existing logic
        console.log('Processing message:', message.substring(0, 50) + '...');
        const response = await main(message);

// Ensure response is a string (React-safe)
let cleanText = '';

        if (typeof response === 'string') {
            cleanText = xss(response);
        } else if (typeof response === 'object' && response !== null) {
            cleanText = xss(JSON.stringify(response, null, 2));
        } else {
            cleanText = 'No response from assistant.';
        }

        res.json({ 
            message: cleanText,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error processing chat message:', error);
        
        // More specific error handling
        if (error.message.includes('API key')) {
            return res.status(500).json({ 
                error: 'Server configuration error: OpenAI API key is not set' 
            });
        }

        res.status(500).json({ 
            error: 'Failed to process message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize assistant and start server
initializeAssistant().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
        console.log('Environment:', process.env.NODE_ENV || 'development');
    });
}); 