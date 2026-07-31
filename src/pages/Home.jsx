import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <main className="home">

      {!user ? (
        /* ── Logged-Out Hero ── */
        <section className="hero">
          <h1>
            Organize Your Work with{" "}
            <span className="gradient-text">Kanban</span>
          </h1>

          <p className="hero-subtitle">
            Manage projects, track tasks, and collaborate efficiently using a
            simple drag-and-drop Kanban board.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <button className="btn-hero-primary">Get Started →</button>
            </Link>
            <Link to="/login">
              <button className="btn-hero-secondary">Login</button>
            </Link>
          </div>
        </section>
      ) : (
        /* ── Logged-In Hero ── */
        <section className="hero">

          <h1>
            Welcome back,{" "}
            <span className="gradient-text">
              {user.fullName?.split(" ")[0] || user.username}!
            </span>
          </h1>

          <p className="hero-subtitle">
            Ready to continue working? Open one of your boards and keep making
            progress. Experience precision workflow management designed for
            high-performance teams.
          </p>

          <div className="hero-buttons">
            <Link to="/boards">
              <button className="btn-hero-primary">Go to Boards</button>
            </Link>
            <Link to="/settings">
              <button className="btn-hero-secondary">Settings</button>
            </Link>
          </div>
        </section>
      )}

      {/* ── Features Section ── */}
      <section className="features">
        <h2>Features</h2>
        <div className="features-divider" />

        <div className="feature-list">
          <div className="feature-card">
            <div className="feature-card-icon">⬛</div>
            <h3>Create Boards</h3>
            <p>Create multiple boards for different projects and teams.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">✅</div>
            <h3>Manage Tasks</h3>
            <p>Keep track of tasks using To Do, Doing, and Done columns.</p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📅</div>
            <h3>Stay Organized</h3>
            <p>Monitor progress, assign members and improve productivity.</p>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;