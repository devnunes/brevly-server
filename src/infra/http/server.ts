import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'

const server = fastify({})

server.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('Server is running on http://localhost:3333')
})
