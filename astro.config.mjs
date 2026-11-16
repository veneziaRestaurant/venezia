// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

const site = JSON.parse(readFileSync(new URL('./src/content/site.json', import.meta.url), 'utf-8'));

// Die Admin-Oberfläche (Keystatic) läuft nur lokal mit `npm run dev` / `npm run admin`.
// Die veröffentlichte Seite bleibt dadurch rein statisch – schnell, sicher, kostenlos hostbar.
const isDev = process.argv.includes('dev');

// GitHub Pages: "url" in site.json, z. B. https://jalal-sarokhan.github.io/beit-alshami/
// → site = https://jalal-sarokhan.github.io, base = /beit-alshami
// Bei eigener Domain (https://www.venezia-pizzeria.at/) wird base automatisch "/".
const siteUrl = new URL(site.url);
const basePath = siteUrl.pathname.replace(/\/+$/, '') || '/';

export default defineConfig({
  site: siteUrl.origin,
  // Lokal (npm run dev / admin) ohne Unterpfad, damit die Admin-Oberfläche unter /keystatic läuft
  base: isDev ? '/' : basePath,
  trailingSlash: 'ignore',
  // CSS direkt in die Seite einbetten: spart eine Netzwerk-Anfrage beim ersten Laden (Lighthouse)
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/qr'),
      i18n: { defaultLocale: 'de', locales: { de: 'de-AT', en: 'en', ar: 'ar' } },
    }),
    ...(isDev ? [react(), keystatic()] : []),
  ],
  image: {
    // Fotos werden beim Build automatisch verkleinert und als AVIF/WebP ausgeliefert.
    layout: 'constrained',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
