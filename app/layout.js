import './globals.css';

export const metadata = {
  title: 'Spark - Swipe & Match',
  description: 'A simple Tinder-like dating app demo built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <a href="/" className="brand">? Spark</a>
            <nav className="nav">
              <a href="/swipe">Swipe</a>
              <a href="/matches">Matches</a>
              <a href="https://agentic-41ccb887.vercel.app" target="_blank" rel="noreferrer">Prod</a>
            </nav>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">Made with Next.js ? Demo only</footer>
        </div>
      </body>
    </html>
  );
}
