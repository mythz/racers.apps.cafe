import React from 'react';

interface CountdownProps {
  count: number;
}

export const Countdown: React.FC<CountdownProps> = ({ count }) => {
  const displayText = count > 0 ? count.toString() : 'GO!';

  return (
    <div className="countdown-overlay">
      <div className="countdown-text">{displayText}</div>
    </div>
  );
};
