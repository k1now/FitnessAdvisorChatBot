# Fitness Advisor ChatBot

A sophisticated AI-powered fitness advisor that leverages Apple Health data to provide personalized workout recommendations and insights. This project demonstrates a complex integration of various technologies and APIs to create a seamless health data analysis system.

## Technical Architecture

### 1. Health Data Integration
- **Challenge**: Apple Health doesn't provide direct web APIs for external applications
- **Solution**: Implemented a bridge app integration
  - Used a third-party app to export Apple Health data
  - Configured automatic CSV export of workout history
  - Set up one-time data export (can be configured for daily exports with paid plans)

### 2. Server Infrastructure
- **Public URL Server**: Built to receive health data exports
- **Data Flow**:
  1. Bridge app sends workout history to public URL
  2. Server receives CSV data
  3. Data is automatically pushed to AWS S3 bucket
  4. S3 serves as persistent storage for health data

### 3. OpenAI Integration
- **Dynamic Data Loading**: Each conversation starts fresh with latest health data
- **Process Flow**:
  1. Retrieves latest export from S3
  2. Uploads to OpenAI server
  3. Uses OpenAI's Assistant API to analyze CSV data
  4. Processes user queries against health data

### 4. Conversation Management
- **Challenge**: OpenAI Thread API limitations with conversation history
- **Solution**: Implemented custom conversation management
  - Maintains conversation history in memory
  - Formats history for each new request
  - Injects conversation context into assistant instructions
  - Ensures continuity across interactions

## Technical Stack

- **Frontend**: React-based UI with modular components
- **Backend**: Node.js/Express server
- **Cloud Storage**: AWS S3
- **AI Processing**: OpenAI GPT-4 Turbo
- **Data Format**: CSV (Apple Health export)

## Key Features

- Real-time health data analysis
- Personalized workout recommendations
- Contextual conversation handling
- Memory-efficient data processing
- Secure data handling and storage

## Project Structure

```
├── public/                 # Frontend components
│   ├── components/        # React components
│   ├── styles.css        # Styling
│   └── index.html        # Main HTML
├── src/                  # Backend source
│   ├── index.js         # Main application logic
│   ├── createThread.js  # Thread management
│   ├── runAssistant.js  # Assistant execution
│   └── ...              # Other utility modules
└── server.js            # Express server
```

## Technical Challenges Overcome

1. **Health Data Access**
   - Solved Apple Health API limitations through bridge app
   - Implemented reliable data export mechanism

2. **Data Synchronization**
   - Built robust server with public URL
   - Established secure S3 integration
   - Implemented efficient data retrieval system

3. **AI Integration**
   - Leveraged OpenAI's Assistant API for CSV analysis
   - Implemented custom conversation management
   - Optimized data processing for each interaction

4. **Conversation History**
   - Developed workaround for Thread API limitations
   - Implemented in-memory history management
   - Created context injection system

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   OPENAI_API_KEY=your_key
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_key
   AWS_REGION=your_region
   S3_BUCKET=your_bucket
   ```
4. Start the server: `node server.js`

## Future Enhancements

- Implement daily automated health data exports
- Add more sophisticated data analysis
- Enhance conversation context management
- Implement user authentication
- Add workout tracking and progress monitoring


![image](https://github.com/user-attachments/assets/13dcace4-8910-4397-b312-4feff0df8b6a)


MIT License 
