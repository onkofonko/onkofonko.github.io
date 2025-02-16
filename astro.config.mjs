import { defineConfig } from 'astro/config';

import purgecss from 'astro-purgecss';

// https://astro.build/config
export default defineConfig({
  site: 'https://onkofonko.github.io',
  integrations: [purgecss()],
});