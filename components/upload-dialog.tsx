'use client'

import type React from 'react'

import { useCallback, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUBJECTS, fileTypeFromName, formatBytes } from '@/lib/constants'
import { createNote } from '@/app/actions/notes'
import {
  Upload,
  FileText,
  X,
  ImageIcon,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function UploadDialog({ fullWidth }: { fullWidth?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [uploaderName, setUploaderName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setTitle('')
    setAuthor('')
    setSubject('')
    setDescription('')
    setUploaderName('')
    setTags([])
    setTagInput('')
    setFile(null)
    setCover(null)
    setProgress(0)
    setSubmitting(false)
  }, [])

  const addTag = () => {
    const value = tagInput.trim().replace(/,$/, '')
    if (value && !tags.includes(value) && tags.length < 12) {
      setTags((prev) => [...prev, value])
    }
    setTagInput('')
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.error('Please choose a document to upload')
      return
    }
    if (!title.trim()) {
      toast.error('Please add a title')
      return
    }

    setSubmitting(true)
    setProgress(0)

    try {
      // 1. Upload the document directly to Blob (handles very large files via
      //    multipart — no serverless body-size limit).
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        multipart: true,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      })

      // 2. Optionally upload a cover image.
      let coverUrl: string | null = null
      if (cover) {
        const coverBlob = await upload(cover.name, cover, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        coverUrl = coverBlob.url
      }

      // 3. Persist the searchable metadata.
      await createNote({
        title,
        author,
        subject,
        description,
        tags,
        fileUrl: blob.url,
        fileName: file.name,
        fileType: fileTypeFromName(file.name),
        fileSize: file.size,
        coverImageUrl: coverUrl,
        uploaderName,
      })

      toast.success('Note uploaded', {
        description: `"${title}" is now in the library.`,
      })
      reset()
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error('[v0] upload failed:', err)
      toast.error('Upload failed', {
        description: (err as Error).message,
      })
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!submitting) {
          setOpen(o)
          if (!o) reset()
        }
      }}
    >
      <DialogTrigger render={<Button className={cn(fullWidth && 'w-full')} />}>
        <Upload className="size-4" />
        Upload notes
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload a note or book</DialogTitle>
          <DialogDescription>
            Add rich details so others can find it. Any file size or page count
            is supported.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* File dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              dragging
                ? 'border-primary bg-accent'
                : 'border-border hover:border-primary/50 hover:bg-muted',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.epub"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex w-full items-center gap-3 text-left">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Upload className="size-5" />
                </div>
                <p className="text-sm font-medium">
                  Drag & drop or click to choose a file
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, PowerPoint, EPUB, or text — no size limit
                </p>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry — Complete Lecture Notes"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Original author or source"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={subject}
                onValueChange={(v) => setSubject(v ?? '')}
              >
                <SelectTrigger id="subject" className="w-full">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's inside? Chapters covered, course, level, edition, exam relevance…"
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="tags">Tags / keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Type a keyword and press Enter"
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          setTags((prev) => prev.filter((t) => t !== tag))
                        }
                        className="rounded-full hover:text-destructive"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="uploader">Your name</Label>
              <Input
                id="uploader"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="Anonymous"
              />
            </div>

            {/* Cover image */}
            <div className="grid gap-2">
              <Label htmlFor="cover">Cover image</Label>
              <input
                ref={coverInputRef}
                id="cover"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                className="justify-start font-normal"
                onClick={() => coverInputRef.current?.click()}
              >
                {cover ? (
                  <>
                    <CheckCircle2 className="size-4 text-primary" />
                    <span className="truncate">{cover.name}</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="size-4" />
                    Optional thumbnail
                  </>
                )}
              </Button>
            </div>
          </div>

          {submitting && (
            <div className="grid gap-1.5">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Uploading… {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => {
                reset()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Uploading…' : 'Publish note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
