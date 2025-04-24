import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TestRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('TestRedirect.jsx - Location:', location.pathname, location.search);
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log('TestRedirect.jsx - Token:', token);

    if (token) {
      console.log('TestRedirect.jsx - Saving token:', token.substring(0, 10) + '...');
      localStorage.setItem('token', token);
      console.log('TestRedirect.jsx - Token saved, staying on /post');
      navigate('/post', { replace: true }); // Clear query params
    } else {
      const storedToken = localStorage.getItem('token');
      console.log('TestRedirect.jsx - Stored token:', storedToken ? storedToken.substring(0, 10) + '...' : 'No token');
      if (!storedToken) {
        console.log('TestRedirect.jsx - No token, redirecting to /login');
        navigate('/login', { replace: true });
      }
    }
  }, [location, navigate]);

  const storedToken = localStorage.getItem('token');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Test Redirect Page</h2>
      {storedToken ? (
        <p>Token: {storedToken.substring(0, 10)}...</p>
      ) : (
        <p>No token found.</p>
      )}
      <button onClick={() => navigate('/login')}>Back to Login</button>
    </div>
  );
};

export default TestRedirect;