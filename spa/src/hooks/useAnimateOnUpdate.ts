import { CSSProperties } from "preact";
import { useEffect, useState } from "preact/hooks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAnimateOnUpdate(dependency: any, animationName: string, animationDuration: string, animationTimingFunction: string): CSSProperties {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (dependency !== undefined) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [dependency]);

  return animate ? {
    animationName,
    animationTimingFunction,
    animationDuration
  } : {} ;
}
