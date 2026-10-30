export type Subtitle = {
  id: string
  number: number
  start: string
  end: string
  text: string
}

export type AssetMeta = {
  id: string
  name: string
  size: number
  kind: string
  role?: string
  subtitleNumber?: number
  label?: string
  approved?: boolean
  duration?: number
  contactSheet?: boolean
}

export type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  activeStep: number
  videoTitle: string
  duration: string
  topic: string
  audience: string
  style: string
  transcript: string
  notes: string
  sourceFiles: AssetMeta[]
  scriptPrompt: string
  script: string
  scriptComplete: boolean
  scriptChecks: Record<string, boolean>
  voiceMethod: string
  voiceNotes: string
  audioAssets: AssetMeta[]
  approvedAudioId: string
  audioChecks: Record<string, boolean>
  srtText: string
  subtitles: Subtitle[]
  subtitleChecks: Record<string, boolean>
  storyboardPrompt: string
  geminiPrompt: string
  selectedBatch: number
  batchChecks: Record<string, Record<string, boolean>>
  images: AssetMeta[]
  finalChecks: Record<string, boolean>
  qualityChecks: Record<string, boolean>
  exportedVideoName: string
  finalTitle: string
  metadataOutput: string
  finalVideoComplete: boolean
}

export const SCRIPT_TEMPLATE = `MASTER SCRIPT-WRITING PROMPT

You are an expert YouTube documentary writer, historical researcher, storytelling specialist, and retention-focused scriptwriter.

Write an original, engaging, professionally narrated YouTube script based on the following project information.

VIDEO TITLE:
{{VIDEO_TITLE}}

VIDEO TOPIC:
{{VIDEO_TOPIC}}

TARGET DURATION:
{{VIDEO_DURATION_MINUTES}} minutes.

TARGET AUDIENCE:
{{TARGET_AUDIENCE}}

STORYTELLING STYLE:
{{STORYTELLING_STYLE}}

PREVIOUS VIDEO TRANSCRIPT, IF PROVIDED:
{{PREVIOUS_TRANSCRIPT}}

ADDITIONAL REFERENCE NOTES:
{{REFERENCE_NOTES}}

YOUR OBJECTIVE

Create a compelling script that sounds like a human storyteller speaking naturally to an audience, rather than an essay, textbook, or generic AI-generated script.

Follow these requirements:

1. OPENING HOOK
Begin with an intriguing question, surprising situation, vivid scene, historical contradiction, or compelling mystery. Establish a reason for viewers to keep watching without using misleading claims.

2. ORIGINAL STORY STRUCTURE
Develop a clear beginning, middle, and ending. Each section should contribute new information, develop the central question, or advance the story.

3. RETENTION AND PACING
Use curiosity, meaningful revelations, scene transitions, unanswered questions, and occasional changes in pace. Do not insert artificial cliffhangers into every paragraph.

4. NATURAL SPOKEN ENGLISH
Write for voice narration. Use varied sentence lengths, conversational phrasing, appropriate punctuation, and clear transitions. Avoid repetitive sentence patterns, unnecessary filler, and robotic wording.

5. FACTUAL ACCURACY
For historical, scientific, or factual subjects, do not invent evidence, quotations, statistics, historical events, or sources. Clearly distinguish established facts from disputed interpretations and uncertainty.

6. ORIGINALITY
If a previous transcript is supplied, do not copy its sentences, structure, or distinctive expressions. Use it only to identify context, tone, and potentially overlapping topics.

7. VISUAL STORYTELLING
Write scenes that can be illustrated using stickman characters, simple environments, props, symbols, diagrams, and clear visual actions.
Make the story understandable even when viewers are not looking at the screen.

8. VOICEOVER DIRECTION
Use occasional natural delivery cues such as [pause], [whispers], or [serious tone] only when they materially improve the performance. Do not overload the script with stage directions.

9. APPROPRIATE LENGTH
Target approximately 130–150 spoken words per minute, adjusted for dramatic pauses and delivery.
Estimate the required word count based on the requested duration. Prioritize story quality over padding. Make the script fit the target duration realistically.

10. ENDING
Deliver a satisfying conclusion that resolves the central question or provides a meaningful takeaway. Use a natural call to action only when appropriate.

11. FORMATTING
Return the final script in clearly organized sections.
Separate the spoken narration from section headings where appropriate. Do not include production notes inside the narration unless they are meant to be spoken.
Do not return an outline instead of the requested complete script.
Do not generate image prompts in this step.
Do not invent citations or claim research has been performed when it has not.

FINAL QUALITY CHECK

Before returning the script, check its originality, narrative coherence, factual caution, spoken-English quality, estimated duration, and visual suitability.

Return the complete, polished script ready for voice generation.`

