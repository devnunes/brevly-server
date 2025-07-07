import { randomUUID } from 'node:crypto'
import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'

export async function makeLinkUpload(
  overrides?: Partial<InferInsertModel<typeof schema.links>>
) {
  const result = await db
    .insert(schema.links)
    .values({
      id: faker.string.uuid(),
      url: 'https://example.com/',
      shortUrl: `${randomUUID()}-${faker.word.sample(5)}`,
      ...overrides,
    })
    .returning()

  return result[0]
}
