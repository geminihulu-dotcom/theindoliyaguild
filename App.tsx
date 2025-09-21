import React, { useState, useEffect, useRef } from 'react';
import { SIBLINGS } from './constants';
import type { GeneratedCharacter } from './types';
import { generateCharacterInfo, generateCharacterImage } from './services/geminiService';
import SiblingCard from './components/SiblingCard';
import LoadingScreen from './components/LoadingScreen';

// A simple component for the particle background effect
const ParticleBackground: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('particle-container');
    if (!container || container.children.length > 0) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
      container.appendChild(particle);
    }
  }, []);

  return <div id="particle-container"></div>;
};


const App: React.FC = () => {
  const [characters, setCharacters] = useState<GeneratedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('[ AWAKENING... ]');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const awakeningSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

  const [subtitle, setSubtitle] = useState('');
  const fullSubtitle = '[ System Alert: Hunters Awakened ]';

  // Effect to set up audio elements and their volumes once on mount
  useEffect(() => {
    bgMusicRef.current = document.getElementById('background-music') as HTMLAudioElement;
    awakeningSoundRef.current = document.getElementById('awakening-sound') as HTMLAudioElement;
    hoverSoundRef.current = document.getElementById('hover-sound') as HTMLAudioElement;

    if (bgMusicRef.current) bgMusicRef.current.volume = 0.1;
    if (awakeningSoundRef.current) awakeningSoundRef.current.volume = 0.4;
    if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.2;

    // Load available speech synthesis voices
    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
        }
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // Effect to control background music playback after user has interacted
  useEffect(() => {
    if (userInteracted) {
      if (isMuted) {
        bgMusicRef.current?.pause();
      } else {
        bgMusicRef.current?.play().catch(e => console.log("Browser prevented audio playback."));
      }
    }
  }, [isMuted, userInteracted]);

  const playHoverSound = () => {
    if (!isMuted && hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current.play();
    }
  };
  
  const speakQuote = (character: GeneratedCharacter) => {
    if (isMuted || !('speechSynthesis' in window) || !character.quote) return;
    
    window.speechSynthesis.cancel(); // Stop any currently playing speech
    const utterance = new SpeechSynthesisUtterance(character.quote);
    
    const isFemale = character.name.includes('Anjali');
    let selectedVoice: SpeechSynthesisVoice | undefined;

    // Intelligent Voice Selection: Find the best available voice in the browser.
    if (isFemale) {
        const femaleVoices = voices.filter(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('susan')));
        selectedVoice = femaleVoices[0];
        utterance.pitch = 1.1;
        utterance.rate = 0.85;
    } else {
        const maleVoices = voices.filter(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google')));
        if (maleVoices.length > 0) {
            // Cycle through available male voices for variety
            selectedVoice = maleVoices[(character.id - 1) % maleVoices.length];
        }
        // Vary pitch slightly for each brother to make them sound distinct
        utterance.pitch = 0.8 - ((character.id % 3) * 0.1);
        utterance.rate = 0.8;
    }
    
    // Fallback to any English voice if a specific one isn't found
    utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || null;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        // Step 1: Generate textual info
        setLoadingMessage('[ Awakening Stats... ]');
        const siblingNames = SIBLINGS.map(s => s.alias ? `${s.name} (${s.alias})` : s.name);
        const generatedData = await generateCharacterInfo(siblingNames);
        
        const initialCharacters: GeneratedCharacter[] = SIBLINGS.map(sibling => {
          const matchingData = generatedData.find(d => d.name.includes(sibling.name));
          return { ...sibling, ...matchingData };
        });
        setCharacters(initialCharacters);
        
        // Step 2: Generate images
        setLoadingMessage('[ Generating Hunter Portraits... ]');
        const imagePromises = initialCharacters.map(char => generateCharacterImage(char));
        
        const imageUrls = await Promise.all(imagePromises);

        setCharacters(currentChars => 
            currentChars.map((char, index) => ({
                ...char,
                imageUrl: `data:image/jpeg;base64,${imageUrls[index]}`,
            }))
        );

        // Allow loading screen to be skipped after a short delay
        setTimeout(() => setIsLoading(false), 500);

      } catch (err) {
        console.error("Error fetching character data:", err);
        setError("SYSTEM CORRUPTION. Failed to awaken stats. Check console and API key configuration.");
        setIsLoading(false);
      }
    };

    fetchCharacterData();
  }, []);
  
  const handleSkipLoading = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      // Play one-off awakening sound on this specific interaction
      if (!isMuted) {
        awakeningSoundRef.current?.play().catch(e => console.log("Browser prevented awakening sound."));
      }
    }
    setIsLoading(false);
  };

  const handleMuteToggle = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
    setIsMuted(!isMuted);
    window.speechSynthesis.cancel(); // Stop any speaking on mute
  };

  useEffect(() => {
    if (!isLoading && !error) {
        let i = 0;
        const typingInterval = setInterval(() => {
            setSubtitle(fullSubtitle.substring(0, i + 1));
            i++;
            if (i === fullSubtitle.length) {
                clearInterval(typingInterval);
            }
        }, 50);
        return () => clearInterval(typingInterval);
    }
  }, [isLoading, error, fullSubtitle]);


  if (isLoading) {
    return <LoadingScreen message={loadingMessage} onClick={handleSkipLoading} />;
  }

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen p-4 sm:p-8 relative">
        <main className="container mx-auto">
          <header className="text-center mb-12 relative">
             <button 
                onClick={handleMuteToggle} 
                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
             >
                {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M20 4a9 9 0 010 16M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                )}
            </button>
            <h1 className="text-4xl md:text-6xl font-bold uppercase title-glow-animation">
              The Indoliya Guild
            </h1>
            <p className="text-indigo-300 mt-4 text-lg h-7 font-mono">{subtitle}<span className="animate-ping">_</span></p>
          </header>

          {error ? (
            <div className="text-center bg-red-900/70 border-2 border-red-500 p-6 rounded-lg max-w-2xl mx-auto shadow-[0_0_20px_rgba(255,0,0,0.5)]">
              <h2 className="text-2xl font-bold text-red-300 mb-2 uppercase tracking-widest">System Error</h2>
              <p className="text-red-200 font-mono">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {characters.map((char, index) => (
                <SiblingCard 
                  key={char.id} 
                  character={char} 
                  animationDelay={index * 100} 
                  onHover={playHoverSound}
                  onCardClick={speakQuote}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default App;