import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Jøssing Color Palette
        'jossing': {
          'indian-red': '#C95D63',
          'mountbatten-pink': '#AE8799',
          'glaucous': '#717EC3',
          'royal-blue': '#496DDB',
        },
        // Gradient utilities
        'primary': '#717EC3',    // Glaucous
        'secondary': '#496DDB',  // Royal Blue
        'accent': '#C95D63',     // Indian Red
        'muted': '#AE8799',      // Mountbatten Pink
      },
      backgroundImage: {
        'jossing-hero': 'linear-gradient(135deg, #717EC3 0%, #496DDB 100%)',
        'jossing-cta': 'linear-gradient(135deg, #AE8799 0%, #C95D63 100%)',
        'jossing-play': 'linear-gradient(135deg, #717EC3 0%, #496DDB 50%, #AE8799 100%)',
        'jossing-main': 'linear-gradient(135deg, #717EC3 0%, #F8FAFC 50%, #F1F5F9 100%)',
      },
      borderColor: {
        'jossing-primary': '#717EC3',
        'jossing-secondary': '#496DDB',
        'jossing-accent': '#C95D63',
        'jossing-muted': '#AE8799',
      },
      textColor: {
        'jossing-primary': '#717EC3',
        'jossing-secondary': '#496DDB',
        'jossing-accent': '#C95D63',
        'jossing-muted': '#AE8799',
      },
    },
  },
  plugins: [],
} satisfies Config;
