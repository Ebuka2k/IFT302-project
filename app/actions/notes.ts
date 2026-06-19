'use server'

import { db } from '@/lib/db'
import { notes, type NewNote } from '@/lib/db/schema'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type NoteFilters = {
  query?: string
  subject?: string
  fileType?: string
}

export async function getNotes(filters: NoteFilters = {}) {
  const conditions = []

  const query = filters.query?.trim()
  if (query) {
    const like = `%${query}%`
    conditions.push(
      or(
        ilike(notes.title, like),
        ilike(notes.author, like),
        ilike(notes.subject, like),
        ilike(notes.description, like),
        sql`array_to_string(${notes.tags}, ' ') ILIKE ${like}`,
      ),
    )
  }

  if (filters.subject && filters.subject !== 'all') {
    conditions.push(eq(notes.subject, filters.subject))
  }

  if (filters.fileType && filters.fileType !== 'all') {
    conditions.push(eq(notes.fileType, filters.fileType))
  }

  return db
    .select()
    .from(notes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(notes.createdAt))
}

export async function getStats() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      subjects: sql<number>`count(distinct ${notes.subject})::int`,
      downloads: sql<number>`coalesce(sum(${notes.downloadCount}), 0)::int`,
    })
    .from(notes)
  return row ?? { total: 0, subjects: 0, downloads: 0 }
}

export async function createNote(input: {
  title: string
  author: string
  subject: string
  description: string
  tags: string[]
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  coverImageUrl?: string | null
  uploaderName?: string
}) {
  if (!input.title?.trim()) throw new Error('Title is required')
  if (!input.fileUrl) throw new Error('A file is required')

  const value: NewNote = {
    title: input.title.trim(),
    author: input.author.trim() || 'Unknown',
    subject: input.subject || 'Other',
    description: input.description?.trim() ?? '',
    tags: input.tags.map((t) => t.trim()).filter(Boolean).slice(0, 12),
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSize: input.fileSize,
    coverImageUrl: input.coverImageUrl || null,
    uploaderName: input.uploaderName?.trim() || 'Anonymous',
  }

  const [created] = await db.insert(notes).values(value).returning()
  revalidatePath('/')
  return created
}

export async function incrementDownload(id: number) {
  await db
    .update(notes)
    .set({ downloadCount: sql`${notes.downloadCount} + 1` })
    .where(eq(notes.id, id))
}
