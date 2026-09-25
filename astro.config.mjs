import { defineConfig } from 'astro/config';

// On GitHub Pages the site lives under /gnomikon/. The deploy workflow sets
// SITE_URL and BASE_PATH; locally both are unset and the site runs at /.
export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH || '/',
});
