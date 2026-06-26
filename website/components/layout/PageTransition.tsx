'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Start fade-out
      setTransitionStage('fadeOut');

      const timer = setTimeout(() => {
        // Swap content and fade in
        setDisplayChildren(children);
        prevPathname.current = pathname;
        setTransitionStage('fadeIn');
      }, 220); // matches the CSS fade-out duration

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <main
      className={transitionStage === 'fadeIn' ? 'page-fade-in' : 'page-fade-out'}
    >
      {displayChildren}
    </main>
  );
}
