import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import settings from './settings'

const api: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Регистрируем роут настроек с префиксом /api
  await fastify.register(settings, { prefix: '/api' })
}

// Используем fastify-plugin чтобы предотвратить автоматический префикс от AutoLoad
// на основе имени папки
export default fp(api)

