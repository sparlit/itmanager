# Telegram Integration Setup Guide

## Overview

This guide explains how to set up a Telegram group and bot for receiving support messages from the IT Manager chat widget.

---

## Part 1: Telegram Group (Already Configured)

Your group link is: `https://t.me/al_rayes_it_support`

The chat widget now has a button that opens this group.

---

## Part 2: Create Telegram Bot (Optional - for notifications)

Follow these steps to create a bot that can send notifications to your group:

### Step 1: Create the Bot

1. Open **Telegram** app
2. Search for **@BotFather** (official Telegram bot)
3. Send the command: `/newbot`
4. Enter bot name (e.g., `Al Rayes IT Bot`)
5. Enter username - must end with `bot` (e.g., `AlRayesITSupportBot`)
6. **Copy the Bot Token** (you'll need this later)

> ⚠️ **Important**: Save the bot token - you'll need it!

### Step 2: Add Bot to Group

1. Open your group: `https://t.me/al_rayes_it_support`
2. Tap group name → **Add Members**
3. Search for your bot username (e.g., `@AlRayesITSupportBot`)
4. Tap **Add**

### Step 3: Get Group Chat ID

1. Open your group
2. Add **@userinfobot** to the group (or use this trick:)
3. Send a message in the group
4. Open this URL in browser (replace with your bot token):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
5. Look for `"chat":{"id":-XXXXXXXXX` - that's your **Chat ID**

### Step 4: Configure in App

Update your `.env` file with:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=-XXXXXXXXX
```

---

## Step-by-Step Video Guide

### Creating Bot (@BotFather)
```
1. Open Telegram → Search @BotFather
2. Send: /newbot
3. Name: Al Rayes IT Bot
4. Username: AlRayesITSupportBot (must end in bot)
5. Copy the token!
```

### Finding Group Chat ID
```
1. Add @RawDataBot to your group
2. Send any message
3. Check the response for "chat":{"id":-XXXXXX
4. That's your chat ID (starts with -100 or -)
```

---

## Testing the Bot

Open in browser:
```
https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Hello from IT Manager!
```

---

## Quick Reference

| Item | Where to Find |
|------|---------------|
| Group Link | Group Settings → Public → Copy Link |
| Bot Token | @BotFather → /mybots → Select Bot |
| Chat ID | @RawDataBot in group or getUpdates URL |