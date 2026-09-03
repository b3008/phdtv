export function PageIntro({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="page-intro">
      <h1 className="page-title">{title}</h1>
      {lede && <p className="page-lede">{lede}</p>}
    </header>
  );
}
