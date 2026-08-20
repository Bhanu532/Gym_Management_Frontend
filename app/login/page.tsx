'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/api';
import { getHomePathForRole } from '@/lib/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('owner@demogym.com');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function redirectRole(roleStr: string) {
    // Role-aware home page (centralized in lib/navigation).
    const dest = getHomePathForRole(roleStr);

    try {
      router.push(dest);
    } catch {
      // fallback if router fails
    }
    window.location.href = dest;
  }

  async function demoLogin(role: string, customEmail?: string) {
    // Quick demo switcher now performs a REAL backend login using the seeded
    // demo credentials. Every API call afterwards uses a valid JWT — no fake
    // tokens are stored.
    const demoUsers: Record<string, { email: string; name: string; password: string }> = {
      SUPER_ADMIN: {
        email: customEmail || 'superadmin@platform.local',
        name: 'Platform Super Admin',
        password: 'ChangeMe123!',
      },
      OWNER_ADMIN: {
        email: customEmail || 'owner@demogym.com',
        name: 'Vikramaditya Rao (Owner)',
        password: 'ChangeMe123!',
      },
      RECEPTIONIST: {
        email: 'reception@demogym.com',
        name: 'Pooja Sharma (Receptionist)',
        password: 'ChangeMe123!',
      },
      TRAINER: {
        email: 'trainer@demogym.com',
        name: 'Vikram Singh (Head Trainer)',
        password: 'ChangeMe123!',
      },
      DIETITIAN: {
        email: 'dietitian@demogym.com',
        name: 'Ananya Iyer (Dietitian)',
        password: 'ChangeMe123!',
      },
      MEMBER: {
        email: 'rahul.sharma@example.com',
        name: 'Rahul Sharma (Member)',
        password: 'ChangeMe123!',
      },
    };

    const target = demoUsers[role] || demoUsers.OWNER_ADMIN;
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(target.email, target.password);
      redirectRole(user.role ?? user.scope);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed. Please use the email/password form.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      redirectRole(user.role ?? user.scope);
    } catch (err) {
      // Surface the actual backend authentication error (invalid credentials,
      // inactive account, suspended tenant, network failure, etc.).
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      margin: 0,
      padding: '24px',
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(at 50% 0%, #1e293b 0px, transparent 50%), radial-gradient(at 100% 100%, #1e3a8a 0px, transparent 50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        padding: '36px 32px',
        boxSizing: 'border-box',
      }}>
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            height: '52px',
            width: '52px',
            backgroundColor: '#2563eb',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
            marginBottom: '14px',
          }}>
            ⚡
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 6px 0',
            letterSpacing: '-0.5px',
          }}>
            GymPro SaaS
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            margin: 0,
            fontWeight: '500',
          }}>
            Enterprise Multi-Tenant Gym Management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@demogym.com"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444', margin: 0, fontWeight: '600' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '6px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
            }}
          >
            {submitting ? 'Signing In...' : 'Sign In to Gym SaaS'}
          </button>
        </form>

        {/* Persona Switcher Section */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
        }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#94a3b8',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '14px',
            marginTop: 0,
          }}>
            ⚡ Quick Demo Switcher (Instant Role Login)
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => demoLogin('SUPER_ADMIN')}
              style={{
                padding: '10px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ⚡ Super Admin
            </button>
            <button
              type="button"
              onClick={() => demoLogin('OWNER_ADMIN')}
              style={{
                padding: '10px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              👑 Gym Owner
            </button>
            <button
              type="button"
              onClick={() => demoLogin('RECEPTIONIST')}
              style={{
                padding: '10px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🏢 Receptionist
            </button>
            <button
              type="button"
              onClick={() => demoLogin('TRAINER')}
              style={{
                padding: '10px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🏋️ Trainer
            </button>
            <button
              type="button"
              onClick={() => demoLogin('DIETITIAN')}
              style={{
                padding: '10px 12px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🥗 Dietitian
            </button>
            <button
              type="button"
              onClick={() => demoLogin('MEMBER')}
              style={{
                gridColumn: 'span 2',
                padding: '10px 12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1d4ed8',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              👤 Member Portal Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
