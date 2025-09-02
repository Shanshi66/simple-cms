# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the @repo/ui package.

## Development Commands

### Package Development

- `pnpm build` - Compile TypeScript to build output
- `pnpm check-types` - Run TypeScript type checking without emitting files
- `pnpm lint` - Run ESLint with shared configuration
- `pnpm format` - Format files with Prettier

### From Root Directory

- `pnpm --filter=@repo/ui build` - Build UI package from monorepo root
- `pnpm --filter=@repo/ui check-types` - Type check UI package from root

## Package Architecture

### Component Organization

**shadcn/ui Kit (`src/kit/shadcn/`)**

- `button.tsx` - Button component with CVA variants (default, destructive, outline, secondary, ghost, link)
- `dialog.tsx` - Modal dialog components built on Radix UI
- `dropdown-menu.tsx` - Dropdown menu components built on Radix UI
- `navigation-menu.tsx` - Navigation menu components built on Radix UI
- `select.tsx` - Select dropdown components built on Radix UI

**Block Components (`src/components/blocks/`)**

- `feature/simple.tsx` - Feature section with icon grid layout using Heroicons
- `header/simple-center.tsx` - Header block components
- `hero/simple.tsx` - Hero section components

**Common Components (`src/components/common/`)**

- `locale-link.tsx` - Internationalized Link component
- `locale-switcher.tsx` - Language switcher using dropdown menu with flags
- `logo.tsx` - Logo component
- `mode-switcher.tsx` - Theme switcher component
- `page-container.tsx` - Page layout container

**Providers (`src/provider/`)**

- `theme.tsx` - Theme context provider supporting dark/light/system modes

### Key Dependencies

**UI Framework:**

- **Radix UI**: Headless components (dialog, dropdown-menu, navigation-menu, select, slot, portal)
- **Headless UI**: Additional headless components
- **Lucide React**: Icon library (preferred over Heroicons for kit components)
- **Heroicons**: Used in block components for feature sections

**Styling:**

- **Tailwind CSS 4**: Utility-first styling with OKLCH color system
- **Class Variance Authority (CVA)**: Component variant management
- **clsx + tailwind-merge**: Conditional styling via `cn()` utility

**Animation & Effects:**

- **tw-animate-css**: Animation utilities
- **react-remove-scroll**: Scroll management for modals

### Export Strategy

The package uses path-based exports defined in `package.json:48-58`:

- `@repo/ui/utils` → `src/lib/utils.ts` (cn utility)
- `@repo/ui/lib/utils` → `src/lib/utils.ts` (alternative path)
- `@repo/ui/style.css` → `src/globals.css` (Tailwind styles)
- `@repo/ui/kit/shadcn/*` → `src/kit/shadcn/*.tsx` (shadcn components)
- `@repo/ui/components/blocks/header/*` → `src/components/blocks/header/*.tsx`
- `@repo/ui/components/blocks/hero/*` → `src/components/blocks/hero/*.tsx`
- `@repo/ui/provider/*` → `src/provider/*.tsx` (ThemeProvider)

### Styling System

**Tailwind CSS 4 Configuration:**

- Uses OKLCH color space for modern color handling
- Custom dark variant: `@custom-variant dark (&:is(.dark *))`
- CSS variables for consistent theming
- Source directive: `@source "../**/*.{ts,tsx}"` for component scanning

**shadcn/ui Configuration (`components.json`):**

- Style: "new-york" (clean, modern aesthetic)
- Base color: "neutral"
- CSS variables: enabled for theme customization
- Icon library: Lucide React
- Component aliases point to `@/kit/shadcn` directory

### Component Patterns

**Button Component Pattern:**

- Uses CVA for variant management
- Supports `asChild` prop via Radix Slot
- Comprehensive focus states and accessibility
- Size variants: default, sm, lg, icon

**Locale Integration:**

- Components support i18n via `@repo/types/i18n`
- Uses React Router for navigation with locale handling
- Flag emojis and translated names for language display

**Theme Integration:**

- ThemeProvider manages dark/light/system modes
- CSS class-based theme switching on document root
- System theme detection via `prefers-color-scheme`

### Development Guidelines

**Adding New Components:**

1. Place shadcn/ui components in `src/kit/shadcn/`
2. Place block/layout components in appropriate `src/components/blocks/` subdirectory
3. Place common/utility components in `src/components/common/`
4. Update `package.json` exports for new component paths
5. Follow existing patterns: CVA for variants, cn() for styling, proper TypeScript types

**Component Conventions:**

- Use `cn()` utility from `@/lib/utils` for conditional styling
- Export both component and variant functions (e.g., `Button, buttonVariants`)
- Support `asChild` prop for polymorphic components
- Include proper ARIA attributes and focus management
- Use OKLCH color variables for theme consistency

**Styling Guidelines:**

- Use Tailwind utilities, avoid custom CSS unless necessary
- Follow existing color variable naming in `src/globals.css`
- Use `dark:` prefix for dark mode styles
- Prefer semantic color tokens over hardcoded colors

### Type Definitions

Located in `src/types/index.d.ts`:

- `MenuItem` - Navigation item structure with authorization support
- `ThemeMessage` - Theme-related i18n message structure

### Design System Principles

**Color Usage Guidelines:**

The package uses semantic color tokens based on content hierarchy and interaction patterns:

- **Primary Content**: Use `foreground` for main text and content
- **Secondary Content**: Use `muted-foreground` for helper text, descriptions, labels, placeholders, disabled states, and footer information
- **Interactive Elements**:
  - `primary` / `primary-foreground` for main actions, CTA buttons, important links
  - `secondary` / `secondary-foreground` for secondary actions and auxiliary operations
- **State Indicators**:
  - `accent` / `accent-foreground` for emphasis, selected states, and highlighted content
  - `destructive` / `destructive-foreground` for dangerous actions, delete buttons, error states
- **Container Elements**:
  - `card` / `card-foreground` for content blocks, form containers, and card components
  - `popover` / `popover-foreground` for dropdown menus, tooltips, and dialog overlays
- **Form Controls**:
  - `input` for input field backgrounds
  - `border` for borders, separators, and card outlines
  - `ring` for focus states and keyboard navigation indicators
- **Data Visualization**: `chart-1` through `chart-5` for different data series in visualizations
- **Sidebar Navigation**: Use `sidebar-*` variants for navigation components

**Color Token Philosophy:**

- Choose colors based on semantic meaning rather than visual appearance
- `muted` indicates "reduced importance" or "supporting information"
- `destructive` indicates "potentially harmful actions"
- `accent` indicates "emphasis" or "selected state"
- This approach ensures automatic theme adaptation and maintains proper contrast ratios

**OKLCH Color System:**

- All colors use OKLCH color space for perceptually uniform color relationships
- Each semantic color has both base and foreground variants for optimal contrast
- Dark mode variants automatically maintain accessibility standards

### Integration Notes

- Components are designed for React Router 7 integration
- i18next support is built into locale components
- Theme provider works with server-side rendering
- All components support TypeScript with proper type exports
