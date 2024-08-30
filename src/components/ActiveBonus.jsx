import React, { useState, useEffect } from 'react';

const ActiveBonus = ({ activeBonus, endTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activeBonus) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBonus, endTime]);

  if (!activeBonus) return null;

  return (
    <div className="active-bonus-container">
      <div className="active-bonus">
        <p className="bonus-type">{activeBonus}</p>
        <p className="time-left">{timeLeft} seconds remaining</p>
      </div>
    </div>
  );
};

export default ActiveBonus;