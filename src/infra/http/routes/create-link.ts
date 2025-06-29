import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { createLink } from '@/app/functions/link'
import { isRight, unwrapEither } from '@/infra/shared/either'

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create a new link',
        description:
          'Creates a new shortened link with the provided URL and slug.',
        body: z.object({
          url: z.url().max(100).describe('The URL to be shortened'),
          slug: z
            .string()
            .min(1)
            .max(20)
            .describe('The slug for the shortened link'),
        }),
        response: {
          201: z.object({ url: z.string(), slug: z.string() }),
          409: z
            .object({
              message: z.string(),
            })
            .describe('Slug already exists'),
          400: z
            .object({
              message: z.string(),
            })
            .describe('Bad request, invalid input'),
        },
      },
    },
    async (request, reply) => {
      const { url, slug } = request.body
      const result = await createLink({ url, slug })

      if (isRight(result)) {
        return reply.status(201).send(unwrapEither(result))
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidLinkError':
          return reply.status(400).send({
            message: error.message,
          })
      }
    }
  )
}
