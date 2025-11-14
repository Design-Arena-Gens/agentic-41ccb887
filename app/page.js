export default function HomePage() {
  return (
    <section className="hero">
      <h1>Find your spark</h1>
      <p>Swipe right on people you like, and make a match. This is a demo app with local data and your preferences saved in your browser.</p>
      <div className="hero-cta">
        <a className="button" href="/swipe">Start swiping</a>
        <a className="button secondary" href="/matches">View matches</a>
      </div>
    </section>
  );
}
