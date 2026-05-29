// NorthstarLogo.jsx — reusable logo component
// A clean 8-pointed north star with a subtle compass feel

export default function NorthstarLogo({ size = 32, color = "#3B6D11", darkColor = "#97C459", isDark = false }) {
  const c = isDark ? darkColor : color;
  const s = size;
  const cx = s / 2, cy = s / 2;

  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer 4-point large star — cardinal directions */}
      <path
        d="M50 4 L56 44 L96 50 L56 56 L50 96 L44 56 L4 50 L44 44 Z"
        fill={c}
        opacity="1"
      />
      {/* Inner 4-point small star — diagonal directions, slightly transparent */}
      <path
        d="M50 18 L53 47 L82 50 L53 53 L50 82 L47 53 L18 50 L47 47 Z"
        fill={c}
        opacity="0.35"
      />
      {/* Centre dot */}
      <circle cx="50" cy="50" r="5" fill={c} opacity="0.9" />
    </svg>
  );
}

// Animated version for onboarding splash
export function NorthstarLogoAnimated({ size = 80, color = "#97C459" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 4 L56 44 L96 50 L56 56 L50 96 L44 56 L4 50 L44 44 Z"
        fill={color}
      />
      <path
        d="M50 18 L53 47 L82 50 L53 53 L50 82 L47 53 L18 50 L47 47 Z"
        fill={color}
        opacity="0.35"
      />
      <circle cx="50" cy="50" r="5" fill={color} opacity="0.9" />
    </svg>
  );
}

// Favicon-ready static export for public/
export const LOGO_SVG_STRING = `<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="22" fill="#181816"/>
  <path d="M50 4 L56 44 L96 50 L56 56 L50 96 L44 56 L4 50 L44 44 Z" fill="#97C459"/>
  <path d="M50 18 L53 47 L82 50 L53 53 L50 82 L47 53 L18 50 L47 47 Z" fill="#97C459" opacity="0.35"/>
  <circle cx="50" cy="50" r="5" fill="#97C459" opacity="0.9"/>
</svg>`;
