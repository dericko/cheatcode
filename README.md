I was annoyed at Leetcode paywalls, so I vibe coded this instead to run through some familiar problems. Fire this up locally and run it in your own browswer. It'll save editor changes and completed coding challenges in browser storage.

Security -- this app interprets editor code on your server, so be sure to audit for code-injection vulnerabilities before running this publically!

It's wired up to work with or without LLM assistance. If you want to get runtime feedback in terms of Big-O, in addition to chat-based hints, add a `GOOGLE_GENERATIVE_AI_API_KEY` to your `.env` file. (As of this writing you can get free tier keys with no billing info at https://aistudio.google.com/)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
