const LETTERS = [
  { ch: "S", rot: -13 },
  { ch: "E", rot: 9 },
  { ch: "F", rot: -8 },
  { ch: "A", rot: 12 },
] as const;

const MOTTO_WORDS = ["Prave", "stvari", "na", "pravi", "način."] as const;

export function HeroIntro() {
  return (
    <header className="intro" id="sefa-intro">
      <div className="intro__stage">
        <div className="intro__inner">
          <h1 className="intro__word" aria-label="SEFA">
            {LETTERS.map((letter, i) => (
              <span
                key={letter.ch}
                className="intro__letter"
                style={{ "--r-from": `${letter.rot}deg`, "--i": i } as React.CSSProperties}
                aria-hidden="true"
              >
                <span id={`logo-${letter.ch.toLowerCase()}-source`}>{letter.ch}</span>
                {i === 0 && (
                  <span className="intro__cap">
                    <svg viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet">
                      <path pathLength={100} d="M3 12 16 6l13 6-13 6z" />
                      <path pathLength={100} d="M8 14.5V20c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-5.5" />
                    </svg>
                  </span>
                )}
              </span>
            ))}
          </h1>

          <p className="intro__line">
            {MOTTO_WORDS.map((word, i) => (
              <span key={word} style={{ "--i": i } as React.CSSProperties}>
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
    </header>
  );
}
