import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <main className="home">

      {!user ? (
        <section className="hero">
          <h1>Organize Your Work with Kanban</h1>

          <p>
            Manage projects, track tasks, and collaborate efficiently using a
            simple drag-and-drop Kanban board.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <button>Get Started</button>
            </Link>

            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="hero">
          <h1>Welcome back, {user.fullName}!</h1>

          <p>
            Ready to continue working? Open one of your boards and keep making
            progress.
          </p>

          <div className="hero-buttons">
            <Link to="/boards">
              <button>Go to Boards</button>
            </Link>

            <Link to="/settings">
              <button>Settings</button>
            </Link>
          </div>
        </section>
      )}

      <section className="features">
        <h2>Features</h2>

        <div className="feature-list">
          <div className="feature-card">
            <h3>Create Boards</h3>
            <p>Create multiple boards for different projects.</p>
          </div>

          <div className="feature-card">
            <h3>Manage Tasks</h3>
            <p>Keep track of tasks using To Do, Doing, and Done columns.</p>
          </div>

          <div className="feature-card">
            <h3>Stay Organized</h3>
            <p>Monitor progress and improve productivity.</p>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;