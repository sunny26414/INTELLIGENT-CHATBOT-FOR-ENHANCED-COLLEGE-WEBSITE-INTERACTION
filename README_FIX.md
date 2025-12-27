# Chatbot Fix Update

I have updated the code in this folder to fix the chatbot response issue.

## Changes Made
- **File**: `src/components/Chatbot.js`
- **Fix**: Updated the Gemini API model from `gemini-1.5-flash` (which was causing 404 errors) to `gemini-flash-latest`.
- **API Endpoint**: Switched to `v1beta` to ensure compatibility.

## How to Run
Since the code is already updated in this directory, you can simply run:

1. Open a terminal in this folder:
   `c:\Users\yelamoni\OneDrive\Documents\FinalChatBot[1]\FinalChatBot`
2. Start the application:
   ```bash
   npm start
   ```

The chatbot should now respond effectively to queries.
