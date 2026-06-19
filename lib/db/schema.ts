import {
  pgTable,
  serial,
  text,
  bigint,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull().default(''),
  tags: text('tags').array().notNull().default([]),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull().default(0),
  coverImageUrl: text('cover_image_url'),
  uploaderName: text('uploader_name').notNull().default('Anonymous'),
  downloadCount: integer('download_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
