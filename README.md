# Agent Bot

A Telegram bot that processes voice messages using ArcadeAI.

## Prerequisites

- Node.js
- pnpm (or npm)
- Telegram Bot Token
- Arcade API Key
- OpenAI API Key

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file with the required API keys:
   ```
   BOT_TOKEN=your_telegram_bot_token_here
   ARCADE_API_KEY=your_arcade_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running

Start the bot:
```bash
pnpm start
```

The bot will only respond to voice messages and convert them using the configured AI service.