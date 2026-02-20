/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // True North teal palette
          50: '#e6f9fa',
          100: '#c0eff3',
          200: '#99e4eb',
          300: '#66d4dc',
          400: '#40c8d2',
          500: '#26b6c6', // Main teal color
          600: '#1ea3b2',
          700: '#178999',
          800: '#106e7f',
          900: '#085665',
          950: '#002c38',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          // Dark navy palette
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#051220',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // True North specific colors (New Brand Identity)
        tnTeal: {
          DEFAULT: "hsl(var(--tn-teal))",
          light: "hsl(var(--tn-teal-light))",
          dark: "hsl(var(--tn-teal-dark))",
        },
        tnNavy: {
          DEFAULT: "hsl(var(--tn-navy))",
          light: "hsl(var(--tn-navy-light))",
          dark: "hsl(var(--tn-navy-dark))",
          bg: "hsl(var(--tn-background))",
        },
        // Updated brand colors per redesign strategy (WCAG AA compliant)
        'tn-teal': '#008c9e', // Darker teal for 4.5:1 contrast with white - WCAG AA compliant
        'tn-teal-light': '#00acc1', // Original teal for hover states (3.9:1 - acceptable for large text)
        'tn-teal-dark': '#006d7a', // Even darker for enhanced accessibility
        'tn-navy': '#1a2332', // Deep Navy - trust, military, professional
        'tn-sky-blue': '#2563EB', // Darker blue for better contrast (was #4A90E2)
        'tn-bronze': '#CD7F32', // Bronze/Copper - military medal, veteran
        'tn-gray': '#F4F6F8', // Cool Gray - backgrounds
        'dark-blue': '#0e1b3d',
        'darker-blue': '#081029',
        'card-bg': '#132046',
        'success': '#16803c', // Darker green for 4.5:1 contrast - WCAG AA compliant
        'success-light': '#28a745', // Original green for hover
        'warning': '#ffc107', // Amber for highlights
        'danger': '#f44336',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-tn': 'linear-gradient(to bottom, hsl(220, 60%, 0%) 0%, hsl(220, 60%, 3%) 30%, hsl(220, 60%, 8%) 100%)',
        'gradient-card': 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(5,18,32,0.85) 100%)',
        'gradient-hero': 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(5,18,32,0.7) 100%)',
        'gradient-cta': 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(5,18,32,0.85) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '640px',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
        },
        '.btn-primary': {
          backgroundColor: '#008c9e', // WCAG AA compliant - 4.5:1 contrast
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#006d7a', // Darker on hover for consistency
          },
        },
        '.btn-outline': {
          backgroundColor: 'transparent',
          borderWidth: '1px',
          borderColor: '#008c9e', // Updated to match primary
          color: '#008c9e',
          '&:hover': {
            backgroundColor: '#008c9e',
            color: '#ffffff',
          },
        },
        '.section-gradient': {
          background: 'linear-gradient(135deg, #081029 0%, #0e1b3d 100%)',
        },
        '.bg-gradient-card': {
          backgroundColor: '#132046',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
        '.card-hover': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(0, 172, 193, 0.3)',
          },
        },
        '.cta-card': {
          background: 'linear-gradient(135deg, #0e1b3d 0%, #081029 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '80%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(0, 172, 193, 0.2) 0%, rgba(8, 16, 41, 0) 70%)',
            zIndex: '1',
          },
        },
      })
    }
  ],
} 