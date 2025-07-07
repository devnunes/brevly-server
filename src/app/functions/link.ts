import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod/v4'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { uploadFileToStorage } from '@/infra/storage/upload-to-storage'
import { InvalidIdError } from './errors/invalid-id'
import type { InvalidLinkError } from './errors/invalid-link'

const linkInputSchema = z.object({
  url: z.url().min(1).max(100),
  shortUrl: z.string().min(1),
})

const linkOutputSchema = z.object({
  id: z.uuidv7(),
  url: z.url().min(1),
  shortUrl: z.string().min(1),
  accessCount: z.number(),
  createdAt: z.date(),
})

type LinkInput = z.input<typeof linkInputSchema>

type LinkOutput = z.output<typeof linkOutputSchema>

export async function createLink(
  input: LinkInput
): Promise<Either<InvalidLinkError, LinkOutput>> {
  const { url, shortUrl } = linkInputSchema.parse(input)
  const [result] = await db
    .insert(schema.links)
    .values({
      url,
      shortUrl,
    })
    .returning()

  console.log('Link created:', result)

  return makeRight(result)
}

export async function getLinks(): Promise<
  Either<InvalidLinkError, LinkOutput[]>
> {
  const results = await db
    .select()
    .from(schema.links)
    .orderBy(desc(schema.links.createdAt))
  if (results.length === 0) {
    return makeRight([])
  }

  const links = results.map(link => linkOutputSchema.parse(link))

  return makeRight(links)
}

export async function getLinkbyShortUrl(
  shortUrl: string
): Promise<Either<InvalidLinkError, LinkOutput>> {
  const shortUrlParsed = z.string().min(1).parse(shortUrl)

  const response = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrlParsed))

  await db
    .update(schema.links)
    .set({
      accessCount: response[0].accessCount + 1,
    })
    .where(eq(schema.links.id, response[0].id))

  return makeRight(linkOutputSchema.parse(response[0]))
}

export async function deleteLink(id: string) {
  const idParsed = z.uuidv7().parse(id)

  const response = await db
    .delete(schema.links)
    .where(eq(schema.links.id, idParsed))
    .returning()

  if (response.length === 0) {
    return makeLeft(new InvalidIdError())
  }

  return makeRight(response)
}

export async function exportLinks(): Promise<
  Either<never, { reportUrl: string }>
> {
  const { sql, params } = await db
    .select()
    .from(schema.links)
    .orderBy(desc(schema.links.createdAt))
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(2)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'url', header: 'Original URL' },
      { key: 'short_url', header: 'Short URL' },
      { key: 'access_count', header: 'Access Count' },
      { key: 'created_at', header: 'Created at' },
    ],
  })

  const uploadToStorageStream = new PassThrough()

  const convertToCSVPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], _encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }
        callback()
      },
    }),
    csv,
    uploadToStorageStream
  )

  const uploadToStorage = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'reports',
    fileName: `links-${new Date().toISOString()}.csv`,
    contentStream: uploadToStorageStream,
  })

  const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline])

  return makeRight({ reportUrl: url })
}
