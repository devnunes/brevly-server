import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import {
  createLink,
  deleteLink,
  exportLinks,
  getLinkbyShortUrl,
  getLinks,
} from '@/app/functions/link'
import { isRight, unwrapEither } from '@/infra/shared/either'

export const createLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create a new link',
        description:
          'Creates a new shortened link with the provided URL and shortUrl.',
        body: z.object({
          url: z.url().max(100).describe('The URL to be shortened'),
          shortUrl: z
            .string()
            .min(1)
            .describe('The shortUrl for the shortened link'),
        }),
        response: {
          201: z
            .object({
              id: z.uuidv7(),
              url: z.string(),
              shortUrl: z.string(),
              createdAt: z.date(),
            })
            .describe('Link created successfully'),
          409: z
            .object({
              message: z.string(),
            })
            .describe('shortUrl already exists'),
          400: z
            .object({
              message: z.string(),
            })
            .describe('Bad request, invalid input'),
        },
      },
    },
    async (request, reply) => {
      const { url, shortUrl } = request.body
      const result = await createLink({ url, shortUrl })

      if (isRight(result)) {
        return reply.status(201).send(unwrapEither(result))
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidLinkError':
          console.error('Invalid link error:', error)
          return reply.status(400).send({
            message: error.message,
          })
      }
    }
  )
}

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

export const getLinkByShortUrlRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/link/:shortUrl',
    {
      schema: {
        summary: 'Get a link by shortUrl',
        description: 'Retrieves a shortened link by its shortUrl.',
        params: z.object({
          shortUrl: z.string().min(1).describe('The shortUrl to retrieve'),
        }),
        response: {
          200: z
            .object({
              id: z.uuidv7(),
              url: z.string(),
              shortUrl: z.string(),
              accessCount: z.number(),
              createdAt: z.date(),
            })
            .describe('Link retrieved successfully'),
          404: z
            .object({
              message: z.string().default('Link not found'),
            })
            .describe('Link not found'),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await getLinkbyShortUrl(shortUrl)

      if (isRight(result)) {
        return reply.status(200).send(unwrapEither(result))
      }

      return reply.status(404).send({
        message: 'Link not found',
      })
    }
  )
}

export const deleteLinkRoute: FastifyPluginAsyncZod = async server => {
  server.delete(
    '/link',
    {
      schema: {
        summary: 'Delete a link.',
        description: 'Delete an existing link from database.',
        body: z.object({
          id: z.uuidv7(),
        }),
        response: {
          204: z.object({
            message: z.string().default('Link deleted successfully'),
          }),
          404: z.object({
            message: z.string().default('Link not found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.body

      const result = deleteLink(id)
      if (result instanceof Error) {
        console.error('Error deleting link:', result)
        return reply.status(404).send({
          message: 'Link not found',
        })
      }
      return reply.status(204).send()
    }
  )
}

export const exportLinksRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links/export',
    {
      schema: {
        summary: 'Export all links',
        description: 'Exports all shortened links as a CSV file.',
        tags: ['Export'],
        response: {
          200: z.object({
            reportUrl: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const result = await exportLinks()

      const { reportUrl } = unwrapEither(result)

      return reply.status(200).send({ reportUrl })
    }
  )
}
