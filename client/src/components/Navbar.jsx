import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar({ active = "" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/images/logo.png" alt="CampusKart Logo" className="navbar-logo" />
        </Link>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink className={`nav-link ${active === "home" ? "active" : ""}`} to="/">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink className={`nav-link ${active === "buy" ? "active" : ""}`} to="/buy">
            Buy
          </NavLink>
        </li>
        <li>
          <NavLink className={`nav-link ${active === "sell" ? "active" : ""}`} to="/sell">
            Sell
          </NavLink>
        </li>
        {user?.role === "admin" && (
          <li>
            <NavLink className={`nav-link ${active === "admin" ? "active" : ""}`} to="/admin">
              Admin
            </NavLink>
          </li>
        )}
        <li>
          <a className="nav-link" href="/#developers-section">
            About us
          </a>
        </li>
      </ul>

      <div className="auth-buttons">
        {user ? (
          <>
            <div className="user-menu">
              <span className="user-name">Welcome, {user.username}</span>
              <div className="user-actions">
                <Link to="/dashboard" className="btn-small" title="Dashboard">
                  <i className="fas fa-user-circle"></i>
                </Link>
                <Link to="/dashboard?tab=wishlist" className="btn-small" title="Wishlist">
                  <i className="fas fa-heart"></i>
                </Link>
                <Link to="/dashboard?tab=messages" className="btn-small" title="Messages">
                  <i className="fas fa-envelope"></i>
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="btn-small" title="Admin Panel">
                    <i className="fas fa-shield-alt"></i>
                  </Link>
                )}
              </div>
            </div>
            <button
              type="button"
              className="btn-login-signup"
              style={{ background: "#e74c3c", color: "white", border: "none" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn-login-signup">
            Login/Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}
