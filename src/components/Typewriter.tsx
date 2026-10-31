import { useEffect, useState, useRef } from 'react';

interface TypewriterProps {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  onDone?: () => void;
}

export default function Typewriter({ lines, speed = 45, lineDelay = 600, onDone }: TypewriterProps) {
  const [lineIdx, setLineIdx]   = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [revealed, setRevealed] = useState<string[]>(['']);
  const [done, setDone]         = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (done) return;
    if (lineIdx >= lines.length) {
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    const currentLine = lines[lineIdx];

    // Empty line — skip typing, just advance after a short pause
    if (currentLine === '') {
      const t = setTimeout(() => {
        setRevealed(prev => [...prev, '']);
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, lineDelay * 0.5);
      return () => clearTimeout(t);
    }

    if (charIdx < currentLine.length) {
      const t = setTimeout(() => {
        setRevealed(prev => {
          const copy = [...prev];
          copy[lineIdx] = currentLine.slice(0, charIdx + 1);
          return copy;
        });
        setCharIdx(c => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      // Line fully typed — move to next
      const t = setTimeout(() => {
        setRevealed(prev => [...prev, '']);
        setLineIdx(l => l + 1);
        setCharIdx(0);
      }, lineDelay);
      return () => clearTimeout(t);
    }
  }, [charIdx, lineIdx, lines, speed, lineDelay, done]);

  const activeLine = lineIdx < lines.length ? lineIdx : lines.length - 1;

  return (
    <>
      {revealed.map((text, i) => {
        const isActive = i === activeLine && !done;
        const isEmpty  = lines[i] === '';
        return (
          <p key={i} style={isEmpty ? { height: '0.55em' } : undefined}>
            {text}
            {isActive && !isEmpty && <span className="cursor" />}
          </p>
        );
      })}
    </>
  );
}
