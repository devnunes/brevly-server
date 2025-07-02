import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { deleteLink } from '@/app/functions/link'

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
