// ============================================================
// pages/LoginPage.jsx
// ============================================================

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/shared/Button";
import ErrorMessage from "../../components/shared/ErrorMessage";
import { parseError } from "../../utils/errorParser";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(parseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-card__logo">
          <div className="auth-card__logo-icon">⚡</div>
          <span className="auth-card__logo-text">CipherSQL</span>
        </Link>

        <h1 className="auth-card__heading">Welcome back</h1>
        <p className="auth-card__subheading">Sign in to continue learning</p>

        <ErrorMessage message={error} onDismiss={() => setError("")} />

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-wrapper__toggle"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="auth-card__submit">
            <Button
              type="submit"
              variant="primary"
              full
              loading={isLoading}
              disabled={isLoading || !email || !password}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="auth-card__footer">
          Don&rsquo;t have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
