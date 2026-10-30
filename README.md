# Stickman YT Automation Studio

A simple, local-first five-step workspace for preparing a video script, voiceover, subtitles, storyboard images, and final video. Each step links to the relevant external web tools. The SRT Video Generator is identified as local software because no verified website is available for it.

The app is branded as Stickman Studio for YouTube automation, with a matching SVG logo in the header, footer, and browser tab. The interface includes responsive step navigation, visible workflow progress, tool cards placed beside their instructions, and a compact footer. Layouts adapt to mobile screens and respect reduced-motion preferences.

The script, scene-image, and metadata master prompts are bundled in `public/prompts/` and used in Steps 1, 4, and 5. Step 1 displays the copy-ready script master prompt, a ChatGPT link, and instructions for topic, optional previous transcript, and duration. Step 2 links to VoiceStudio as local software, online voice tools, Audio Joiner, and BahaASR; upload the final enhanced voiceover there. Step 3 uses Audio to SRT and Subtitle Studio to create and correct an SRT. Step 4 guides the user to send the full SRT and batches of up to nine subtitle entries to Claude, generate storyboard sheets in Gemini, organize them in sequence, and use the local PhotoScape X app to split 3×3 sheets into individual video-ready images. Step 5 puts the local SRT Video Generator first, then provides the copy-ready metadata prompt, ChatGPT, the MrCrazyExplains channel, and YouTube Studio links. It has no video-preview upload, filename, title, or metadata-output fields.

## Run locally

```bash
npm ci
npm run dev
```

## Deploy to Netlify

This project is configured for Netlify in `netlify.toml`.

- Build command: `npm run build`
- Publish directory: `dist`
- Node.js version: `20`

To deploy from GitHub, push the `main` branch to GitHub, then in Netlify choose **Add new site → Import an existing project**, connect the repository, and deploy. Netlify will use the checked-in settings automatically. No environment variables are required.

## Deploy to Vercel

This project is configured for Vercel in `vercel.json`.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: use the current Vercel default (Node.js 20 or newer)

To deploy from GitHub:

1. Sign in at [vercel.com](https://vercel.com/) and choose **Add New → Project**.
2. Connect GitHub if asked, then import `Yonas-Esubalew/Stickman-Studio`.
3. Keep the project root as the repository root. Vercel reads the build and output settings from `vercel.json`.
4. Choose **Deploy**. No environment variables are required.
5. Future pushes to `main` will trigger a new production deployment automatically.

To create and inspect a production build locally:

```bash
npm ci
npm run build
npm run preview
```

Project text and metadata are saved in this browser. Uploaded audio and other files are held for the current browser session; upload them again after refreshing. PDF files can be attached, but their text is not extracted.
