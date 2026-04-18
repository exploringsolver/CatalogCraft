import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Spinner } from '@material-tailwind/react';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the user details from your API
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/user-details`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      }
    })
      .then((response) => {
        // Assuming the API response contains user data
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="lux-shell">
      <div className="lux-container py-12 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-12 w-12 text-white/50" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="lux-panel p-8">
              <span className="lux-chip">Account</span>
              <Typography className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                Profile
              </Typography>
              <Typography className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Your seller workspace identity and access level. This section stays minimal and high-contrast for dark-luxury demos.
              </Typography>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                  <p className="mt-2 text-sm font-medium text-white">{user?.email || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
                  <p className="mt-2 text-sm font-medium text-white">{user?.name || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
                  <p className="mt-2 text-sm font-medium text-white">{user?.number || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Role</p>
                  <div className="mt-2 inline-flex items-center rounded-full border border-red-800/30 bg-red-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-200">
                    {user?.role || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="lux-panel-soft p-6">
              <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Next steps</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Build your catalogue, keep SKUs consistent, and use the storefront pages as your portfolio demo surface.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileScreen;
