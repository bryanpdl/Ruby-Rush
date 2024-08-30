import React, { useState } from 'react';
import rubyImg from 'images/bbryan_High_resolution_render_intricate_cut_ruby_gems_vibrant_c_6f733ba0-441a-469a-add3-fdc1f02f73d7-removebg-preview.png'; 
import sapphireImg from 'images/bbryan_High_resolution_render_intricate_cut_blue_sapphire_gems__28782488-ac6b-42bf-8126-b5912232b7fc-removebg-preview.png'; 
import emeraldImg from 'images/bbryan_High_resolution_render_intricate_cut_emerald_gems_vibran_263780ba-d76c-4515-802f-f16c72297318-removebg-preview.png'; 

const SlotMachine = ({ onClose, makeBet, bet }) => {
    const [slots, setSlots] = useState(['ruby', 'ruby', 'ruby']);
    const gemstones = ['ruby', 'sapphire', 'emerald'];
    const gemImages = {ruby: rubyImg, sapphire: sapphireImg, emerald: emeraldImg};
  
    const spin = () => {
      const newSlots = slots.map(() => gemstones[Math.floor(Math.random() * gemstones.length)]);
      setSlots(newSlots);
      const won = newSlots.every((gemstone, i, arr) => gemstone === arr[0]);
      makeBet(won);
    };
  
    return (
      <div className="slot-machine">
        {slots.map((slot, i) => <img key={i} src={gemImages[slot]} alt={slot} />)}
        <p>{`Bet: ${bet}`}</p>
        <button onClick={spin}>Spin</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
  
  export default SlotMachine;