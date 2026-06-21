import { useState, useEffect, useRef, Children, cloneElement } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  stagger = 0, // Delay antar children (untuk stagger effect)
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  // Stagger children
  const childrenWithStagger = Children.map(children, (child, index) => {
    if (!child) return null;

    const style = {
      ...(child.props?.style || {}),
      transitionProperty: 'all',
      transitionDuration: '800ms',
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      transitionDelay: `${index * (stagger || 0)}ms`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible
        ? 'translateY(0) translateX(0) scale(1) rotate(0)'
        : 'translateY(30px) translateX(0) scale(0.97) rotate(0)',
      filter: isVisible ? 'blur(0px)' : 'blur(4px)',
    };

    return cloneElement(child, {
      style: { ...child.props?.style, ...style },
    });
  });

  return (
    <div ref={ref} className={className}>
      {/* Invisible trigger untuk observer */}
      <div className="h-px w-full" />
      {stagger ? childrenWithStagger : (
        <div
          className="transition-all"
          style={{
            transitionDuration: '800ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: '0ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? 'translateY(0) scale(1)'
              : 'translateY(30px) scale(0.97)',
            filter: isVisible ? 'blur(0px)' : 'blur(4px)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Pre-made variants
export function FadeUp({ children, delay = 0, ...props }) {
  return (
    <ScrollReveal {...props}>
      <div style={{ transitionDelay: `${delay}ms` }}>{children}</div>
    </ScrollReveal>
  );
}

export function StaggerChildren({ children, stagger = 80, ...props }) {
  return (
    <ScrollReveal stagger={stagger} {...props}>
      {children}
    </ScrollReveal>
  );
}