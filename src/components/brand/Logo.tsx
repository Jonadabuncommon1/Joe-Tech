import React from 'react';

/**
 * The Joe Tech mark.
 *
 * This is Joe's own artwork (`public/Logo.PNG`), cropped to the squircle with
 * the navy backdrop masked out so it sits cleanly on light and dark surfaces.
 * See `scripts/` notes in the README for how the derived sizes are produced.
 */
export const LogoMark: React.FC<{ className?: string; title?: string }> = ({
  className = 'h-10 w-10',
  title = 'Joe Tech',
}) => (
  <img
    src="/logo-mark.png"
    alt={title}
    width={512}
    height={512}
    className={`object-contain ${className}`}
  />
);

/**
 * The full "Main Logo" lockup — mark plus wordmark, as one image.
 *
 * Single flat PNG, `public/brand/joe-tech-logo.png` (2026 refresh, the
 * blocky "JOE TECH" wordmark), white background left in rather than
 * extracted to transparency: both places this renders, the navbar pill and
 * the footer, are plain white surfaces now that dark mode has been removed
 * from the site entirely, so the white background sits flush with no
 * visible seam. There is no dark-surface tint to swap to any more, one
 * image is enough.
 */
export const LogoLockup: React.FC<{ className?: string; title?: string }> = ({
  className = 'h-9',
  title = 'Joe Tech',
}) => (
  <img
    src="/brand/joe-tech-logo.png"
    alt={title}
    width={1200}
    height={259}
    className={`object-contain object-left ${className}`}
    style={{ aspectRatio: '1200 / 259' }}
  />
);

interface LogoProps {
  /** Hide the "Joe Tech" wordmark and show the squircle alone. */
  markOnly?: boolean;
  className?: string;
  markClassName?: string;
  /** Wordmark colour. 'auto' follows the current text colour. */
  tone?: 'auto' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { mark: 'h-8 w-8', text: 'text-xl' },
  md: { mark: 'h-10 w-10', text: 'text-2xl' },
  lg: { mark: 'h-16 w-16', text: 'text-4xl' },
};

export const Logo: React.FC<LogoProps> = ({
  markOnly = false,
  className = '',
  markClassName,
  tone = 'auto',
  size = 'md',
}) => {
  const s = sizes[size];
  const toneClass =
    tone === 'light' ? 'text-white' : tone === 'dark' ? 'text-jt-ink' : 'text-jt-ink dark:text-white';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName ?? s.mark} />
      {!markOnly && (
        <span
          className={`font-display font-semibold leading-none tracking-tight ${s.text} ${toneClass}`}
        >
          Joe Tech
        </span>
      )}
    </span>
  );
};
