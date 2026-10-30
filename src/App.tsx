import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Clipboard, FileAudio, FileImage, FileText, Play,
  Upload, Video,
} from 'lucide-react'
import {
  createProject, formatBytes, formatDuration, type AssetMeta, type Project,
} from './lib'

const STORAGE_KEY = 'stickman-yt-studio-v1'
const STEP_NAMES = ['Write your script', 'Make your voiceover', 'Create subtitles', 'Make your images', 'Finish & upload']
const STEP_DESCRIPTIONS = [
  'Use your script master prompt, then paste or upload your finished script.',
  'Make a voiceover, mix it if needed, enhance it, then add your final audio.',
  'Create subtitles from your final voiceover, then correct and save the SRT.',
  'Use Claude and Gemini to make storyboard sheets, then split and prepare the images.',
  'Make the final video, prepare metadata, then upload it to YouTube.',
]
const STEP_TOOLS: { name: string; url?: string; local?: boolean; detail: string }[][] = [
  [{ name: 'ChatGPT', url: 'https://chatgpt.com/', detail: 'Use your project prompt to write the video script.' }],
  [
    { name: 'VoiceStudio — Local Application', local: true, detail: 'Open VoiceStudio on your computer to create a voiceover.' },
    { name: 'ElevenLabs', url: 'https://elevenlabs.io/', detail: 'Create a voiceover from your script.' },
    { name: 'Fish Audio', url: 'https://fish.audio/', detail: 'Another voiceover option.' },
    { name: 'Audio Joiner', url: 'https://audiojoiner.com/', detail: 'Combine voiceover audio files into one track.' },
    { name: 'BahaASR', url: 'https://bahaasr.com/', detail: 'AI-enhance your audio and remove silence.' },
  ],
  [
    { name: 'Audio to SRT — Google Colab', url: 'https://colab.research.google.com/drive/17RNfTJmXQsq5bI6--jM3bwwR6iaj8mV4?usp=sharing', detail: 'Follow the notebook instructions to make an SRT file.' },
    { name: 'Subtitle Studio', url: 'https://subtitle-studio.bahaa-ai.com/', detail: 'Correct subtitle text and timing.' },
  ],
  [
    { name: 'Claude', url: 'https://claude.ai/', detail: 'Use the scene master prompt with your complete SRT and subtitle batches.' },
    { name: 'Gemini', url: 'https://gemini.google.com/', detail: 'Make the storyboard sheet from Claude’s prompt.' },
    { name: 'PhotoScape X — Local Application', local: true, detail: 'Open PhotoScape X on your computer to split 3×3 storyboard sheets into individual images.' },
  ],
  [
    { name: 'SRT Video Generator — Local Application', local: true, detail: 'Open the installed app on your computer to make the video.' },
    { name: 'ChatGPT', url: 'https://chatgpt.com/', detail: 'Generate the final title, description, tags, and thumbnail prompt.' },
    { name: 'MrCrazyExplains YouTube Channel', url: 'https://www.youtube.com/@MrCrazyExplains', detail: 'Open your channel after the upload is ready.' },
    { name: 'YouTube Studio', url: 'https://studio.youtube.com/', detail: 'Upload your finished video and add its title, description, and tags.' },
  ],
]

type MasterPrompts = { script: string; scene: string; metadata: string }

function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createProject('My video project')
    const parsed: unknown = JSON.parse(raw)
    const saved = Array.isArray(parsed) ? parsed[0] : parsed
    if (typeof saved !== 'object' || saved === null) return createProject('My video project')
    const base = createProject(typeof saved.name === 'string' ? saved.name : 'My video project')
    return {
      ...base,
      ...saved,
      sourceFiles: Array.isArray(saved.sourceFiles) ? saved.sourceFiles : [],
      subtitles: Array.isArray(saved.subtitles) ? saved.subtitles : [],
      audioAssets: Array.isArray(saved.audioAssets) ? saved.audioAssets : [],
      images: Array.isArray(saved.images) ? saved.images : [],
    } as Project
  } catch {
    return createProject('My video project')
  }
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Use the browser's fallback below.
  }
  const input = document.createElement('textarea')
  input.value = text
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  input.remove()
  return copied
}

function Button({ children, onClick, primary = false, disabled = false }: {
  children: React.ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean
}) {
  return <button className={`action-button ${primary ? 'primary' : ''}`} onClick={onClick} disabled={disabled}>{children}</button>
}

