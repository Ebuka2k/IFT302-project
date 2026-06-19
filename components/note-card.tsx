'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { incrementDownload } from '@/app/actions/notes'
import { formatBytes } from '@/lib/constants'
import type { Note } from '@/lib/db/schema'
import { Download, FileText, User } from 'lucide-react'

export function NoteCard({ note }: { note: Note }) {
  async function handleDownload() {
    // Fire-and-forget count bump; navigation happens regardless.
    incrementDownload(note.id).catch(() => {})
    window.open(note.fileUrl, '_blank', 'noopener')
  }

  return (
    <Card className="flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-muted">
        {note.coverImageUrl ? (
          <Image
            src={note.coverImageUrl || '/placeholder.svg'}
            alt={`Cover for ${note.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-10" />
          </div>
        )}
        <Badge className="absolute left-3 top-3" variant="default">
          {note.fileType}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-primary">
            {note.subject}
          </span>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-balance">
            {note.title}
          </h3>
        </div>

        {note.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {note.description}
          </p>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="secondary" className="font-normal">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <User className="size-3 shrink-0" />
              <span className="truncate">{note.author}</span>
            </span>
            <span>{formatBytes(note.fileSize)}</span>
          </div>
          <Button onClick={handleDownload} variant="secondary" className="w-full">
            <Download className="size-4" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  )
}
