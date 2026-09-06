interface PageIntroProps {
  /** Small slanted label above the title, e.g. "Special issue". */
  kicker?: string;
  title: string;
  /** Trailing words of the title set in the live red, e.g. "watch live". */
  highlight?: string;
  lede?: string;
}

export function PageIntro({ kicker, title, highlight, lede }: PageIntroProps) {
  return (
    <header className="page-intro">
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 className="page-title">
        {title}
        {highlight && (
          <>
            {' '}
            <span className="page-title-accent">{highlight}</span>
          </>
        )}
      </h1>
      {lede && <p className="page-lede">{lede}</p>}
    </header>
  );
}
