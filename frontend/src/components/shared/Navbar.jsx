// ============================================================
// components/shared/Navbar.jsx
// ============================================================

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "./Button";

export default function Navbar({ assignmentTitle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnAssignment = location.pathname.startsWith("/assignments/");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <Link to="/" className="navbar__logo-link">
          <span className="navbar__logo-icon">⚡</span>
          <span className="navbar__logo-text">CipherSQL</span>
        </Link>
      </div>

      {assignmentTitle && <h1 className="navbar__title">{assignmentTitle}</h1>}

      <nav className="navbar__actions">
        {isAuthenticated ? (
          <>
            <Link to="/" className="navbar__link">
              Dashboard
            </Link>
            <Link to="/profile" className="navbar__link">
              Profile
            </Link>
            <button
              className="navbar__avatar"
              aria-label="User menu"
              title={user?.displayName || user?.email}
            >
              {(
                user?.displayName?.[0] ||
                user?.email?.[0] ||
                "?"
              ).toUpperCase()}
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">
              Sign in
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/register")}
            >
              Sign up
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
