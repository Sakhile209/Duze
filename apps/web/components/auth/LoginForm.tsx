'use client';

import { useState } from 'react';
import { Icon } from '../icon';

type Props = {
  onSuccess: (user: any, address: any) => void;
  onSwitchToSignup: () => void;
};

export function LoginForm({ onSuccess, onSwitchToSignup }: Props) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!emailOrPhone.trim() || !password) {
      setError('Please enter your email/phone number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Invalid credentials. Please try again.');
      }

      onSuccess(data.user, data.defaultAddress);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check your login details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <span className="brand-mark" style={{ width: 34, height: 40, margin: '0 auto 12px' }}>
          <Icon name="bag" size={20} />
        </span>
        <h2>Welcome Back</h2>
        <p className="muted">Log in to your Duze account</p>
      </div>

      {error && <div className="auth-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Email or Phone Number</label>
          <div className="input-box">
            <Icon name="user" size={16} />
            <input
              type="text"
              placeholder="example@email.com or 071 234 5678"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-box">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex-row-between">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button type="button" className="link-btn" onClick={() => alert('Password reset instructions sent')}>
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="button orange-button full-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" className="button outline-button full-btn social-btn">
          <span>🌐</span> Continue with Google
        </button>
        <button type="button" className="button outline-button full-btn social-btn" style={{ marginTop: 8 }}>
          <span></span> Continue with Apple
        </button>
      </form>

      <div className="auth-footer">
        Don&apos;t have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToSignup}>
          Create Account
        </button>
      </div>
    </div>
  );
}
