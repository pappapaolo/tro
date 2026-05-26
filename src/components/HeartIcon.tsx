/**
 * Shared heart glyph used for saves / favorites.
 *
 * Path is a slightly-rounded heart at viewBox 24×24, drawn so that the
 * cusp sits at y≈8 and the tip at y≈21 — visually centered when set
 * at 18×18 or 20×20 next to text. Matches Heroicons' outline-heart
 * proportions but with a smoother dip.
 */

interface Props {
  filled?: boolean;
  size?: number;
  className?: string;
}

export default function HeartIcon({
  filled = false,
  size = 18,
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.25c-.5 0-.95-.18-1.31-.5C6.6 16.18 3 13.06 3 9.31 3 6.4 5.31 4 8.18 4c1.55 0 3.02.69 3.82 1.93C12.8 4.69 14.27 4 15.82 4 18.69 4 21 6.4 21 9.31c0 3.75-3.6 6.87-7.69 10.44-.36.32-.81.5-1.31.5Z" />
    </svg>
  );
}
