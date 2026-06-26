'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setTransitionStage('fadeOut');

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        prevPathname.current = pathname;
        setTransitionStage('fadeIn');
      }, 220);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <main
      className={`${className} ${transitionStage === 'fadeIn' ? 'page-fade-in' : 'page-fade-out'}`}
    >
      {displayChildren}
    </main>
  );
}
