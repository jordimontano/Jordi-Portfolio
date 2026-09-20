import { useRef, type HTMLAttributes } from 'react';
import { useSmoothCorners } from '@lisse/react';

/** Clip the visual surface while its parent retains shadows and focus rings. */
export default function SmoothSurface({ radius = 10, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useSmoothCorners(ref, { radius, smoothing: 0.6 }, { autoEffects: false });
  return <div ref={ref} className={`smooth-surface ${className}`} {...props} />;
}
