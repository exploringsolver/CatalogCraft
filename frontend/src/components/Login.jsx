import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Typography } from '@material-tailwind/react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        email,
        password,
      });
      console.log(response.data);

      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.data.access || response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh || '');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid Credentials');
    }
  };

  return (
    <div className="lux-shell">
      <div className="lux-container flex min-h-[80vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-[30px] border border-white/10 bg-white/[0.04] px-8 pb-8 pt-8 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <span className="lux-chip">Welcome back</span>
        <Typography className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white">
          Log in to your premium catalog workspace.
        </Typography>
        <Typography className="mt-3 text-base leading-7 text-slate-300">
          Continue managing catalogue operations, storefront data, and seller workflows.
        </Typography>
        <div className="mb-1 flex flex-col gap-6">

          <Typography variant="h6" className="mt-6 -mb-3 text-slate-100">
            Email
          </Typography>
          <Input
            size="lg"
            placeholder="name@mail.com"
            className="!border-t-white/10 text-white"
            containerProps={{ className: "min-w-0" }}
            labelProps={{
              className: "before:content-none after:content-none",
            }}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Typography variant="h6" className="-mb-3 text-slate-100">
            Password
          </Typography>
          <Input
            type="password"
            size="lg"
            placeholder="********"
            className="!border-t-white/10 text-white"
            containerProps={{ className: "min-w-0" }}
            labelProps={{
              className: "before:content-none after:content-none",
            }}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type='submit' className="mt-6 rounded-full bg-[#ff5a1f]" fullWidth>
         Log In
        </Button>
        <Typography className="mt-4 text-center text-sm text-slate-400">
          New here?{" "}
          <Link to="/signup" className="font-medium text-[#ff5a1f]">
            Book a demo
          </Link>
        </Typography>
      </form>
      </div>
    </div>
  );
}

export default Login;
