'use client';

import { useState } from 'react';
import { Icon } from '../icon';

type Props = {
  onSuccess: (user: any, address: any) => void;
  onSwitchToLogin: () => void;
};

export function SignupForm({ onSuccess, onSwitchToLogin }: Props) {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    if (!surname.trim()) errs.surname = 'Surname is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Valid email address is required.';
    if (!phone.trim() || phone.replace(/\s+/g, '').length < 9) errs.phone = 'Valid phone number is required.';
    if (!physicalAddress.trim()) errs.physicalAddress = 'Physical address is required.';
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!agreeTerms) errs.terms = 'You must agree to the Terms and Conditions.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          surname,
          email,
          phone,
          physicalAddress,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Registration failed. Please check your information.');
      }

      onSuccess(data.user, data.defaultAddress);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
        <h2>Create Your Account</h2>
        <p className="muted">Join Duze and start ordering today</p>
      </div>

      {error && <div className="auth-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <div className="input-box">
              <Icon name="user" size={16} />
              <input
                type="text"
                placeholder="e.g. Sakhile"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Surname</label>
            <div className="input-box">
              <Icon name="user" size={16} />
              <input
                type="text"
                placeholder="e.g. Simelane"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
            {fieldErrors.surname && <span className="field-error">{fieldErrors.surname}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-box">
            <Icon name="user" size={16} />
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="input-box">
            <Icon name="phone" size={16} />
            <input
              type="tel"
              placeholder="071 234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Physical Address (Saved as Default Delivery Location)</label>
          <div className="input-box">
            <Icon name="pin" size={16} />
            <input
              type="text"
              placeholder="e.g. 25 East Street, Ixopo, KwaZulu-Natal"
              value={physicalAddress}
              onChange={(e) => setPhysicalAddress(e.target.value)}
            />
          </div>
          {fieldErrors.physicalAddress && <span className="field-error">{fieldErrors.physicalAddress}</span>}
        </div>

        <div className="form-row">
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
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-box">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span>I agree to the <strong>Terms and Conditions</strong></span>
        </label>
        {fieldErrors.terms && <span className="field-error">{fieldErrors.terms}</span>}

        <button type="submit" className="button orange-button full-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Log in
        </button>
      </div>
    </div>
  );
}
