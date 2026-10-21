import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Divider } from 'antd';
import { LockOutlined, UserOutlined, ReloadOutlined, WindowsOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/apiService';
import './Login.css';

const { Title, Text } = Typography;

const ENCRYPT_KEY = '0123456789COSTSHEET';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Generate random characters for Captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    return text;
  };

  // Draw the Captcha on Canvas
  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background color
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(15, 23, 42, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw text with random rotations
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 20;
      const y = canvas.height / 2;
      const angle = (Math.random() - 0.5) * 0.5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const text = generateCaptcha();
    drawCaptcha(text);
  };

  useEffect(() => {
    refreshCaptcha();

    // Check for error parameters in the URL (e.g. from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      message.error(decodeURIComponent(oauthError));
      // Clean up URL query parameters so the message doesn't persist on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const onFinish = async (values: any) => {
    if (values.captchaInput !== captchaText) {
      message.error('Incorrect Captcha. Please try again.');
      refreshCaptcha();
      form.setFieldsValue({ captchaInput: '' });
      return;
    }

    const originalPassword = values.password;

    try {
      setLoading(true);
      
      // AES Encrypt the plain text password before sending
      const encryptedPassword = CryptoJS.AES.encrypt(originalPassword, ENCRYPT_KEY).toString();

      // Visually update the password input box to show a long string of bullets, avoiding hash exposure
      form.setFieldsValue({ password: '••••••••••••••••••••••••••••••••••••••••••••••••••••' });

      const payload = {
        email: values.email,
        password: encryptedPassword
      };

      const response: any = await ApiService.login(payload);
      
      if (response.dataResponse.returnCode === 0) {
        // Save JWT and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        message.success('Login successful!');
        navigate('/'); // Redirect to dashboard
      } else {
        message.error(response.dataResponse.description || 'Login failed');
        // Restore original password on login failure
        form.setFieldsValue({ password: originalPassword });
      }
    } catch (error: any) {
      // Restore original password on connection/server failure
      form.setFieldsValue({ password: originalPassword });
      
      if (error.response?.data?.dataResponse?.description) {
        message.error(error.response.data.dataResponse.description);
      } else {
        message.error('Server connection error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card 
        className="login-card"
      >
        <div className="login-header">
          <div className="login-icon-wrapper">
            <LockOutlined />
          </div>
          <Title level={3} className="login-title">Welcome Back</Title>
          <Text type="secondary" className="login-subtitle">Please sign in to access the dashboard</Text>
        </div>

        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="Email Address" 
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Password"
              className="login-input"
            />
          </Form.Item>

          <Form.Item 
            name="captchaInput"
            rules={[{ required: true, message: 'Please enter the captcha!' }]}
            style={{ marginBottom: '24px' }}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="Enter Captcha" 
                className="login-captcha-input"
              />
              <div className="login-captcha-wrapper">
                <canvas ref={canvasRef} width="150" height="38" className="login-captcha-canvas" onClick={refreshCaptcha} title="Click to refresh" />
              </div>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refreshCaptcha} 
                className="login-captcha-btn"
                title="Refresh Captcha"
              />
            </Space.Compact>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="login-submit-btn"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider plain className="login-divider">Or continue with</Divider>

        <Space direction="vertical" className="login-social-wrapper" size="middle">
          <Button 
            size="large" 
            block 
            icon={<WindowsOutlined />}
            onClick={() => window.location.href = 'http://localhost:3005/api/auth/microsoft'}
            className="login-social-btn"
          >
            Sign in with Microsoft
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
