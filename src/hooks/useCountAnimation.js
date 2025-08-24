// src/hooks/useCountAnimation.js
import { useState, useEffect, useRef } from 'react';

const useCountAnimation = (targetValue, duration = 1500) => {
  const [count, setCount] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    setCount(0); // Reset count when targetValue changes

    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const progress = (currentTime - startTimeRef.current) / duration;

      if (progress < 1) {
        setCount(Math.min(targetValue, Math.floor(progress * targetValue)));
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [targetValue, duration]);

  return count;
};

export default useCountAnimation;