function App() {
  const [project, setProject] = useState(loadProject)
  const [masterPrompts, setMasterPrompts] = useState<MasterPrompts>({ script: '', scene: '', metadata: '' })
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    const loadPrompt = async (path: string) => {
      const response = await fetch(path)
      if (!response.ok) throw new Error(`Could not load ${path} (${response.status}).`)
      return response.text()
    }
    Promise.all([
      loadPrompt('/prompts/script-master.txt'),
      loadPrompt('/prompts/scene-image-master.txt'),
      loadPrompt('/prompts/metadata-master.txt'),
    ]).then(([script, scene, metadata]) => {
      if (!cancelled) setMasterPrompts({ script, scene, metadata })
    }).catch(error => {
      if (!cancelled) setToast(error instanceof Error ? `Master prompts could not be loaded: ${error.message}` : 'Master prompts could not be loaded.')
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([project]))
    } catch (error) {
      setToast(error instanceof Error ? `Save failed: ${error.message}` : 'Save failed. Export or copy your work.')
    }
  }, [project])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const update = (patch: Partial<Project>) => setProject(current => ({ ...current, ...patch, updatedAt: new Date().toISOString() }))
  const copy = async (text: string, label: string) => {
    if (!text.trim()) { setToast(`Nothing to copy yet. Add your ${label.toLowerCase()} first.`); return }
    const success = await copyText(text)
    setToast(success ? `${label} copied.` : 'Copy did not work. Select the text and copy it manually.')
  }
  const tools = STEP_TOOLS[project.activeStep]
  const promptScript = useMemo(() => project.script
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => !line.startsWith('```'))
    .join('\n')
    .trim(), [project.script])
  const scriptPrompt = masterPrompts.script
  const scenePrompt = masterPrompts.scene
    ? `${masterPrompts.scene}\n\nSRT WORKFLOW OVERRIDE FOR THIS PROJECT\nThe input is a complete SRT file, not a one-sentence-per-line script. Read the full SRT first to understand the story, then reply only: "I have read the SRT, send me subtitles 1–9." The user will send the subtitle entries in batches of up to 9. Treat each subtitle entry as one panel in order, and preserve its sequence and exact text. Generate exactly one 3×3 storyboard prompt for each batch, using the master prompt's grid, visual, continuity, and output rules. After each batch, request the next 9 subtitles; after the final batch, do not request another.`
    : ''
  const metadataPrompt = masterPrompts.metadata
    ? `${masterPrompts.metadata}${promptScript ? `\n\nFULL SCRIPT:\n${promptScript}` : ''}`
    : ''
  const stepCount = project.activeStep + 1

  const goTo = (step: number) => {
    update({ activeStep: Math.max(0, Math.min(4, step)) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleUpload = async (file?: File) => {
    if (!file) return
    const id = crypto.randomUUID()
    const url = project.activeStep === 1 ? URL.createObjectURL(file) : ''
    if (url) setFileUrls(current => ({ ...current, [id]: url }))
    const meta: AssetMeta = { id, name: file.name, size: file.size, kind: file.type || 'file' }
    try {
      if (project.activeStep === 0) {
        if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
          update({ sourceFiles: [...(project.sourceFiles ?? []), meta] })
          setToast('PDF attached. It is saved for this browser session; its text is not extracted.')
        } else if (/\.(txt|md)$/i.test(file.name) || file.type.startsWith('text/')) {
          const text = await file.text()
          update({ script: text, sourceFiles: [...(project.sourceFiles ?? []), meta] })
          setToast(`Text loaded from ${file.name}.`)
        } else {
          throw new Error('For this step, upload a TXT or PDF file.')
        }
      } else if (project.activeStep === 1) {
        if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name)) throw new Error('Choose an audio file.')
        const audio = new Audio(url)
        const duration = await new Promise<number | undefined>(resolve => {
          audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : undefined)
          audio.onerror = () => resolve(undefined)
          window.setTimeout(() => resolve(undefined), 2500)
        })
        update({ audioAssets: [...project.audioAssets, { ...meta, role: 'narration', duration }] })
        setToast(`Final voiceover added: ${file.name}. Re-upload after a refresh to play it again.`)
      } else {
        throw new Error('There is no file upload for this step.')
      }
    } catch (error) {
      if (url) {
        URL.revokeObjectURL(url)
        setFileUrls(current => { const next = { ...current }; delete next[id]; return next })
      }
      setToast(error instanceof Error ? error.message : 'Could not open this file.')
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  const fileSettings = [
    { accept: '.txt,.md,.pdf,text/plain,application/pdf', label: 'Choose TXT or PDF' },
    { accept: 'audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac', label: 'Choose audio' },
    { accept: '', label: '' },
    { accept: '', label: '' },
    { accept: '', label: '' },
  ][project.activeStep]
  const chooseFiles = () => fileInput.current?.click()

  const renderToolCard = (tool: typeof tools[number]) => tool.url
    ? <a key={tool.name} className="platform-link" href={tool.url} target="_blank" rel="noopener noreferrer"><span className="platform-icon"><Play size={19} fill="currentColor" /></span><span className="platform-copy"><strong>Open {tool.name}</strong><small>{tool.detail}</small></span><ChevronRight size={20} /></a>
    : <div key={tool.name} className="platform-link local-platform"><span className="platform-icon"><Video size={20} /></span><span className="platform-copy"><strong>{tool.name}</strong><small>{tool.detail}</small></span></div>

  const renderToolLinks = () => project.activeStep === 1
    ? <div className="voice-tool-rows">
      <div className="voice-tool-row voice-creation-row">{tools.slice(0, 3).map(renderToolCard)}</div>
      <div className="voice-tool-row">{tools.slice(3, 4).map(renderToolCard)}</div>
      <div className="voice-tool-row">{tools.slice(4, 5).map(renderToolCard)}</div>
    </div>
    : project.activeStep === 2
      ? <div className="subtitle-tool-rows">{tools.map(tool => <div className="subtitle-tool-row" key={tool.name}>{renderToolCard(tool)}</div>)}</div>
    : <div className="platform-grid">{tools.map(renderToolCard)}</div>

  const renderScriptStep = () => <div className="content-grid">
    <section className="work-card">
      <details className="prompt-details" open><summary><span>Script master prompt — ready to copy</span><ChevronDown size={17} /></summary><pre>{masterPrompts.script || 'Loading your script master prompt…'}</pre><div className="button-line"><Button primary onClick={() => void copy(scriptPrompt, 'Script master prompt')} disabled={!scriptPrompt}><Clipboard size={17} /> Copy master prompt</Button></div></details>
      {renderToolLinks()}
      <div className="simple-instructions"><strong>Use it in ChatGPT:</strong><span>1. Copy the master prompt above.</span><span>2. Open ChatGPT below and paste the prompt.</span><span>3. When asked for the topic, enter your video title or topic.</span><span>4. Optional: paste an older transcript about the same topic. Tell ChatGPT to use it only as reference and not copy it.</span><span>5. When asked, enter the video duration in minutes.</span><span>6. Confirm ChatGPT’s summary and wait for the script.</span><span>7. Paste the finished script into Step 2.</span></div>
    </section>
  </div>

  const renderVoiceStep = () => <div className="content-grid">
    <section className="work-card">
      <div className="simple-instructions"><strong>Make your final voiceover:</strong><span>1. Use VoiceStudio on your computer, or choose an online voice tool above, to create your voiceover from the script you made in Step 1.</span><span>2. Download the voiceover. If it is split into multiple files, open Audio Joiner above, combine them, and download one audio file.</span><span>3. Open BahaASR above. AI-enhance the audio and remove silence.</span><span>4. Download your best enhanced voiceover and add that final audio file below.</span></div>
      <div className="button-line"><Button primary onClick={chooseFiles}><Upload size={17} /> Add final enhanced voiceover</Button></div>
      <AssetList assets={project.audioAssets} urls={fileUrls} onRemove={id => update({ audioAssets: project.audioAssets.filter(asset => asset.id !== id) })} />
    </section>
  </div>

  const renderSubtitleStep = () => <div className="content-grid">
    <section className="work-card">
      <div className="simple-instructions"><strong>Create and save your SRT:</strong><span>1. Open Audio to SRT — Google Colab above and follow the notebook to transcribe your final enhanced voiceover from Step 2.</span><span>2. Download the SRT file created by the notebook.</span><span>3. Open Subtitle Studio above and load that SRT file.</span><span>4. Correct any subtitle wording and timing, then download the corrected SRT.</span><span>5. Keep the corrected SRT file with your project. You will add it to the video in Step 5.</span></div>
    </section>
  </div>

  const renderStoryboardStep = () => <div className="content-grid">
    <section className="work-card">
      <details className="prompt-details" open><summary><span>Scene master prompt — ready to copy</span><ChevronDown size={17} /></summary><pre>{scenePrompt || 'Loading your scene master prompt…'}</pre><div className="button-line"><Button primary onClick={() => void copy(scenePrompt, 'Scene master prompt')} disabled={!scenePrompt}><Clipboard size={17} /> Copy master prompt</Button></div></details>
      {renderToolCard(tools[0])}
      <div className="simple-instructions"><strong>Make your storyboard with Claude:</strong><span>1. Copy the scene master prompt above and paste it into Claude.</span><span>2. Send Claude the complete corrected SRT from Step 3 so it understands the whole video.</span><span>3. Copy the first 9 SRT entries from your file and send them to Claude. Repeat with the next 9 until all subtitles are covered.</span><span>4. Copy Claude’s storyboard prompt and open Gemini below.</span></div>
      {renderToolCard(tools[1])}
      <div className="simple-instructions"><strong>Generate and organize your images:</strong><span>5. In Gemini, paste Claude’s storyboard prompt, attach your stickman reference image, and generate the 3×3 storyboard sheet.</span><span>6. Save each generated sheet in one folder. Keep the sheets and panels in the correct sequence for your video.</span></div>
      {renderToolCard(tools[2])}
      <div className="simple-instructions"><strong>Split and prepare images for your video:</strong><span>7. Open PhotoScape X on your computer. Use it to split each 3×3 storyboard sheet into 9 individual images, and save them in order.</span><span>8. Review and edit the individual images as needed. Keep the finished images ready to add to your video in Step 5.</span></div>
    </section>
  </div>

  const renderFinalStep = () => <div className="content-grid">
    <section className="work-card">
      {renderToolCard(tools[0])}
      <div className="simple-instructions"><strong>Make your video:</strong><span>1. Open SRT Video Generator on your computer.</span><span>2. Add your organized image folder, final enhanced voiceover, and corrected SRT.</span><span>3. Generate and export your finished video.</span></div>
      <details className="prompt-details" open><summary><span>Metadata master prompt — ready to copy</span><ChevronDown size={17} /></summary><pre>{metadataPrompt || 'Loading your metadata master prompt…'}</pre>{metadataPrompt && !promptScript && <p className="prompt-hint">Your script is not included yet. After pasting this prompt into ChatGPT, paste your finished script when asked.</p>}<div className="button-line"><Button primary onClick={() => void copy(metadataPrompt, promptScript ? 'Metadata master prompt and full script' : 'Metadata master prompt')} disabled={!metadataPrompt}><Clipboard size={17} /> {promptScript ? 'Copy prompt + full script' : 'Copy master prompt'}</Button></div></details>
      <div className="subtitle-tool-row">{renderToolCard(tools[1])}</div>
      <div className="simple-instructions"><strong>Prepare your metadata:</strong><span>4. Paste the copied prompt into ChatGPT and use its results for your video title, description, tags, and thumbnail.</span></div>
      <div className="subtitle-tool-row">{renderToolCard(tools[2])}</div>
      <div className="simple-instructions"><strong>Upload your video:</strong><span>5. Open YouTube Studio, upload the exported video, and add the title, description, and tags from ChatGPT.</span><span>6. Publish it on the MrCrazyExplains channel when everything is ready.</span></div>
      <div className="subtitle-tool-row">{renderToolCard(tools[3])}</div>
    </section>
  </div>

  return <div className="app">
    <header className="top-header">
      <a className="brand" href="#" aria-label="Stickman Studio for YouTube automation home"><img className="brand-logo" src="/stickman-studio.svg" alt="" /><span className="brand-wordmark"><strong>Stickman <b>Studio</b></strong><small>YOUTUBE AUTOMATION</small></span></a>
      <div className="project-name">{project.videoTitle || project.name}</div>
      <div className="step-counter"><span className="step-counter-label">YOUR PROGRESS</span><strong>{String(stepCount).padStart(2, '0')}</strong><span>/ 05</span></div>
    </header>
    <nav className="step-navigation" aria-label="Production steps">
      {STEP_NAMES.map((name, index) => <button key={name} onClick={() => goTo(index)} className={project.activeStep === index ? 'selected' : ''} aria-current={project.activeStep === index ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong></button>)}
    </nav>
    <div className="progress-track" role="progressbar" aria-label="Workflow progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={stepCount}><span style={{ width: `${stepCount * 20}%` }} /></div>
    <main className="main">
      <div className="step-intro"><div className="big-step-number">0{stepCount}</div><div><span className="eyebrow">YOUR VIDEO WORKFLOW <i /> STEP {stepCount} OF 5</span><h1>{STEP_NAMES[project.activeStep]}</h1><p>{STEP_DESCRIPTIONS[project.activeStep]}</p></div></div>
      {project.activeStep !== 0 && project.activeStep !== 3 && project.activeStep !== 4 && <section className="platform-section"><div className="section-title"><span>YOUR TOOL{tools.length > 1 ? 'S' : ''}</span><span>OPEN IN A NEW TAB <ArrowRight size={14} /></span></div>{renderToolLinks()}</section>}
      <section className="content-section">{project.activeStep !== 0 && project.activeStep !== 3 && project.activeStep !== 4 && <div className="section-title"><span>YOUR WORK</span><span>TEXT AND FILES STAY IN THIS BROWSER</span></div>}
        {project.activeStep === 0 && renderScriptStep()}
        {project.activeStep === 1 && renderVoiceStep()}
        {project.activeStep === 2 && renderSubtitleStep()}
        {project.activeStep === 3 && renderStoryboardStep()}
        {project.activeStep === 4 && renderFinalStep()}
      </section>
      <div className="bottom-navigation"><button onClick={() => goTo(project.activeStep - 1)} disabled={project.activeStep === 0}><ArrowLeft size={18} /> Previous</button><span>Step {stepCount} of 5</span><button className="next-button" onClick={() => goTo(project.activeStep + 1)} disabled={project.activeStep === 4}>Next step <ArrowRight size={18} /></button></div>
    </main>
    <footer className="site-footer"><div className="footer-brand"><img src="/stickman-studio.svg" alt="" /><strong>Stickman <b>Studio</b></strong></div><p>A clear workflow from first idea to finished video.</p><span className="footer-note">Your project text stays in this browser. Re-upload media after refreshing.</span></footer>
    <input ref={fileInput} hidden type="file" accept={fileSettings.accept} onChange={event => { void handleUpload(event.target.files?.[0]); }} />
    {toast && <div className="toast"><CheckCircle2 size={19} />{toast}</div>}
  </div>
}

function AssetList({ assets, urls, onRemove, sentenceNumbers, onSubtitleChange }: {
  assets: AssetMeta[]; urls: Record<string, string>; onRemove: (id: string) => void
  sentenceNumbers?: number[]; onSubtitleChange?: (id: string, number: number | undefined) => void
}) {
  if (!assets.length) return <p className="empty-note">Files you add will appear here.</p>
  return <div className="file-list"><h3>Files added</h3>{assets.map(asset => <div className="file-row" key={asset.id}>
    {asset.kind.startsWith('audio') ? <FileAudio size={17} /> : asset.kind.startsWith('image') ? <FileImage size={17} /> : <FileText size={17} />}
    <strong>{asset.name}</strong><span>{formatBytes(asset.size)}{asset.duration ? ` · ${formatDuration(asset.duration)}` : ''}</span>
    {urls[asset.id] && asset.kind.startsWith('audio') && <audio controls src={urls[asset.id]} />}
    {asset.kind.startsWith('image') && sentenceNumbers && onSubtitleChange && <label className="asset-subtitle">Sentence <select aria-label={`Sentence for ${asset.name}`} value={asset.subtitleNumber ?? ''} onChange={event => onSubtitleChange(asset.id, event.target.value ? Number(event.target.value) : undefined)}><option value="">Choose…</option>{sentenceNumbers.map(number => <option key={number} value={number}>{number}</option>)}</select></label>}
    {urls[asset.id] && asset.kind.startsWith('image') && <a href={urls[asset.id]} target="_blank" rel="noopener noreferrer">View</a>}
    <button onClick={() => onRemove(asset.id)} aria-label={`Remove ${asset.name}`}>Remove</button>
  </div>)}</div>
}

export default App
