import React, { useState, useEffect, useCallback } from 'react';
import BonusWindow from './components/BonusWindow';
import ActiveBonus from './components/ActiveBonus';
import './components/GemBonus.css';
import './App.css';
import './components/ActiveBonus.css';
const App = () => {
  const initialGameState = JSON.parse(localStorage.getItem('gameState')) || {
    gemstones: { ruby: 0, sapphire: 0, emerald: 0 },
    money: 0,
    upgradeLevel: 0,
    gemstoneUpgradeLevel: 0,
    upgradePrice: 100,
    gemstoneUpgradePrice: 200,
  };

  const loadedState = JSON.parse(localStorage.getItem('gameState')) || initialGameState;

  const safeState = {
    ...initialGameState,
    ...loadedState,
    gemstones: {
      ...initialGameState.gemstones,
      ...(loadedState.gemstones || {}),
    },
  };

  const [gemstones, setGemstones] = useState(initialGameState.gemstones);
  const [money, setMoney] = useState(initialGameState.money);
  const [upgradeLevel, setUpgradeLevel] = useState(initialGameState.upgradeLevel);
  const [gemstoneUpgradeLevel, setGemstoneUpgradeLevel] = useState(initialGameState.gemstoneUpgradeLevel);
  const [upgradePrice, setUpgradePrice] = useState(initialGameState.upgradePrice);
  const [gemstoneUpgradePrice, setGemstoneUpgradePrice] = useState(initialGameState.gemstoneUpgradePrice);
  const [bet, setBet] = useState(0);

  const [lastSpinTime, setLastSpinTime] = useState(Date.now());
  const [activeBonus, setActiveBonus] = useState(null);
  const [activeBonusEndTime, setActiveBonusEndTime] = useState(null);

  const [betValue, setBetValue] = useState(0);
  const [betDisplay, setBetDisplay] = useState('0.00');

  const handleBetChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(inputValue);
    
    if (!isNaN(numericValue)) {
      setBetValue(numericValue);
      setBetDisplay(inputValue);  // Display unformatted input
    } else {
      setBetValue(0);
      setBetDisplay('');  // Allow empty input
    }
  };

  const formatBetDisplay = () => {
    setBetDisplay(formatNumber(betValue));
  };

  const activateBonus = useCallback((bonusType) => {
    const endTime = Date.now() + 30000; // 30 seconds from now
    setActiveBonus(bonusType);
    setActiveBonusEndTime(endTime);
    setTimeout(() => {
      setActiveBonus(null);
      setActiveBonusEndTime(null);
    }, 30000);
  }, []);

  const formatNumber = (number) => {
    if (typeof number !== 'number') {
      console.error('Invalid number:', number);
      return '0.00';
    }
  
    const abbreviations = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg'];
    
    // Handle numbers less than 100,000
    if (number < 1e5) {
      return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  
    // Handle larger numbers
    const tier = Math.log10(Math.abs(number)) / 3 | 0;
    if (tier === 0) return number.toString();
  
    const scale = Math.pow(10, tier * 3);
    const scaled = number / scale;
  
    return scaled.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + abbreviations[tier];
  };


  const applyLuckyUpgrade = useCallback(() => {
    const gemstones = ['ruby', 'sapphire', 'emerald'];
    const luckyGemstone = gemstones[Math.floor(Math.random() * gemstones.length)];
    
    setGemstoneMultipliers(prev => ({
      ...prev,
      [luckyGemstone]: prev[luckyGemstone] + 0.5
    }));

    setActiveBonus(`Lucky Upgrade: ${luckyGemstone.charAt(0).toUpperCase() + luckyGemstone.slice(1)} +50%`);
    setTimeout(() => setActiveBonus(null), 3000); // Display the bonus message for 3 seconds
  }, []);

  const bonuses = [
    { id: 1, name: '2x Sale Price (30s)', action: () => activateBonus('2x Sale Price') },
    { id: 2, name: '1000 Emeralds', action: () => setGemstones(prev => ({ ...prev, emerald: prev.emerald + 1000 })) },
    { id: 3, name: 'Auto-Gain (30s)', action: () => activateBonus('Auto-Gain') },
  ];

  const resetGame = () => {
    localStorage.removeItem('gameState'); // this will remove the saved game state from local storage
    setGemstones({ ruby: 0, sapphire: 0, emerald: 0 }); // reset gemstones
    setMoney(0); // reset money
    setUpgradeLevel(0); // reset upgradeLevel
    setGemstoneUpgradeLevel(0); // reset gemstoneUpgradeLevel
    setUpgradePrice(100); // reset upgradePrice
    setGemstoneUpgradePrice(200); // reset gemstoneUpgradePrice
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setGemstones(gemstones => {
        const bonusMultiplier = activeBonus === 'tenGain' ? 10 : 1;
        return {
          ruby: gemstones.ruby + (0.75 + upgradeLevel * 0.25) * bonusMultiplier,
          sapphire: gemstones.sapphire + (0.3 + upgradeLevel * 0.1) * bonusMultiplier,
          emerald: gemstones.emerald + (0.2 + upgradeLevel * 0.05) * bonusMultiplier,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [upgradeLevel, activeBonus]);

  const gemstoneValues = {
    ruby: 5,
    sapphire: 10,
    emerald: 20,
  };

  const calculateSalePrice = (gemstone) => {
    const basePrice = gemstoneValues[gemstone] * (gemstoneUpgradeLevel + 1);
    const bonusMultiplier = activeBonus === 'doubleSale' ? 2 : 1;
    return basePrice * bonusMultiplier;
  };


  // const buyGemstones = () => {
  //   if (money >= 10) {
  //     setGemstones(gemstones => ({ ...gemstones, ruby: gemstones.ruby + 1 }));
  //     setMoney(money => money - 10);
  //   } else {
  //     alert("Not enough money to buy gemstones!");
  //   }
  // }

  const autoClickGemstones = useCallback(() => {
    setGemstones(prev => ({
      ...prev,
      ruby: prev.ruby + 0.25 + upgradeLevel * 0.25,
      sapphire: prev.sapphire + 0.1 + upgradeLevel * 0.1,
      emerald: prev.emerald + 0.05 + upgradeLevel * 0.05,
    }));
  }, [upgradeLevel]);

  // Add this new effect for auto-clicking
  useEffect(() => {
    let interval;
    if (activeBonus === 'Auto-Gain') {
      interval = setInterval(() => {
        autoClickGemstones();
      }, 75); // Auto-click every 100 milliseconds (10 times per second)
    }
    return () => clearInterval(interval);
  }, [activeBonus, autoClickGemstones]);

  const sellAllIndGemstones = (gemstone) => {
  const amount = gemstones[gemstone];
  if (amount > 0) {
    setGemstones(prevGemstones => ({
      ...prevGemstones,
      [gemstone]: 0
    }));
    setMoney(prevMoney => prevMoney + calculateSalePrice(gemstone) * amount);
  } else {
    alert(`You have no ${gemstone}s to sell!`);
  }
}
  
  const sellAllGemstones = () => {
    const totalMoneyFromSale = gemstones.ruby * calculateSalePrice('ruby') +
                               gemstones.sapphire * calculateSalePrice('sapphire') +
                               gemstones.emerald * calculateSalePrice('emerald');
  
    setGemstones({ ruby: 0, sapphire: 0, emerald: 0 });
    setMoney(money => money + totalMoneyFromSale);
  }

  const buyUpgrade = () => {
    if (money >= upgradePrice) {
      setUpgradeLevel(upgradeLevel => upgradeLevel + 1);
      setMoney(money => money - upgradePrice);
      setUpgradePrice(upgradePrice => upgradePrice * 1.2);  
    } else {
      alert("Not enough money to buy upgrade!");
    }
  }

  const buyGemstoneUpgrade = () => {
    if (money >= gemstoneUpgradePrice) {
      setGemstoneUpgradeLevel(upgradeLevel => upgradeLevel + 1);
      setMoney(money => money - gemstoneUpgradePrice);
      setGemstoneUpgradePrice(gemstoneUpgradePrice => gemstoneUpgradePrice * 1.2);  
    } else {
      alert("Not enough money to buy gemstone upgrade!");
    }
  }
  const [betType, setBetType] = useState('ruby');

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

   
  
  const makeBet = () => {
    if (betValue < 1) {
      alert("Minimum bet is $1");
      return;
    }
  
    if (money < betValue) {
      alert("You don't have enough money to make this bet!");
      return;
    }
  
    const betConfig = {
      ruby: { odds: 0.5, payouts: [2, 2, 2, 4] },
      sapphire: { odds: 0.2, payouts: [10, 25] },
      emerald: { odds: 0.08, payouts: [50, 150] }
    };
  
    const won = Math.random() < betConfig[betType].odds;
    const payoutMultiplier = won ? betConfig[betType].payouts[Math.floor(Math.random() * betConfig[betType].payouts.length)] : -1;
  
    setMoney(prevMoney => prevMoney - betValue);
  
    if (won) {
      const winnings = betValue * payoutMultiplier;
      setMoney(prevMoney => prevMoney + winnings);
      setModalMessage(`You won the bet with a ${payoutMultiplier}x multiplier! Your payout is $${formatNumber(winnings)}.`);
      setShowModal(true);
    } else {
      setModalMessage("You lost the bet...");
      setShowModal(true);
    }
  
    setTimeout(() => setShowModal(false), 2000);
  
    
  };

  const [reels, setReels] = useState([[], [], []]); // Initialize the three reels as empty arrays


  const doubleBet = () => {
    const newBet = betValue * 2;
    if (newBet <= money) {
      setBetValue(newBet);
      setBetDisplay(formatNumber(newBet));
    } else {
      alert("You don't have enough money to double this bet!");
    }
  };

  const halveBet = () => {
    const newBet = betValue / 2;
    if (newBet >= 1) {
      setBetValue(newBet);
      setBetDisplay(formatNumber(newBet));
    } else {
      alert("Minimum bet is $1");
    }
  };
  
  const maxBet = () => {
    setBetValue(Math.floor(money));
    setBetDisplay(formatNumber(Math.floor(money)));
  };
  
  

  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify({
      gemstones,
      money,
      upgradeLevel,
      gemstoneUpgradeLevel,
      upgradePrice,
      gemstoneUpgradePrice,
    }));
  }, [gemstones, money, upgradeLevel, gemstoneUpgradeLevel, upgradePrice, gemstoneUpgradePrice]);
  

  return (
    <div>
       <ActiveBonus activeBonus={activeBonus} endTime={activeBonusEndTime} />
      <h1>Ruby Rush</h1>
      <div className="stats-display">
       <p className="money-display">Wallet: ${formatNumber(money)}</p>
       <p className="upgrade-level-display">Gain Level: {upgradeLevel}</p>
       <p className="gemstone-upgrade-level-display">Sale Price Level: {gemstoneUpgradeLevel}</p>
      </div>
      
       
      <div className="spacer-div"></div>
     
      <div className="game-content-wrapper">
          <div className='gemstone-displays'>
        <div className={`gemstone-display ruby-display ${activeBonus === 'Auto-Gain' ? 'glow' : ''}`}>
          <img src="/images/ruby.png" alt="Ruby" className="gemstone-image ruby-image"/>
          <p>Rubies:{formatNumber(gemstones.ruby)} cts</p>
          <p className="ct-amount">(${formatNumber(calculateSalePrice('ruby'))}/ct)</p>
        </div>
        <div className={`gemstone-display sapphire-display ${activeBonus === 'Auto-Gain' ? 'glow' : ''}`}>
          <img src="/images/sapphire.png" alt="Sapphire" className="gemstone-image sapphire-image"/>
          <p>Sapphires: {formatNumber(gemstones.sapphire)}  cts</p>
          <p className="ct-amount">(${formatNumber(calculateSalePrice('sapphire'))}/ct)</p>
        </div>
        <div className={`gemstone-display emerald-display ${activeBonus === 'Auto-Gain' ? 'glow' : ''}`}>
          <img src="/images/emerald.png" alt="Emerald" className="gemstone-image emerald-image"/>
          <p>Emeralds: {formatNumber(gemstones.emerald)} cts</p>
          <p className="ct-amount">(${formatNumber(calculateSalePrice('emerald'))}/ct)</p>
        </div>
      </div>

        <div className="bonus-window-container">
        <BonusWindow 
          bonuses={bonuses} 
          lastSpinTime={lastSpinTime} 
          setLastSpinTime={setLastSpinTime} 
        />
      </div>
      </div>
      
      
      <div className="main-buttons"> 
        <button className="button-ruby" onClick={() => sellAllIndGemstones('ruby')}>Sell Ruby</button>
        <button className="button-sapphire" onClick={() => sellAllIndGemstones('sapphire')}>Sell Sapphire</button>
        <button className="button-emerald" onClick={() => sellAllIndGemstones('emerald')}>Sell Emerald</button>
        <button className="button-sellAll"onClick={sellAllGemstones}>Sell All</button>
      </div>
      <button className="button-upgrade" onClick={buyUpgrade}>Increase Gain Amount (${formatNumber(upgradePrice)})</button>
      <button className="button-upgrade" onClick={buyGemstoneUpgrade}>Increase Sale Price (${formatNumber(gemstoneUpgradePrice)})</button>  
      {showModal && (
      <div className="modal-container">
        <div className="modal-backdrop"></div>
        <div className="modal-content">
          <p className="modal-message">{modalMessage}</p>
        </div>
      </div>
    )}
      <div className="bet-div">
        <label> $ </label>
        <input
          className="bet-input"
          type="text"
          value={betDisplay}
          onChange={handleBetChange}
          onBlur={formatBetDisplay}
        />
        <button className="button-halve" onClick={halveBet}>1/2</button>
        <button className="button-double" onClick={doubleBet}>2x</button>
        <button className="button-max" onClick={maxBet}>MAX</button>
        <select className="bet-select" value={betType} onChange={e => setBetType(e.target.value)}>
          <option value="ruby">Ruby (Low volatility) 4x MAX</option>
          <option value="sapphire">Sapphire (Medium volatility) 25x MAX</option>
          <option value="emerald">Emerald (High volatility) 150x MAX</option>
        </select>
        <button className="bet-button" onClick={makeBet}>Gamble</button>
      </div>
      <button className="button-reset" onClick={resetGame}>Reset Game</button>

    </div>
  )
}

export default App;


