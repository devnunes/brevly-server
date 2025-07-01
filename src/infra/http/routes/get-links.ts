import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { getLinks } from '@/app/functions/link'
import { isRight, unwrapEither } from '@/infra/shared/either'

export const getLinkRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links',
    {
      schema: {
        summary: 'Get all links',
        description: 'Retrieves all shortened links.',
        response: {
          200: z
            .array(
              z.object({
                id: z.uuid(),
                url: z.string(),
                shortUrl: z.string(),
                accessCount: z.number(),
                createdAt: z.date(),
              })
            )
            .describe('List of all links'),
        },
      },
    },
    async (_request, reply) => {
      const result = await getLinks()

      if (isRight(result)) {
        return reply.status(200).send(unwrapEither(result))
      }
    }
  )
}
