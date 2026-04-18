import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Typography } from '@material-tailwind/react';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // const [role, setRole] = useState('SELLER');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/register`, {
        email,
        password,
        name,
        number,
        role:'SELLER',
      });
      console.log(response.data);
      // Handle successful signup, such as redirecting to another page
      navigate('/login')

    } catch (error) {
      console.error('Signup error:', error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Signup failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lux-shell">
      <div className="lux-container flex min-h-[80vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-[30px] border border-white/10 bg-white/[0.04] px-8 pb-8 pt-8 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <span className="lux-chip">Book a demo</span>
        <Typography className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white">
          Start a premium CatalogCraft workspace.
        </Typography>
        <Typography className="mt-3 text-base leading-7 text-slate-300">
          Create an account to explore product workflows, seller tooling, and the dark-luxury storefront experience.
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
            Name
          </Typography>
          <Input
            size="lg"
            placeholder="name"
            className="!border-t-white/10 text-white"
            containerProps={{ className: "min-w-0" }}
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Typography variant="h6" className="-mb-3 text-slate-100">
            Number
          </Typography>
          <Input
            size="lg"
            className="!border-t-white/10 text-white"
            containerProps={{ className: "min-w-0" }}
            labelProps={{
              className: "before:content-none after:content-none",
            }}
            id="number"
            type="text"
            placeholder="Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
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
        <Button
          type="submit"
          className="mt-6 rounded-full bg-[#ff5a1f]"
          fullWidth
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </Button>
        {errorMsg ? (
          <div className="text-sm text-center text-red-300">{errorMsg}</div>
        ) : null}
        <Typography className="mt-4 text-center font-normal text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#ff5a1f]">
            Sign In
          </Link>
        </Typography>
      </form>
      </div>
    </div>
  );
}

export default Signup;
