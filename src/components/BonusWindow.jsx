import React, { useState, useEffect, useRef } from 'react';
import './BonusWindow.css';

const BonusWindow = ({ bonuses, lastSpinTime, setLastSpinTime }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [canSpin, setCanSpin] = useState(false);
  const windowRef = useRef(null);
  const [displayedBonuses, setDisplayedBonuses] = useState([]);

  useEffect(() => {
    const checkSpinAvailability = () => {
      const now = Date.now();
      const timeSinceLastSpin = now - lastSpinTime;
      setCanSpin(timeSinceLastSpin >= 60000); // 10 seconds for testing, change back to 600000 for 10 minutes
    };

    checkSpinAvailability();
    const interval = setInterval(checkSpinAvailability, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const spinWindow = () => {
    if (!canSpin) return;

    setSpinning(true);
    setLastSpinTime(Date.now());
    setCanSpin(false);
    setResult(null);

    const randomIndex = Math.floor(Math.random() * bonuses.length);
    const selectedBonus = bonuses[randomIndex];

    // Create a list of bonuses to display during spinning, ensuring the selected bonus is at the end
    const spinningBonuses = [selectedBonus, ...bonuses, ...bonuses, ...bonuses];
    setDisplayedBonuses(spinningBonuses);

    let startTime;
    const duration = 3000; // 3 seconds
    const totalDistance = (spinningBonuses.length - 1) * 150; // 150px is the height of each bonus item

    const animateScroll = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      windowRef.current.scrollTop = totalDistance - (easeProgress * totalDistance);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setSpinning(false);
        setResult(selectedBonus);
        selectedBonus.action();
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // Easing function for smoother animation
  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  return (
    <div className="bonus-window">
      <p className='lucky-spins-text'>Lucky Wheel</p>
      <div ref={windowRef} className="window">
        {displayedBonuses.map((bonus, index) => (
          <div key={`${bonus.id}-${index}`} className="bonus-item">
            {bonus.name}
          </div>
        ))}
      </div>
      <button onClick={spinWindow} disabled={!canSpin || spinning}>
        {canSpin ? (spinning ? 'Spinning...' : 'Spin') : '1m Cooldown'}
      </button>
      
    </div>
  );
};

export default BonusWindow;