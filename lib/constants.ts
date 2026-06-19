export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Engineering',
  'Medicine',
  'Law',
  'Economics',
  'Business',
  'Accounting',
  'Psychology',
  'History',
  'Philosophy',
  'Literature',
  'Languages',
  'Art & Design',
  'Other',
] as const

export const FILE_TYPES = [
  { label: 'PDF', value: 'PDF', mime: ['application/pdf'], ext: ['pdf'] },
  {
    label: 'Word (DOC/DOCX)',
    value: 'DOCX',
    mime: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    ext: ['doc', 'docx'],
  },
  {
    label: 'PowerPoint',
    value: 'PPTX',
    mime: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    ext: ['ppt', 'pptx'],
  },
  {
    label: 'Text / Markdown',
    value: 'TXT',
    mime: ['text/plain', 'text/markdown'],
    ext: ['txt', 'md'],
  },
  { label: 'EPUB', value: 'EPUB', mime: ['application/epub+zip'], ext: ['epub'] },
] as const

export function fileTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const match = FILE_TYPES.find((t) => (t.ext as readonly string[]).includes(ext))
  return match?.value ?? 'OTHER'
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
