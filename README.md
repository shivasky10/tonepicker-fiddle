# Tone Picker Text Tool

A modern web application that allows users to adjust the tone of their text using AI-powered precision. Built with React frontend and Node.js backend, integrating with Mistral AI API for intelligent tone adjustments.

![Tone Picker Demo](https://img.shields.io/badge/Status-Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Mistral AI](https://img.shields.io/badge/Mistral%20AI-API-orange)

## Features

- **Text Editor**: Rich text editing with real-time character and word count
- **3x3 Tone Matrix**: Interactive picker for adjusting text tone across 9 different styles
- **AI-Powered Adjustments**: Integration with Mistral AI for intelligent tone transformation
- **Undo/Redo System**: Complete revision history with smooth navigation
- **Text Selection**: Select specific portions of text for targeted tone adjustment
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Feedback**: Loading states, success messages, and error handling
- **Smooth Animations**: Framer Motion powered interactions
- **Local Storage**: Automatic saving of text and revision history
- **Modern UI**: Glassmorphism design with beautiful gradients
- **API Caching**: Intelligent caching to reduce API calls and improve performance
- **Error Handling**: Comprehensive error handling for network and API issues
- **Security**: Rate limiting, input validation, and secure API key management

  
**Project Screenshot** <img width="1156" height="683" alt="Screenshot 2025-08-31 211914" src="https://github.com/user-attachments/assets/28d16600-40d0-4ece-9887-6b1a6fa65eca" />

**Live demo:** https://tonepicker-fiddle-frontend.onrender.com/ — (Hosted on Render free tier; may take a few seconds to wake).





## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mistral AI API key ([Get one here](https://console.mistral.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tonepicker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp server/env.example server/.env
   
   # Edit the .env file and add your Mistral API key
   MISTRAL_API_KEY=your_mistral_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Basic Workflow

1. **Enter Text**: Type or paste your text in the editor on the left
2. **Select Text**: Highlight the portion you want to adjust
3. **Choose Tone**: Click on any cell in the 3x3 matrix on the right
4. **Review Changes**: The selected text will be transformed to match your chosen tone
5. **Undo/Redo**: Use the control buttons to navigate through your revision history

### Tone Matrix Guide

The 3x3 matrix represents different tone combinations:

| | **Casual** | **Neutral** | **Formal** |
|---|---|---|---|
| **Professional** | Friendly Professional | Balanced Professional | Very Formal & Professional |
| **Neutral** | Informal but Clear | Balanced & Neutral | Professional but Approachable |
| **Casual** | Very Casual & Friendly | Relaxed but Clear | Respectful but Friendly |

### Controls

- **Undo**: Revert to the previous version
- **Redo**: Restore a previously undone change
- **Reset**: Clear all text and history
- **Reset (Tone Picker)**: Return to neutral tone (center position)

## Architecture

### Frontend (React)
```
client/
├── src/
│   ├── components/
│   │   ├── TextEditor.js      # Text editing component
│   │   └── TonePicker.js      # 3x3 tone matrix
│   ├── services/
│   │   └── api.js            # API communication
│   ├── utils/
│   │   └── storage.js        # Local storage utilities
│   ├── App.js                # Main application component
│   └── index.js              # Entry point
```

### Backend (Node.js/Express)
```
server/
├── index.js                  # Main server file
├── package.json             # Backend dependencies
└── env.example              # Environment variables template
```

### Key Technologies
- **Frontend**: React 18, Styled Components, Framer Motion
- **Backend**: Express.js, Mistral AI SDK
- **State Management**: React Hooks with useCallback optimization
- **Styling**: CSS-in-JS with glassmorphism design
- **API**: RESTful API with caching and error handling

## Technical Architecture

### Technical Decisions and Trade-offs

#### 1. **State Management Approach**
**Decision**: Used React Hooks (useState, useCallback) instead of Redux or Context API
**Rationale**: 
- **Simplicity**: The application state is relatively simple and doesn't require complex state management
- **Performance**: useCallback optimization prevents unnecessary re-renders
- **Bundle size**: Avoided additional dependencies for state management
- **Learning curve**: Hooks are more intuitive for developers familiar with React

**Trade-off**: 
- **Limited to single component state management**: State sharing between components requires prop drilling
- **No centralized state**: Cannot easily share state across multiple components without prop passing
- **Debugging complexity**: State changes are harder to track without Redux DevTools

**Alternative Considered**: Redux Toolkit for centralized state management
**Why Rejected**: Overkill for this application's complexity level

#### 2. **Caching Strategy**
**Decision**: In-memory Map-based caching on the server with TTL
**Rationale**:
- **Fast access**: O(1) lookup time for cached responses
- **Memory efficient**: Automatic cleanup of expired entries
- **Simple implementation**: No external dependencies
- **Immediate availability**: No network latency for cached responses

**Trade-off**:
- **Not persistent across server restarts**: Cache is lost when server restarts
- **Memory usage grows with cache size**: Mitigated by TTL and size limits
- **Single-server only**: Not suitable for horizontal scaling or load balancing
- **No cache sharing**: Multiple server instances cannot share cache

**Alternative Considered**: Redis for distributed caching
**Why Rejected**: Added complexity and external dependency for a single-server application

#### 3. **Text Selection Implementation**
**Decision**: Used native textarea selection API with custom event handling
**Rationale**:
- **Native browser support**: Works across all modern browsers
- **Real-time updates**: Selection changes are immediately reflected
- **Performance**: No heavy DOM manipulation libraries needed
- **Accessibility**: Maintains native keyboard navigation and screen reader support

**Trade-off**:
- **Limited to plain text**: No rich text formatting support
- **Selection state management complexity**: Requires careful handling of selection events
- **Browser compatibility considerations**: Different browsers handle selection events slightly differently
- **No advanced selection features**: Cannot select across multiple elements

**Alternative Considered**: Draft.js or Slate.js for rich text editing
**Why Rejected**: Increased bundle size and complexity for basic text editing needs

#### 4. **API Response Processing**
**Decision**: Server-side text cleaning and formatting
**Rationale**:
- **Consistent output**: All clients receive clean, formatted text
- **Reduced client-side processing**: Better performance on mobile devices
- **Centralized logic**: Easier to maintain and update text processing rules
- **Security**: Prevents client-side manipulation of AI responses

**Trade-off**:
- **Increased server processing time**: Each response requires text cleaning
- **Less flexibility for client-side customization**: Clients cannot modify processing rules
- **Server resource usage**: Higher CPU usage on the server
- **Response size**: Cleaned text might be slightly larger than raw AI output

**Alternative Considered**: Client-side text processing
**Why Rejected**: Would require sending processing logic to all clients and increase client-side complexity

#### 5. **Error Handling Strategy**
**Decision**: Layered error handling with graceful degradation
**Rationale**:
- **User experience**: Users can continue working even when some features fail
- **Debugging**: Clear error messages help developers identify issues
- **Reliability**: Application remains functional despite network or API failures
- **Maintenance**: Centralized error handling is easier to maintain

**Trade-off**:
- **Code complexity**: More complex error handling logic
- **Bundle size**: Additional error handling code increases bundle size
- **Performance overhead**: Error checking adds minimal performance cost

### State Management and Undo/Redo Implementation

#### State Structure Design
The application uses a sophisticated state management system designed for optimal performance and user experience:

```javascript
const [text, setText] = useState('');                    // Current text content
const [selectedText, setSelectedText] = useState('');    // Currently selected text
const [history, setHistory] = useState([]);              // Array of text versions
const [currentIndex, setCurrentIndex] = useState(-1);    // Current position in history
const [loading, setLoading] = useState(false);           // API request state
const [error, setError] = useState('');                  // Error state
const [success, setSuccess] = useState('');              // Success message state
const [currentTone, setCurrentTone] = useState({ x: 1, y: 1 }); // Current tone position
```

#### Undo/Redo Algorithm Implementation
The undo/redo system implements a sophisticated branching history management algorithm:

1. **History Management**: Each text change creates a new entry in the history array
2. **Index Tracking**: `currentIndex` tracks the current position in the history
3. **Branching Prevention**: When undoing and making new changes, the history is truncated to prevent orphaned branches
4. **Performance Optimization**: History is limited to 50 entries to prevent memory bloat
5. **State Synchronization**: All state changes are automatically synchronized with localStorage

```javascript
const addToHistory = useCallback((newText) => {
  const newHistory = history.slice(0, currentIndex + 1); // Truncate future history
  newHistory.push(newText);                              // Add new version
  setHistory(newHistory);
  setCurrentIndex(newHistory.length - 1);
}, [history, currentIndex]);
```

#### Local Storage Integration Strategy
- **Automatic Persistence**: State is automatically saved to localStorage on every change
- **Data Validation**: Robust validation ensures corrupted data doesn't break the application
- **Size Management**: History size is limited to prevent localStorage quota issues
- **Error Recovery**: Graceful handling of localStorage failures with fallback strategies
- **Performance Optimization**: Uses debounced saving to prevent excessive localStorage writes

#### State Update Optimization
- **useCallback Optimization**: Prevents unnecessary re-renders of child components
- **Batch Updates**: Multiple state changes are batched for optimal performance
- **Memoization**: Expensive calculations are memoized to prevent recalculation
- **Event Debouncing**: Text selection events are debounced to prevent excessive processing

### Error Handling and Edge Cases

#### 1. **API Error Handling Strategy**
**Approach**: Implemented a comprehensive, layered error handling system with specific error categorization and user-friendly messages.

```javascript
// Server-side error categorization with specific HTTP status codes
switch (status) {
  case 400: throw new Error('Invalid request. Please check your input.');
  case 401: throw new Error('Authentication failed. Please check your API key.');
  case 429: throw new Error('Rate limit exceeded. Please try again later.');
  case 500: throw new Error('Server error. Please try again later.');
  default: throw new Error(`Request failed with status ${status}`);
}
```

**Edge Cases Handled**:
- **Network connectivity issues**: Automatic retry with exponential backoff
- **API rate limiting**: User-friendly messages with retry suggestions
- **Invalid API responses**: Response validation and graceful degradation
- **Timeout scenarios**: Configurable timeouts with user notification
- **CORS errors**: Proper CORS configuration for production and development
- **API key validation**: Real-time validation of API key authenticity

#### 2. **Text Processing Edge Cases**
**Approach**: Comprehensive input validation and sanitization with multiple layers of protection.

```javascript
// Multi-layer input validation
if (!text || text.trim().length === 0) {
  return res.status(400).json({ error: 'Text is required' });
}

if (x === undefined || y === undefined || x < 0 || x > 2 || y < 0 || y > 2) {
  return res.status(400).json({ error: 'Invalid tone coordinates' });
}

// Text length validation to prevent abuse
if (text.length > 10000) {
  return res.status(400).json({ error: 'Text too long. Maximum 10,000 characters.' });
}
```

**Edge Cases Handled**:
- **Empty or whitespace-only text**: Comprehensive validation with helpful error messages
- **Invalid tone matrix coordinates**: Boundary checking with clear error descriptions
- **Extremely long text**: Configurable limits to prevent DoS attacks and API abuse
- **Special characters and encoding issues**: Proper text encoding and sanitization
- **AI response formatting inconsistencies**: Robust text cleaning with multiple fallback strategies
- **Unicode and international character support**: Full UTF-8 support for global users

#### 3. **User Interface Edge Cases**
**Approach**: Defensive programming with graceful degradation and user feedback.

```javascript
// Selection validation with fallback behavior
if (start !== end && start >= 0 && end >= 0) {
  const selectedText = text.substring(start, end);
  if (selectedText.trim().length > 0) {
    onTextSelection(selectedText);
  } else {
    onTextSelection(''); // Clear selection for whitespace-only
  }
} else {
  onTextSelection(''); // Handle invalid selection ranges
}
```

**Edge Cases Handled**:
- **Empty text selections**: Automatic clearing of invalid selections
- **Rapid user interactions**: Request deduplication and debouncing
- **Keyboard shortcut conflicts**: Proper event handling and prevention
- **Browser compatibility issues**: Cross-browser compatible event handling
- **Local storage quota exceeded**: Graceful degradation with user notification
- **Memory pressure**: Automatic cleanup of old history entries
- **Network state changes**: Detection and handling of online/offline transitions

#### 4. **Performance Edge Cases**
**Approach**: Optimized rendering and request management with intelligent resource allocation.

```javascript
// Request deduplication to prevent API abuse
if (loading) {
  toast.error('Please wait for the current request to complete');
  return;
}

// Debounced text selection for optimal performance
const handleSelectionEvent = useCallback(() => {
  requestAnimationFrame(handleSelection);
}, [handleSelection]);

// Memory leak prevention with proper cleanup
useEffect(() => {
  return () => {
    // Cleanup event listeners and timers
    clearTimeout(selectionTimeout);
    clearTimeout(saveTimeout);
  };
}, []);
```

**Edge Cases Handled**:
- **Multiple simultaneous API requests**: Request deduplication and queuing
- **Large text processing**: Chunked processing for very long texts
- **Memory leaks from event listeners**: Proper cleanup and memory management
- **Slow network connections**: Configurable timeouts and retry mechanisms
- **Browser performance limitations**: Graceful degradation for older browsers
- **High-frequency user interactions**: Event throttling and debouncing
- **Resource exhaustion**: Automatic cleanup and resource management

#### 5. **Data Persistence Edge Cases**
**Approach**: Robust localStorage management with comprehensive fallback strategies.

```javascript
// Graceful localStorage failure handling with multiple fallback strategies
try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
} catch (error) {
  console.error('Failed to save to localStorage:', error);
  
  // Strategy 1: Try to clear old data and retry
  try {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      text: data.text || '',
      history: [],
      currentIndex: -1,
      timestamp: Date.now()
    }));
  } catch (clearError) {
    console.error('Failed to clear localStorage:', clearError);
    
    // Strategy 2: Use sessionStorage as fallback
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (sessionError) {
      console.error('Failed to use sessionStorage:', sessionError);
      // Strategy 3: Notify user and continue without persistence
    }
  }
}
```

**Edge Cases Handled**:
- **localStorage quota exceeded**: Automatic cleanup and fallback strategies
- **Private browsing mode**: Graceful degradation with sessionStorage fallback
- **Corrupted localStorage data**: Data validation and automatic recovery
- **Browser storage disabled**: User notification and continued functionality
- **Data format versioning**: Automatic migration of old data formats
- **Storage quota management**: Intelligent cleanup of old data
- **Cross-tab synchronization**: Proper handling of multiple browser tabs

#### 6. **Security Edge Cases**
**Approach**: Multi-layered security with input validation, rate limiting, and secure API key management.

```javascript
// Comprehensive input validation and sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 10000); // Prevent extremely long inputs
};

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// API key security
if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY === 'placeholder') {
  throw new Error('Mistral API key not configured');
}
```

**Edge Cases Handled**:
- **Input injection attacks**: Comprehensive input sanitization and validation
- **API key exposure**: Server-side only storage with environment variable protection
- **Rate limiting bypass attempts**: Multiple layers of rate limiting protection
- **CORS attacks**: Proper CORS configuration for production environments
- **Request size attacks**: Configurable request size limits
- **Authentication bypass**: Proper API key validation and error handling
- **Data corruption attacks**: Input validation and sanitization

### Security Considerations

#### 1. **Input Validation and Sanitization**
- **Server-side validation**: All inputs are validated on the server before processing
- **Rate limiting**: Prevents abuse and DoS attacks with configurable limits
- **Request size limits**: Prevents memory exhaustion attacks
- **Input sanitization**: Removes potentially malicious content from user inputs

#### 2. **API Security**
- **API keys stored server-side only**: Never exposed to client-side code
- **CORS configuration**: Proper CORS setup for production environments
- **Helmet.js integration**: Security headers for protection against common attacks
- **Input sanitization**: Prevents injection attacks and malicious content

#### 3. **Data Protection**
- **No sensitive data in localStorage**: Only application state is stored locally
- **Automatic cleanup**: Old cache entries are automatically removed
- **Data validation**: All stored data is validated on load to prevent corruption
- **Encrypted communication**: HTTPS for all production API communications

## Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Required
MISTRAL_API_KEY=your_mistral_api_key_here

# Optional
PORT=5000
NODE_ENV=development
```

### API Configuration

The application uses the Mistral Small model by default. You can modify the model in `server/index.js`:

```javascript
const chatResponse = await client.chat({
  model: 'mistral-small-latest', // Change model here
  messages: [new ChatMessage('user', prompt)],
  temperature: 0.7,
  maxTokens: 1000
});
```

## Testing

### Manual Testing Checklist

- [ ] Text input and editing
- [ ] Text selection functionality
- [ ] Tone matrix interactions
- [ ] Undo/redo operations
- [ ] Error handling (network, API)
- [ ] Local storage persistence
- [ ] Responsive design
- [ ] Loading states
- [ ] API rate limiting

### API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Tone adjustment
curl -X POST http://localhost:5000/api/adjust-tone \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","x":1,"y":1}'
```

## Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment**
   ```bash
   # In server/.env
   NODE_ENV=production
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Deployment Options

- **Vercel**: Deploy frontend and backend separately
- **Heroku**: Deploy full-stack application
- **Docker**: Containerized deployment
- **AWS/GCP**: Cloud deployment with load balancing

## Security Considerations

- API keys are stored server-side only
- Rate limiting prevents abuse
- Input validation on all endpoints
- CORS configuration for production
- Helmet.js for security headers

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Verify your Mistral API key is correct
   - Check the `.env` file is in the server directory
   - Ensure the API key has proper permissions

2. **CORS Errors**
   - Check the CORS configuration in `server/index.js`
   - Verify the frontend URL is allowed

3. **Local Storage Issues**
   - Clear browser cache and localStorage
   - Check browser console for errors

4. **Performance Issues**
   - Monitor API response times
   - Check cache hit rates
   - Optimize text length for API calls

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Mistral AI](https://mistral.ai/) for providing the AI API
- [React](https://reactjs.org/) for the frontend framework
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Styled Components](https://styled-components.com/) for styling

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This application requires an active internet connection and a valid Mistral AI API key to function properly.
