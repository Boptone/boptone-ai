# Boptone Design System

## Core Principles

### Visual Identity
- **Xerox/Photocopy Aesthetic** - Subtle, light gradients that evoke photocopied documents
- **Bold Typography** - Reserved for page titles and headers only
- **Minimal Animation** - ONLY on homepage hero section
- **No Icons/Emojis** - Clean, text-based interface (future-forward, not old internet)
- **100% Cohesion** - Artists never visually leave the Boptone ecosystem

### Typography
- **Font Family**: System font stack (consistent across all pages)
- **Page Titles**: Bold, large (text-4xl to text-6xl)
- **Section Headers**: Bold, medium (text-2xl to text-3xl)
- **Body Text**: Regular weight (text-base to text-lg)
- **Small Text**: Regular weight (text-sm)

### Colors
- **Background**: White (#ffffff) or very light gray (#f5f5f5, #fafafa)
- **Text**: Dark gray/black (#1a1a1a, #333333)
- **Gradients**: Xerox-style (light gray to white, subtle transitions)
- **Accents**: Minimal use, black or dark gray for emphasis
- **Borders**: Light gray (#e5e5e7, #d1d1d6)

### Spacing
- **Section Padding**: py-16 to py-24 (consistent vertical rhythm)
- **Container Max Width**: max-w-7xl (centered with mx-auto px-4)
- **Card Padding**: p-6 to p-8
- **Gap Between Elements**: gap-4 to gap-8

### Components
- **Buttons**: Pill-shaped (rounded-full), solid black or outline
- **Cards**: Rounded corners (rounded-xl), subtle shadow, white background
- **Forms**: Clean inputs with border, no fancy styling
- **Navigation**: Simple, text-based, no icons

### Layout
- **Grid**: Responsive grid layouts (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- **Flexbox**: For horizontal arrangements and centering
- **Container**: Always use .container class for consistent width/padding

### Animation Rules
- **Homepage Hero ONLY**: Rotating text animation allowed
- **All Other Pages**: NO animations, transitions, or scroll effects
- **Hover States**: Simple opacity or color changes only

### What to AVOID
- ❌ Icons from any library (Lucide, Font Awesome, etc.)
- ❌ Emojis in any context
- ❌ Vibrant gradients (purple, blue, pink)
- ❌ Animations outside homepage hero
- ❌ Decorative elements
- ❌ GIFs
- ❌ Complex shadows or 3D effects

### Implementation Checklist
- [ ] Remove all icon imports (lucide-react, etc.)
- [ ] Remove all emoji usage
- [ ] Remove animations except homepage hero
- [ ] Apply xerox gradients where appropriate
- [ ] Ensure bold typography for headers only
- [ ] Test cohesion across all pages
