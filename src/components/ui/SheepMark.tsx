// Brand mark of The Sheep — Calm Precision design system.
// Source : docs/design-system/index.html (template #sheep-mark-tpl).

interface SheepMarkProps {
  size?: number;
  className?: string;
}

export function SheepMark({ size = 14, className }: SheepMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="9" r="2.6" />
      <path d="M10.4 9 c1.4 -0.2 2.6 0.6 3.4 1.6 c0.6 -0.8 1.6 -1.2 2.6 -1 c1.4 0.3 2.2 1.6 1.9 3 c-0.2 0.9 -0.9 1.6 -1.7 1.9 c0.3 0.9 -0.1 2 -0.9 2.5 c-0.9 0.5 -2.1 0.3 -2.7 -0.5 c-0.6 0.5 -1.5 0.5 -2.1 0 c-0.6 0.7 -1.7 0.8 -2.4 0.2 c-0.7 -0.6 -0.8 -1.6 -0.4 -2.4 c-0.7 -0.4 -1.1 -1.1 -1.1 -1.9 c0 -1.4 1.1 -2.4 2.5 -2.4 z" />
      <circle cx="7.4" cy="9" r="0.45" fill="currentColor" stroke="none" />
      <path d="M9.5 17.5 v2" />
      <path d="M14 17.8 v2" />
    </svg>
  );
}
