import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { jwtDecode } from 'jwt-decode';
import './OAuthCallback.css';

const { Title } = Typography;

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse the token from the URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        // Decode the JWT to get user info (assuming standard JWT format)
        // Since we are not fetching the full user profile again, we'll store the decoded token info
        const decodedToken: any = jwtDecode(token);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: decodedToken.id,
          email: decodedToken.email,
          empId: decodedToken.empId,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName
        }));

        navigate('/'); // Redirect to dashboard
      } catch (error) {
        console.error('Invalid token received from OAuth:', error);
        navigate('/login?error=InvalidToken');
      }
    } else {
      navigate('/login?error=NoToken');
    }
  }, [location, navigate]);

  return (
    <div className="oauth-callback-container">
      <Spin size="large" />
      <Title level={4} className="oauth-callback-title">
        Completing secure sign in...
      </Title>
    </div>
  );
};

export default OAuthCallback;
