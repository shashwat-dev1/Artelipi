import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Premium Color Palette
      colors: {
        // Base colors
        'premium-bg': '#F8F6F1',        // Warm cream paper
        'premium-bg-secondary': '#EDE9E0', // Aged paper
        'premium-text': '#2C2416',      // Rich dark brown
        'premium-text-secondary': '#5C5346', // Medium brown
        'premium-text-tertiary': '#8C8679',  // Light brown
        'premium-accent': '#C17F4A',    // Warm copper
        'premium-accent-hover': '#A66938', // Darker copper
        'premium-border': '#D4CFC4',    // Subtle beige

        // Keep existing
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      // Premium Typography
      fontFamily: {
        serif: ['Playfair Display', 'Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'Source Sans Pro', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },

      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
      },

      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.01em',
      },

      // Premium Spacing
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },

      // Premium Transitions
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },

      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Max widths
      maxWidth: {
        'article': '65ch',
        'content': '1200px',
        'narrow': '800px',
      },

      // Border radius
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;
