import { useEffect, useState } from 'react';

export function DialoguePanel({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    const timer = setInterval(() => {
      setCount(value => {
        if (value >= text.length) {
          clearInterval(timer);
          return value;
        }
        return value + 1;
      });
    }, 42);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <button className="dialogue" onClick={() => setCount(text.length)} aria-label="显示完整旅客对话">
      <span className="dialogue-mark">“</span>
      <span>{text.slice(0, count)}<i className="cursor">_</i></span>
    </button>
  );
}
