import { SiteHeader } from '@/components/site-header'
import { SearchControls } from '@/components/search-controls'
import { NoteCard } from '@/components/note-card'
import { UploadDialog } from '@/components/upload-dialog'
import { getNotes, getStats } from '@/app/actions/notes'
import { FileSearch, Library, Layers, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string; type?: string }>
}) {
  const params = await searchParams
  const [notes, stats] = await Promise.all([
    getNotes({
      query: params.q,
      subject: params.subject,
      fileType: params.type,
    }),
    getStats(),
  ])

  const isFiltering = Boolean(params.q || params.subject || params.type)

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-20">
        {/* Hero */}
        <section className="flex flex-col items-center gap-5 py-12 text-center md:py-16">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
            Share and discover study notes
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground md:text-lg">
            Upload notes and books of any length — 50, 500, or 5,000 pages — and
            find exactly what you need with rich, descriptive search.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <UploadDialog />
          </div>

          <dl className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <Stat
              icon={<Library className="size-4" />}
              label="Notes"
              value={stats.total}
            />
            <Stat
              icon={<Layers className="size-4" />}
              label="Subjects"
              value={stats.subjects}
            />
            <Stat
              icon={<Download className="size-4" />}
              label="Downloads"
              value={stats.downloads}
            />
          </dl>
        </section>

        {/* Search */}
        <section className="sticky top-16 z-30 -mx-4 bg-background/90 px-4 py-3 backdrop-blur">
          <SearchControls />
        </section>

        {/* Results */}
        <section className="pt-6">
          {notes.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                {isFiltering ? ' found' : ' in the library'}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState filtering={isFiltering} />
          )}
        </section>
      </main>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <dd className="font-semibold">{value.toLocaleString()}</dd>
      <dt className="text-muted-foreground">{label}</dt>
    </div>
  )
}

function EmptyState({ filtering }: { filtering: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <FileSearch className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {filtering ? 'No matching notes' : 'The library is empty'}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">
          {filtering
            ? 'Try a different keyword, subject, or file type.'
            : 'Be the first to contribute — upload a note or book to get started.'}
        </p>
      </div>
      {!filtering && <UploadDialog />}
    </div>
  )
}
