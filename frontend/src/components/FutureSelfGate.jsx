import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function FutureSelfGate({ children }) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let active = true;
    api.getFutureSelf().then(({ profile }) => {
      if (active) setStatus(profile ? 'ready' : 'setup');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, []);

  if (status === 'setup') return <Navigate to="/future-self" replace />;
  if (status === 'loading') return <div className="future-self-loading">Preparing your personal growth space…</div>;
  if (status === 'error') return <div className="future-self-loading">Could not load your profile. Refresh to try again.</div>;
  return children;
}
