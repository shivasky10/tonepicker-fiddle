# 🚀 Quick Setup Guide

## Immediate Setup (5 minutes)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment
```bash
# Copy the environment file
cp server/env.example server/.env

# Edit server/.env and add your Mistral API key
# Get your API key from: https://console.mistral.ai/
```

### 3. Start Development Servers
```bash
npm run dev
```

### 4. Open in Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 How to Use

1. **Type text** in the editor on the left
2. **Select a portion** of your text
3. **Click any cell** in the 3x3 matrix on the right
4. **Watch** your text transform to match the chosen tone
5. **Use Undo/Redo** to navigate through changes

## 🔧 Troubleshooting

- **API Key Error**: Make sure your Mistral API key is correct in `server/.env`
- **Port Issues**: Change the port in `server/.env` if 5000 is busy
- **CORS Errors**: Check that both servers are running

## 📚 Full Documentation

See `README.md` for complete documentation, architecture details, and deployment guides.
