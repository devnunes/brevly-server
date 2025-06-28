import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import { env } from './env'

const server = fastify({})

server.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

console.log(env.DATABASE_URL)

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server is running on http://localhost:${env.PORT}`)
})
