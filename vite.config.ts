import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const site = (env.VITE_SITE_URL ?? '').replace(/\/$/, '')
  const title = env.VITE_APP_TITLE || 'Cinema Stage'
  const description =
    env.VITE_OG_DESCRIPTION ||
    'Self-hosted long-form player with HLS-first delivery.'
  const ogImage =
    env.VITE_OG_IMAGE ||
    (site ? `${site}/og-preview.svg` : './og-preview.svg')
  const canonical = site || './'
  const twitterCard = env.VITE_TWITTER_CARD || 'summary_large_image'

  return {
    base: './',
    plugins: [
      react(),
      {
        name: 'html-site-meta',
        transformIndexHtml(html) {
          return html
            .replaceAll('__HTML_APP_TITLE__', title)
            .replaceAll('__HTML_OG_DESCRIPTION__', description)
            .replaceAll('__HTML_CANONICAL_URL__', canonical)
            .replaceAll('__HTML_OG_IMAGE__', ogImage)
            .replaceAll('__HTML_TWITTER_CARD__', twitterCard)
        },
      },
    ],
  }
})
