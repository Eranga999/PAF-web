import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Location search:', location.search); // Debug query params
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log('Token from query:', token); // Debug token
    if (token) {
      console.log('Saving token to localStorage:', token);
      localStorage.setItem('token', token);
      console.log('Navigating to /post');
      navigate('/post', { replace: true });
    } else {
      console.log('No token found in query params');
    }
  }, [location, navigate]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: () => {
      console.log('Initiating Google OAuth');
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
    },
    flow: 'implicit',
  });

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login to Cookmate</h2>
      <div>
        <h3>Continue with Google</h3>
        <button onClick={() => handleGoogleLogin()}>
          Sign in with Google
        </button>
      </div>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;