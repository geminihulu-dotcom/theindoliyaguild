import React, { useRef, useState } from 'react';
import type { GeneratedCharacter } from '../types';
import { CharacterClass, Rank } from '../types';

const classColors: Record<CharacterClass, { gradient: string; text: string; shadow: string }> = {
  [CharacterClass.MONARCH]: { gradient: 'from-purple-500 to-indigo-600', text: 'text-purple-200', shadow: 'shadow-purple-500/50' },
  [CharacterClass.ASSASSIN]: { gradient: 'from-slate-600 to-gray-800', text: 'text-slate-200', shadow: 'shadow-slate-500/50' },
  [CharacterClass.MAGE]: { gradient: 'from-blue-500 to-cyan-600', text: 'text-blue-200', shadow: 'shadow-blue-500/50' },
  [CharacterClass.HEALER]: { gradient: 'from-green-500 to-emerald-600', text: 'text-green-200', shadow: 'shadow-green-500/50' },
  [CharacterClass.TANK]: { gradient: 'from-orange-500 to-amber-600', text: 'text-orange-200', shadow: 'shadow-orange-500/50' },
  [CharacterClass.RANGER]: { gradient: 'from-teal-500 to-cyan-600', text: 'text-teal-200', shadow: 'shadow-teal-500/50' },
  [CharacterClass.FIGHTER]: { gradient: 'from-red-600 to-rose-700', text: 'text-red-200', shadow: 'shadow-red-500/50' },
  [CharacterClass.SUMMONER]: { gradient: 'from-indigo-500 to-violet-600', text: 'text-indigo-200', shadow: 'shadow-indigo-500/50' },
};

const rankColors: Record<Rank, { text: string; shadow: string, gem: string }> = {
    [Rank.S_RANK]: { text: 'text-purple-300', shadow: '0 0 15px #c084fc', gem: 'bg-purple-500' },
    [Rank.A_RANK]: { text: 'text-red-400', shadow: '0 0 10px #f87171', gem: 'bg-red-500' },
    [Rank.B_RANK]: { text: 'text-blue-400', shadow: '0 0 8px #60a5fa', gem: 'bg-blue-500' },
    [Rank.C_RANK]: { text: 'text-green-400', shadow: '0 0 6px #4ade80', gem: 'bg-green-500' },
}

interface SiblingCardProps {
    character: GeneratedCharacter;
    animationDelay: number;
    onHover: () => void;
    onCardClick: (character: GeneratedCharacter) => void;
}

const SiblingCard: React.FC<SiblingCardProps> = ({ character, animationDelay, onHover, onCardClick }) => {
  const { name, alias, title, description, class: charClass, rank, imageUrl } = character;
  const color = charClass ? classColors[charClass] : classColors.FIGHTER;
  const rankColor = rank ? rankColors[rank] : rankColors[Rank.C_RANK];

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / 20; // less extreme tilt
    const y = (clientY - top - height / 2) / 20 * -1;
    cardRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover();
  };

  return (
    <div
      className="card-wrapper card-animate"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={() => onCardClick(character)}
    >
      <div ref={cardRef} className="card-content rounded-lg overflow-hidden w-full h-full flex flex-col cursor-pointer">
        <div className="aspect-[3/4] w-full relative bg-gray-900/50 overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={`Portrait of ${name}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out" style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)'}} />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-dashed border-indigo-800 rounded-full animate-spin"></div>
                </div>
            )}
             <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#101021] to-transparent"></div>
        </div>

        <div className="p-4 pt-0 flex-grow flex flex-col">
            <div className="flex justify-between items-start -mt-8 relative z-10">
                <div className='max-w-[70%]'>
                  <h2 className="text-2xl font-bold text-gray-100 drop-shadow-lg">{name}</h2>
                  {alias && <p className="text-indigo-400 font-semibold">aka {alias}</p>}
                </div>
                {rank && (
                    <div className='text-center'>
                        <div 
                            className={`w-6 h-6 mx-auto rounded-sm ${rankColor.gem} border-2 border-white/50`}
                            style={{ boxShadow: rankColor.shadow }}
                        />
                        <p className='font-bold mt-1' style={{ color: rankColor.text, textShadow: rankColor.shadow }}>{rank}</p>
                    </div>
                )}
            </div>
            
            {charClass && (
              <span 
                className={`px-3 py-1 mt-2 text-xs font-bold rounded-full self-start bg-gradient-to-br ${color.gradient} ${color.text} ${color.shadow} shadow-lg`}
              >
                {charClass}
              </span>
            )}

            <div className="my-3 border-t border-indigo-800/30"></div>

            {title ? (
              <>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: '#a5b4fc', textShadow: '0 0 10px rgba(165, 180, 252, 0.6)'}}
                >
                  {title}
                </h3>
                <p className="text-gray-400 mt-1 italic text-sm">"{description}"</p>
              </>
            ) : (
              <p className="text-gray-500 italic">Stats are still being calculated...</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default SiblingCard;