import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import ParticleBackground from './components/ParticleBackground';
import TypewriterText from './components/TypewriterText';
import Confetti from './components/Confetti';
import CursorTrail from './components/CursorTrail';
import { useAudio, AudioProvider } from './components/AudioProvider';
import InstallPWA from './components/InstallPWA';

const AppContent = () => {
  // Scene names: start (initial), intro, envelope, confession, yes, wait
  const [scene, setScene] = useState('start');
  const [yesStep, setYesStep] = useState('initial'); // 'initial', 'held', 'promised'
  const [introLineIdx, setIntroLineIdx] = useState(0);
  const [showIntroButtons, setShowIntroButtons] = useState(false);
  const [confessionLineIdx, setConfessionLineIdx] = useState(0);
  const [activeConfessionLines, setActiveConfessionLines] = useState([]);
  const [confessionPeak, setConfessionPeak] = useState(false);
  const [petalIntensity, setPetalIntensity] = useState(20);
  const [petalSpeed, setPetalSpeed] = useState(1); // multiplier
  const [finalMessageVisible, setFinalMessageVisible] = useState(false);
  const [extraFinalMessage, setExtraFinalMessage] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const { playBgm, playSfx, toggleMute, isMuted } = useAudio();
  const idleTimer = useRef(null);

  const introScript = [
    "Some feelings bloom quietly…",
    "Like petals drifting in spring air.",
    "Soft. Unexpected. Impossible to ignore."
  ];

  const confessionScript = [
    "To the Girl Who Has Stayed in My Heart for Three Years,",
    "Hi, baby. ❤️",
    "There’s something I’ve been wanting to tell you for a very long time, something I’ve kept in my heart since the day we first met online three years ago.",
    "It's funny how someone you’ve never met in person can become someone so special to you.",
    "We’ve never stood in front of each other, never had the chance to look into each other’s eyes in real life, and never shared the kind of moments that most people would consider the beginning of something beautiful.",
    "Yet, somehow, you became someone I couldn’t easily forget.",
    "I never planned to fall for you. It just happened.",
    "Maybe it was the way we talked, the way your presence made my days feel a little lighter, or the simple happiness I felt whenever I got the chance to hear from you.",
    "I don't know exactly when my feelings started growing, but I know that somewhere along the way, you became more than just a girl I met online.",
    "You became someone I genuinely cared about.",
    "Three years have passed, and a lot of things have changed since then.",
    "There were words I wanted to say but never had the courage to express, feelings I kept to myself because I didn't know how you would receive them, and moments when I wondered what would have happened if I had been honest with you from the very beginning.",
    "Maybe I was afraid of changing what we had.",
    "Maybe I was afraid that telling you how I felt would make things different between us.",
    "So, instead of saying everything I wanted to say, I kept those feelings quietly in my heart.",
    "But today, I want you to know.",
    "I like you. I really do.",
    "And it's not because I have created some perfect image of you in my mind.",
    "I know that talking online doesn't mean I know every part of who you are.",
    "There are still so many things about you that I have yet to discover, stories I haven't heard, and moments we haven't shared.",
    "But the feelings I have for you are genuine, and I would love the chance to know you more, beyond the screens that have kept us apart.",
    "I don't know what you feel about me, and I don't want you to feel pressured to give me an answer or to feel the same way just because I'm finally telling you this.",
    "I'm not writing this letter because I expect something in return.",
    "I simply want to be honest with you about something that has been a part of my heart for the past three years.",
    "If there's one thing I wish for, it's the chance to meet you someday.",
    "To finally see the person behind the voice and the messages that have become so familiar to me.",
    "To share a conversation without a screen between us and create memories that we can look back on someday.",
    "I don't know when that day will come, but it's something I quietly hope for.",
    "Until then, I'm grateful that our paths crossed, even if it was only through a screen.",
    "Out of all the people I could have met, somehow, I met you.",
    "And even though I never expected to develop feelings for someone I hadn't met in person, here I am, three years later, still wanting you to know how much you've come to mean to me.",
    "Thank you for being you.",
    "Thank you for the conversations, the little moments, and for being there.",
    "You might not realize how much those simple things have meant to me, but they have stayed with me longer than you might imagine.",
    "I don't know what the future holds for us.",
    "Maybe our paths will bring us closer, or maybe life will take us in different directions.",
    "Whatever happens, I don't regret meeting you, and I don't regret the feelings I've developed for you.",
    "Because sometimes, the most unexpected people leave the deepest impressions on our hearts, even before we ever get the chance to meet them.",
    "And you, baby, are one of those people for me.",
    "I just wanted you to know that somewhere, three years ago, a boy met a girl online, and without ever meeting her in person, he found himself falling for her.",
    "That boy was me.",
    "And this letter is everything I wish I had told you back then.",
    "With all my sincerity,",
    "The boy who fell for you three years ago. ❤️"
  ];

  const handleMouseMove = useCallback((e) => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (scene !== 'start') {
      idleTimer.current = setTimeout(() => {
        setFinalMessageVisible(true);
      }, 12000);
    }
    
    // Update mouse position for the glow breathing effect
    if (e.clientX && e.clientY) {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    }
  }, [scene]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [handleMouseMove]);

  // Intro progress
  useEffect(() => {
    if (scene === 'intro') {
      if (introLineIdx < introScript.length) {
        const step = setTimeout(() => {
          setIntroLineIdx(idx => idx + 1);
        }, 3500);
        return () => clearTimeout(step);
      } else {
        const btnStep = setTimeout(() => setShowIntroButtons(true), 1500);
        return () => clearTimeout(btnStep);
      }
    }
  }, [scene, introLineIdx]);

  const handleEnter = () => {
    playBgm(); // Scene 1 - Background music starts
    setScene('intro');
  };

  const handleOpenOption = () => {
    playSfx('sfx_click');
    playBgm();
    setScene('envelope');
  };

  const handleSealClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    playSfx('sfx_click');
    setTimeout(() => playSfx('sfx_heartbeat'), 150);
    setTimeout(() => playSfx('sfx_paper'), 350);
    setTimeout(() => {
      setScene('confession');
      setActiveConfessionLines([confessionScript[0]]);
      setIsOpening(false);
    }, 1500);
  };

  const letterRef = useRef(null);

  // Auto-scroll the letter to bottom as new lines appear
  useEffect(() => {
    if (letterRef.current) {
      letterRef.current.scrollTo({
        top: letterRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeConfessionLines]);

  const handleTypeComplete = () => {
    if (confessionLineIdx < confessionScript.length - 1) {
      setTimeout(() => {
        const nextIdx = confessionLineIdx + 1;
        const nextLine = confessionScript[nextIdx];
        setConfessionLineIdx(nextIdx);
        setActiveConfessionLines(prev => [...prev, nextLine]);

        if (nextLine === "I like you. I really do." || nextLine === "I like you.") {
          setConfessionPeak(true);
          playBgm();
          playSfx('sfx_heartbeat', 0.25);
          setPetalIntensity(50);
          setTimeout(() => {
            setConfessionPeak(false);
            setPetalIntensity(25);
          }, 2000);
        }
      }, 800);
    }
  };

  const handleYes = () => {
    playSfx('sfx_chime');
    playBgm('bgm_yes');
    setScene('yes');
    setPetalIntensity(35);
  };

  const handleHoldHand = () => {
    playSfx('sfx_heartbeat');
    setYesStep('held');
    setConfessionPeak(true); // Re-use pulse effect for glow intensity
    setTimeout(() => {
      setConfessionPeak(false);
    }, 2000);
    setTimeout(() => setExtraFinalMessage(true), 5000);
  };

  const handlePinkyPromise = () => {
    playSfx('sfx_chime');
    setYesStep('promised');
    setPetalSpeed(0.5); // Slower petals
    setTimeout(() => setExtraFinalMessage(true), 5000);
  };

  const handleTime = () => {
    playBgm('bgm_wait');
    setScene('wait');
  };

  const prevPetalsRef = useRef([]);

  const petals = useMemo(() => {
    let arr = prevPetalsRef.current;
    
    if (arr.length > petalIntensity) {
        arr = arr.slice(0, petalIntensity);
    } else if (arr.length < petalIntensity) {
        const added = Array.from({ length: petalIntensity - arr.length }).map(() => ({
            id: Math.random(),
            left: `${Math.random() * 100}vw`,
            animationDelay: `-${Math.random() * 5}s`,
            opacity: 0.4 + Math.random() * 0.4,
            scale: 0.5 + Math.random()
        }));
        arr = [...arr, ...added];
    }
    
    arr = arr.map(p => ({
        ...p,
        animationDuration: `${(8 + Math.random() * 6) / petalSpeed}s`
    }));
    
    prevPetalsRef.current = arr;
    return arr;
  }, [petalIntensity, petalSpeed]);

  const renderPetals = () => {
    return (
      <div className="petals-layer" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
        {petals.map((p) => (
          <div key={p.id} className="petal-fall" style={{
            left: p.left,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
            opacity: p.opacity,
            transform: `scale(${p.scale})`
          }} />
        ))}
      </div>
    );
  };

  return (
    <div className={`app-main ${yesStep === 'held' ? 'warm-peach' : ''}`}>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
        style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000, background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={isMuted ? "Unmute Music" : "Mute Music"}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      <CursorTrail />
      <ParticleBackground count={40} color="rgba(255, 183, 197, 0.5)" />
      
      <div 
        className={`glow-breathing ${confessionPeak ? 'pulse-active' : ''}`} 
        style={{ '--mouse-x': `${mousePos.x}%`, '--mouse-y': `${mousePos.y}%` }}
      />
      <div className="vignette" />
      <InstallPWA />

      {renderPetals(petalIntensity)}

      {scene === 'start' && (
        <div className="scene-container fade-in">
          <button onClick={handleEnter} style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.5rem', padding: '1rem 3rem', textTransform: 'none', letterSpacing: '0.1em' }}>Bloom</button>
          <p style={{ marginTop: '2rem', opacity: 0.5, fontStyle: 'italic', color: 'var(--text-main)', letterSpacing: '0.1em' }}>Romantic flow ready</p>
        </div>
      )}

      {scene === 'intro' && (
        <div className="scene-container">
          <div className="cinematic-text">
            {introScript.map((line, idx) => (
              idx <= introLineIdx && (
                <div key={idx} className="fade-line" style={{ animation: 'fadeIn 2s forwards', marginBottom: '1.5rem', opacity: 0 }}>{line}</div>
              )
            ))}
          </div>
          {showIntroButtons && (
            <div className="button-row fade-in" style={{ marginTop: '3rem', opacity: 0, animation: 'fadeIn 1s 1s forwards' }}>
              <button onClick={handleOpenOption}>💌 Open the letter</button>
            </div>
          )}
        </div>
      )}

      {scene === 'envelope' && (
        <div className="scene-container fade-in">
          <div className={`envelope-wrapper ${isOpening ? 'opening' : ''}`} onClick={handleSealClick}>
            <div className="envelope">
              <div style={{ width: '100%', height: '100%', backgroundImage: 'url(/envelope.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7 }} />
              <div className={`seal-rose ${isOpening ? 'breaking' : ''}`}>❤</div>
            </div>
          </div>
        </div>
      )}

      {scene === 'confession' && (
        <div className="scene-container fade-in">
          <div ref={letterRef} className={`letter-unfold ${confessionPeak ? 'pulse-impact' : ''}`}>
            <div style={{ textAlign: 'left' }}>
              {activeConfessionLines.map((line, idx) => (
                <TypewriterText
                  key={idx}
                  text={line}
                  speed={35}
                  onComplete={idx === confessionLineIdx ? handleTypeComplete : null}
                  className={
                    line === "I like you. I really do." ||
                    line === "I like you." ||
                    line === "That boy was me." ||
                    line.startsWith("To the Girl Who Has Stayed") ||
                    line.startsWith("The boy who fell for you")
                      ? "accent-line"
                      : ""
                  }
                />
              ))}
            </div>
            {confessionLineIdx === confessionScript.length - 1 && (
              <div className="button-row fade-in" style={{ marginTop: '1.5rem', opacity: 0, animation: 'fadeIn 1.5s forwards' }}>
                <button onClick={handleYes}>💖 Yes... I feel it too</button>
              </div>
            )}
          </div>
        </div>
      )}

      {scene === 'yes' && (
        <div className="scene-container fade-in">
          {yesStep === 'held' && <Confetti count={100} />}
          {yesStep === 'initial' ? (
            <div className="cinematic-text">
              <div className="fade-line" style={{ color: '#ff8fa3', fontStyle: 'italic' }}>You just made everything feel brighter…</div>
              <div className="fade-line" style={{ animationDelay: '2s' }}>Like the sky turning pink before sunrise.</div>
              <div className="fade-line" style={{ animationDelay: '4s' }}>I promise I won’t rush this.</div>
              <div className="fade-line" style={{ animationDelay: '6s' }}>I just want something soft and beautiful — growing slowly with you.</div>
              <div className="fade-line" style={{ animationDelay: '8s' }}>Would it be okay if I try to pursue you…</div>
              <div className="fade-line" style={{ animationDelay: '10s' }}>and see where this could gently lead us?</div>

              <div className="button-row fade-in" style={{ marginTop: '4rem', opacity: 0, animation: 'fadeIn 1.5s 11.5s forwards' }}>
                <button onClick={handleHoldHand}>� Yes</button>
                <button onClick={handleTime}>� No</button>
              </div>
            </div>
          ) : yesStep === 'held' ? (
            <div className="cinematic-text fade-in">
              <div className="fade-line">My heart feels so full right now...</div>
              <div className="fade-line" style={{ animationDelay: '2s' }}>Thank you for being you.</div>
              <div className="fade-line" style={{ animationDelay: '4s' }}>Let’s walk this path slowly, hand in hand.</div>
              <div className="fade-line accent-line" style={{ marginTop: '3rem', animationDelay: '6s' }}>I’m so happy it’s us.</div>
            </div>
          ) : (
            <div className="cinematic-text fade-in">
              <div className="pinky-icon">🤙</div>
              <div className="fade-line">Then it’s a promise.</div>
              <div className="fade-line">No rushing.</div>
              <div className="fade-line">Just something real.</div>
              {extraFinalMessage && <div className="fade-line accent-line" style={{ marginTop: '3rem' }}>I’m glad it’s you.</div>}
            </div>
          )}
        </div>
      )}

      {scene === 'wait' && (
        <div className="scene-container fade-in">
          <div className="cinematic-text">
            <div className="fade-line">That’s okay…</div>
            <div className="fade-line" style={{ animationDelay: '2s' }}>Even blossoms take time before they fully open.</div>
            <div className="fade-line" style={{ animationDelay: '4s' }}>I care more about your comfort than any answer.</div>
            <div className="fade-line" style={{ animationDelay: '6s' }}>I’ll stay right here — softly.</div>
          </div>
        </div>
      )}

      {finalMessageVisible && (
        <div className="final-glow-text">
          No matter what… I’m glad I told you.
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
