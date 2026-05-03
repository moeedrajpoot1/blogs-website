/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Source Serif Pro', 'Georgia', 'ui-serif', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          50: '#fafaf9',
          100: '#f4f4f2',
          200: '#e6e6e3',
          300: '#cdcdc8',
          400: '#9d9d97',
          500: '#73736d',
          600: '#525550',
          700: '#3a3d39',
          800: '#22251f',
          900: '#13140f',
        },
        accent: {
          DEFAULT: '#b1430b',
          soft: '#f5e8d8',
        },
      },
      maxWidth: {
        prose: '68ch',
        content: '720px',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink.700'),
            '--tw-prose-headings': theme('colors.ink.900'),
            '--tw-prose-links': theme('colors.accent.DEFAULT'),
            '--tw-prose-bold': theme('colors.ink.900'),
            '--tw-prose-quotes': theme('colors.ink.700'),
            '--tw-prose-code': theme('colors.ink.900'),
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            maxWidth: 'none',
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
