import { BookOpen } from 'lucide-react'
import { UploadDialog } from '@/components/upload-dialog'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <a href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            NoteVault
          </span>
        </a>
        <UploadDialog />
      </div>
    </header>
  )
}
