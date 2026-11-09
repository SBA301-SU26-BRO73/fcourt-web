import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * The microservice backend has no gateway in its repo, so in dev every `/api/...`
 * prefix is routed to the service that owns it. The table mirrors the public ALB paths in
 * fcourt-gitops README (path -> service:port); ports are the defaults of each
 * service's application.yml (see fcourt-backend docs/AWS_ARCHITECTURE.md).
 *
 * Keys starting with `^` are regexes tested against the request URL. Order matters:
 * the first match wins, so specific paths must come before their broader prefix.
 */
const SERVICE_PORTS = {
  auth: 8081,
  subscription: 8082,
  facility: 8083,
  reporting: 8084,
  discovery: 8085,
  voucher: 8086,
  slotHold: 8087,
  booking: 8088,
  payment: 8089,
  staffOperations: 8090,
  posRetail: 8092, // pos-retail overrides SERVER_PORT: its code default 8091 clashes with notification
  notification: 8091,
} as const

type ServiceName = keyof typeof SERVICE_PORTS

const API_ROUTES: Array<[pattern: string, service: ServiceName]> = [
  // discovery-service owns the branch search list, reviews and court slots; facility-service
  // owns the rest of /api/public/branches (detail, images, courts).
  ['^/api/public/branches/?([?].*)?$', 'discovery'],
  ['^/api/public/branches/[^/?]+/reviews', 'discovery'],
  ['^/api/public/courts', 'discovery'],
  ['^/api/(admin/)?reviews', 'discovery'],
  ['^/api/public/branches', 'facility'],
  ['^/api/admin/(branches|courts|time-slot-templates)', 'facility'],
  ['^/api/staff/(branches|courts)', 'facility'],

  // super-admin is split three ways: SaaS revenue (subscription), dashboard (reporting), the rest (auth).
  ['^/api/super-admin/stats/saas-revenue', 'subscription'],
  ['^/api/super-admin/dashboard', 'reporting'],
  ['^/api/super-admin', 'auth'],
  ['^/api/auth', 'auth'],

  ['^/api/(subscriptions|subscription-plans|court-types)', 'subscription'],
  ['^/api/admin/dashboard', 'reporting'],
  ['^/api/(admin/)?vouchers', 'voucher'],

  // booking-service owns /api/bookings, except hold-slots which is slot-hold-engine.
  ['^/api/bookings/hold-slots', 'slotHold'],
  ['^/api/(bookings|admin/bookings|public/bookings)', 'booking'],
  ['^/ws-fcourt', 'booking'],

  ['^/api/(payments|refunds|admin/payments|admin/refunds)', 'payment'],

  // pos-retail-service owns the POS paths nested under /api/staff and /api/admin.
  ['^/api/(staff|admin)/pos', 'posRetail'],
  ['^/api/(staff|admin/staff)', 'staffOperations'],
  ['^/devices', 'notification'],
]

function buildProxy(host: string) {
  return Object.fromEntries(
    API_ROUTES.map(([pattern, service]) => [
      pattern,
      {
        target: `http://${host}:${SERVICE_PORTS[service]}`,
        changeOrigin: true,
        ws: pattern === '^/ws-fcourt',
      },
    ]),
  )
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Set DEV_BACKEND_HOST when the services run on another machine or in WSL/Docker.
  const host = env.DEV_BACKEND_HOST || 'localhost'

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          url: 'http://localhost',
        },
      },
    },
    server: {
      proxy: buildProxy(host),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
