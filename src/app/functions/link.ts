import { z } from 'zod/v4'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/infra/shared/either'
import type { InvalidLinkError } from './errors/invalid-link'

const linkInputSchema = z.object({
  url: z.url().min(1).max(100),
  shortUrl: z.string().min(1).max(20),
})

const linkOutputSchema = z.object({
  id: z.uuid(),
  url: z.url().min(1).max(100),
  shortUrl: z.string().min(1).max(20),
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
      shortUrl: shortUrl,
    })
    .returning()

  console.log('Link created:', result)

  return makeRight(result)
}