export const STORYBOARD_TEMPLATE = `MASTER STICKMAN STORYBOARD PROMPT

You are an expert visual storyboard artist, stickman animation director, scene-composition designer, and AI image-prompt engineer.

Your job is to transform the supplied SRT subtitles into a coherent visual storyboard for a YouTube video.

The video uses a consistent stickman character style, simple but expressive environments, cinematic compositions, clear actions, and strong visual continuity.

FULL VIDEO SRT:
{{FULL_SRT}}

VIDEO TITLE:
{{VIDEO_TITLE}}

VISUAL STYLE REFERENCE:
The user will attach a reference image showing the desired stickman art style. Closely follow the reference's line quality, character proportions, simplicity, color palette, and overall visual identity. Do not reproduce unrelated content from the reference image.

GLOBAL VISUAL RULES

1. CHARACTER CONSISTENCY
Maintain the same main stickman character design across the entire video. Keep the head shape, body proportions, line weight, facial style, and clothing or accessories consistent when present.

2. ENVIRONMENT CONSISTENCY
Keep recurring locations, props, and environmental details visually coherent across consecutive scenes.

3. SCENE RELEVANCE
Each image must directly illustrate its corresponding subtitle or the immediate narrative meaning. Avoid unrelated stock-style illustrations.

4. VISUAL VARIETY
Use different poses, camera distances, compositions, angles, expressions, and environments when the story calls for them. Avoid generating nearly identical images repeatedly.

5. ACTION
Every image should show a clear visual idea, action, situation, contrast, or meaningful reaction. Do not create a generic character standing without purpose.

6. READABILITY
Use simple backgrounds, strong silhouettes, uncluttered compositions, and enough negative space to make the scene understandable at a glance.

7. STORY CONTINUITY
The images should feel like frames from one coherent video rather than unrelated illustrations.

8. STYLE
Follow the attached reference image for the art direction. Avoid switching randomly between realistic photography, 3D animation, anime, and unrelated cartoon styles.

9. IMAGE FORMAT
Write prompts suitable for generating individual landscape 16:9 images for YouTube video editing. Do not request a contact sheet unless explicitly asked.

10. NO UNWANTED TEXT
Avoid visible words, captions, logos, watermarks, and decorative typography inside the generated images unless a specific scene genuinely requires readable text.

11. NO INVENTED HISTORICAL DETAILS
When the subject is historical, avoid unsupported specifics. Use historically appropriate props and environments when the evidence supports them. If a detail is uncertain, use a generic representation rather than inventing certainty.

12. STORYBOARD COVERAGE
The full SRT is the source of truth for subtitle sequence numbers and narrative context. Each subtitle entry must be accounted for in the storyboard plan, even when several entries share one visual scene.

BATCH INSTRUCTIONS

The user will specify a subtitle batch, for example entries 1–9, 10–18, or 19–27.

Generate image prompts only for the requested batch. Use the complete SRT to understand context, but do not produce prompts for entries outside the selected batch.

If nine consecutive subtitles can be illustrated effectively with nine individual images, produce nine prompts.

For every requested subtitle entry, return:
- Subtitle sequence number.
- Exact subtitle text.
- Short scene description.
- Character action and emotion.
- Environment and important props.
- Camera angle and composition.
- Final ready-to-copy image-generation prompt.

Each image prompt must be independently usable in Gemini. Repeat the necessary character and style constraints inside each prompt instead of relying on previous prompts.

If several subtitles represent the same continuous action, preserve continuity while changing the composition or action meaningfully. Do not invent visual changes merely to force variety.

OUTPUT FORMAT

For each requested subtitle entry, use this structure:

SUBTITLE NUMBER:
Exact subtitle text:

SCENE PURPOSE:
A short explanation of what the viewer should understand.

CHARACTER AND ACTION:
Describe the character's pose, action, and expression.

ENVIRONMENT:
Describe the location, props, and relevant background elements.

CAMERA AND COMPOSITION:
Describe the framing, camera angle, subject placement, and negative space.

GEMINI IMAGE PROMPT:
Provide one complete, detailed, ready-to-paste image prompt.

VISUAL CONTINUITY NOTES:
Mention any important recurring details that should remain consistent.

Do not output vague prompts such as "a stickman showing fear." Describe what the character is doing, what surrounds them, the camera framing, and the visual meaning.

Before finishing, verify that each requested subtitle entry has one clearly numbered storyboard prompt and that the output contains no missing sequence numbers.

END OF MASTER PROMPT`

const now = () => new Date().toISOString()

export function createProject(name = 'Untitled project'): Project {
  const timestamp = now()
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    activeStep: 0,
    videoTitle: '',
    duration: '',
    topic: '',
    audience: '',
    style: 'Historical storytelling',
    transcript: '',
    notes: '',
    sourceFiles: [],
    scriptPrompt: SCRIPT_TEMPLATE,
    script: '',
    scriptComplete: false,
    scriptChecks: {},
    voiceMethod: '',
    voiceNotes: '',
    audioAssets: [],
    approvedAudioId: '',
    audioChecks: {},
    srtText: '',
    subtitles: [],
    subtitleChecks: {},
    storyboardPrompt: STORYBOARD_TEMPLATE,
    geminiPrompt: '',
    selectedBatch: 0,
    batchChecks: {},
    images: [],
    finalChecks: {},
    qualityChecks: {},
    exportedVideoName: '',
    finalTitle: '',
    metadataOutput: '',
    finalVideoComplete: false,
  }
}

