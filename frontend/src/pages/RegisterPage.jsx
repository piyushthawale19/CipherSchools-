// ============================================================
// pages/RegisterPage.jsx
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { registerUser } from "../../api/authApi";
import { setAccessToken } from "../../api/axiosInstance";
import { getMe } from "../../api/authApi";
import Button from "../../components/shared/Button";
import ErrorMessage from "../../components/shared/ErrorMessage";
import { parseError } from "../../utils/errorParser";

// Simple strength scorer
const scorePassword = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_VARIANTS = ["", "1", "2", "3", "4"];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = password ? scorePassword(password) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      // Register → then immediately log in
      await registerUser({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
      await login(email.trim(), password);
      navigate("/", { replace: true });
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

        <h1 className="auth-card__heading">Create account</h1>
        <p className="auth-card__subheading">Start mastering SQL today</p>

        <ErrorMessage message={error} onDismiss={() => setError("")} />

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alice"
              autoComplete="name"
              required
              disabled={isLoading}
            />
          </div>

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
              {password && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.75rem",
                    color: "var(--placeholder)",
                  }}
                >
                  {STRENGTH_LABELS[strength]}
                </span>
              )}
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
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

            {password && (
              <div className="strength-meter">
                <div className="strength-meter__bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`strength-meter__bar ${strength >= n ? `strength-meter__bar--active-${n}` : ""}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="auth-card__submit">
            <Button
              type="submit"
              variant="primary"
              full
              loading={isLoading}
              disabled={isLoading || !displayName || !email || !password}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
