import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { type NextRequest, NextResponse } from 'next/server'

// Client-side direct uploads to Vercel Blob.
// The browser sends the file straight to Blob storage (not through this
// function), so request-body size limits do not apply — 50+ page PDFs and
// large DOCs upload without issue (Blob supports files up to 5TB).
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/epub+zip',
            'text/plain',
            'text/markdown',
            'image/png',
            'image/jpeg',
            'image/webp',
          ],
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // Metadata is persisted via the createNote server action once the
        // client confirms the upload finished.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
