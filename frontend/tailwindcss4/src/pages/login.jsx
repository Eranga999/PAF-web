import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Login.jsx - Location:', location.pathname, location.search);
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    console.log('Login.jsx - Token:', token);
    console.log('Login.jsx - Error:', error);

    if (token) {
      console.log('Login.jsx - Saving token:', token.substring(0, 10) + '...');
      localStorage.setItem('token', token);
      console.log('Login.jsx - Navigating to /post');
      navigate('/post', { replace: true });
    } else if (error) {
      console.error('Login.jsx - Error:', error);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } else {
      console.log('Login.jsx - No token, staying on /login');
      localStorage.removeItem('token');
    }
  }, [location, navigate]);

  const handleGoogleLogin = () => {
    console.log('Login.jsx - Starting Google OAuth');
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login to Cookmate</h2>
      <div>
        <h3>Continue with Google</h3>
        <button onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;