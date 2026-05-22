declare module 'omniclip' {
  export function getComponents(): Record<string, CustomElementConstructor>
  export function registerElements(
    elements: Record<string, CustomElementConstructor>,
  ): void
}

declare namespace JSX {
  interface IntrinsicElements {
    'omni-timeline': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
    'omni-media': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
    'omni-text': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
  }
}
