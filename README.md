# FilmGen

FilmGen is a local-first creative studio for building visual direction, directing shots, and editing a first cut.

## Design system

- **Tokens:** semantic CSS variables in `app/globals.css` control surfaces, text, accents, spacing, radii, elevation, and motion.
- **Primitives:** use the stable components in `components/ui` as base controls; compose product UI from semantic panels, media cards, dialogs, empty states, and status states instead of adding a component library.
- **Motion:** transitions are short and functional. Every new effect must respect `prefers-reduced-motion`.
- **Data seams:** UI depends on typed local adapters and Zustand today. Provider, payment, export, and cloud implementations remain swappable interfaces.

## Local demo

The app starts without credentials. Demo mode keeps projects and preferences in browser storage; real service calls are explicitly unavailable rather than simulated as completed backend work.
