'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUBJECTS, FILE_TYPES } from '@/lib/constants'
import { Search, Loader2 } from 'lucide-react'

export function SearchControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const subject = searchParams.get('subject') ?? 'all'
  const fileType = searchParams.get('type') ?? 'all'

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== 'all') params.set(key, value)
      else params.delete(key)
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  // Debounced text search
  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (query === current) return
    const t = setTimeout(() => pushParams({ q: query }), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, keyword…"
          className="h-11 pl-9"
          aria-label="Search notes"
        />
      </div>

      <Select
        value={subject}
        onValueChange={(v) => pushParams({ subject: v ?? 'all' })}
      >
        <SelectTrigger className="h-11 sm:w-48" aria-label="Filter by subject">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All subjects</SelectItem>
          {SUBJECTS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={fileType}
        onValueChange={(v) => pushParams({ type: v ?? 'all' })}
      >
        <SelectTrigger className="h-11 sm:w-40" aria-label="Filter by file type">
          <SelectValue placeholder="File type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {FILE_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
