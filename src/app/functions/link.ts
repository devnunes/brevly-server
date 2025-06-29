import { z } from 'zod/v4'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/infra/shared/either'
import type { InvalidLinkError } from './errors/invalid-link'

const linkInputSchema = z.object({
  url: z.url().min(1).max(100),
  slug: z.string().min(1).max(20),
})

type LinkInput = z.input<typeof linkInputSchema>

export async function createLink(
  input: LinkInput
): Promise<Either<InvalidLinkError, { url: string; slug: string }>> {
  const { url, slug } = linkInputSchema.parse(input)
  await db.insert(schema.links).values({
    url,
    shortUrl: slug,
  })

  return makeRight({ url, slug })
}
