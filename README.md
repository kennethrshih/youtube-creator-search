# 📺 YouTube Creator Search

A web app to discover YouTube creators by keyword/niche and subscriber count range, with contact info extraction and CSV export.

**🚀 Try it live:** [youtube-creator-search.vercel.app](https://youtube-creator-search.vercel.app/)

## Features

- 🔍 Search YouTube creators by keyword/niche
- 📊 Filter by subscriber count range
- 📧 Extract social links and emails from channel descriptions
- 📥 Export results to CSV

## Getting Started

```bash
# Install dependencies
npm install

# Add your YouTube API key to .env.local
YOUTUBE_API_KEY=your_api_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API

This app uses the [YouTube Data API v3](https://developers.google.com/youtube/v3) to search for channels and retrieve channel details.
