import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from '@/env'
import {
  createLinkRoute,
  deleteLinkRoute,
  exportLinksRoute,
  getLinkByShortUrlRoute,
  getLinkRoute,
} from './routes/link.routes'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation Error',
    })
  }

  console.error(error)
  return reply.status(500).send({
    message: 'Internal server error',
  })
})

server.register(fastifyCors, {
  origin: env.WEB_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
})

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brevly API',
      description: 'API for the Brevly URL shortening service',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(createLinkRoute)
server.register(getLinkRoute)
server.register(getLinkByShortUrlRoute)
server.register(deleteLinkRoute)
server.register(exportLinksRoute)

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server is running on http://localhost:${env.PORT}`)
})