export function parseSrt(text: string): Subtitle[] {
  const blocks = text.replace(/^\uFEFF/, '').trim().split(/\r?\n\s*\r?\n/)
  const parsed: Subtitle[] = []
  for (const [index, block] of blocks.entries()) {
    const lines = block.split(/\r?\n/)
    if (lines.length < 2) continue
    const number = Number(lines[0].trim())
    const timing = lines[1].match(/^\s*(\S+)\s+-->\s+(\S+)(?:\s+.*)?$/)
    if (!Number.isInteger(number) || !timing) continue
    parsed.push({
      id: crypto.randomUUID(),
      number,
      start: timing[1],
      end: timing[2],
      text: lines.slice(2).join('\n').trim(),
    })
    void index
  }
  return parsed
}

export function formatSrt(subtitles: Subtitle[]): string {
  return subtitles.map((sub, index) =>
    `${index + 1}\n${sub.start} --> ${sub.end}\n${sub.text.trim()}`,
  ).join('\n\n')
}

export function timestampMs(value: string): number | null {
  const match = value.match(/^(\d{2,}):([0-5]\d):([0-5]\d),(\d{3})$/)
  if (!match) return null
  return ((Number(match[1]) * 60 + Number(match[2])) * 60 + Number(match[3])) * 1000 + Number(match[4])
}

export function validateSrt(subtitles: Subtitle[]) {
  const problems: { id: string; type: 'error' | 'warning'; message: string }[] = []
  const seen = new Set<number>()
  for (const [index, item] of subtitles.entries()) {
    const start = timestampMs(item.start)
    const end = timestampMs(item.end)
    if (!Number.isInteger(item.number) || item.number < 1) {
      problems.push({ id: item.id, type: 'error', message: `Entry ${index + 1}: invalid sequence number.` })
    }
    if (seen.has(item.number)) problems.push({ id: item.id, type: 'error', message: `Duplicate sequence number ${item.number}.` })
    seen.add(item.number)
    if (start === null || end === null) {
      problems.push({ id: item.id, type: 'error', message: `Entry ${item.number}: timestamp must use HH:MM:SS,mmm format.` })
    } else {
      if (end < start) problems.push({ id: item.id, type: 'error', message: `Entry ${item.number}: end time is before start time.` })
      if (end - start > 10000) problems.push({ id: item.id, type: 'warning', message: `Entry ${item.number}: display duration exceeds 10 seconds.` })
      if (end - start < 300 && item.text.trim()) problems.push({ id: item.id, type: 'warning', message: `Entry ${item.number}: display duration is under 0.3 seconds.` })
      const previous = subtitles[index - 1]
      const previousEnd = previous ? timestampMs(previous.end) : null
      if (previousEnd !== null && start < previousEnd) problems.push({ id: item.id, type: 'warning', message: `Entry ${item.number}: overlaps the previous subtitle.` })
    }
    if (item.text.split(/\r?\n/).some(line => line.length > 42)) {
      problems.push({ id: item.id, type: 'warning', message: `Entry ${item.number}: a subtitle line exceeds 42 characters.` })
    }
    if (!item.text.trim()) problems.push({ id: item.id, type: 'warning', message: `Entry ${item.number}: subtitle text is empty.` })
  }
  return problems
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDuration(seconds?: number): string {
  if (seconds === undefined || !Number.isFinite(seconds)) return 'Duration unavailable'
  const mins = Math.floor(seconds / 60)
  return `${mins}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export function fillScriptTemplate(project: Project): string {
  return project.scriptPrompt
    .replaceAll('{{VIDEO_TITLE}}', project.videoTitle || '[Enter video title]')
    .replaceAll('{{VIDEO_TOPIC}}', project.topic || '[Optional topic or idea]')
    .replaceAll('{{VIDEO_DURATION_MINUTES}}', project.duration || '[Enter duration]')
    .replaceAll('{{TARGET_AUDIENCE}}', project.audience || '[Optional target audience]')
    .replaceAll('{{STORYTELLING_STYLE}}', project.style || '[Choose a style]')
    .replaceAll('{{PREVIOUS_TRANSCRIPT}}', project.transcript || '[Not provided]')
    .replaceAll('{{REFERENCE_NOTES}}', project.notes || '[No additional notes]')
}

export function makeStoryboardPrompt(project: Project): string {
  return project.storyboardPrompt
    .replaceAll('{{VIDEO_TITLE}}', project.videoTitle || '[Untitled video]')
    .replaceAll('{{FULL_SRT}}', project.srtText || formatSrt(project.subtitles) || '[Paste the complete approved SRT]')
}
