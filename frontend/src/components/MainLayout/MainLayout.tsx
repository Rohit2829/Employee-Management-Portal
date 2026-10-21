import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import { DashboardOutlined, TeamOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../PageHeader/PageHeader';
import StethoscopeIcon from '../StethoscopeIcon';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // Open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  // Close menu when route changes on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getHeaderDetails = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: "Employee Dashboard",
          subtitle: "Overview of your organization's workforce metrics",
          icon: <DashboardOutlined className="page-header-icon" />
        };
      case '/employees':
        return {
          title: "Employee Management",
          subtitle: "Manage your organization's workforce — Add, Edit, and Remove employees",
          icon: <TeamOutlined className="page-header-icon" />
        };
      case '/health-tracker':
        return {
          title: "Employee Health Analytics",
          subtitle: "Track and map dynamic health symptoms across company locations",
          icon: <StethoscopeIcon className="page-header-icon" size={20} />
        };
      default:
        return {
          title: "Portal",
          subtitle: "Manage employees and analytics",
          icon: <TeamOutlined className="page-header-icon" />
        };
    }
  };

  const headerDetails = getHeaderDetails();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
    {
      key: '/health-tracker',
      icon: <StethoscopeIcon size={16} />,
      label: 'Health Tracker',
    },
  ];

  return (
    <Layout className="main-layout-container">
      <Sider
        width={260}
        theme="light"
        className={`main-layout-sider ${!sidebarOpen && window.innerWidth <= 768 ? 'main-layout-sider-collapsed' : ''}`}
        collapsed={!sidebarOpen}
        collapsedWidth="0"
        trigger={null}
      >
        <div className="main-layout-logo">
          <h2>Employee Management Portal</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="main-layout-menu"
        />
        {user && (
          <div className="sidebar-profile-widget">
            <div className="profile-avatar">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-details">
              <span className="profile-name">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email?.split('@')[0] || 'User'}
              </span>
              <span className="profile-email" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
        )}
        <div className="main-layout-logout-wrapper">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            className="main-layout-logout-btn"
          >
            Log Out
          </Button>
        </div>
      </Sider>

      <Layout className="main-layout-content-wrapper">
        <Header className="main-layout-header">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="desktop-toggle-btn"
          />
          <PageHeader 
            title={headerDetails.title} 
            subtitle={headerDetails.subtitle} 
            icon={headerDetails.icon}
          />
        </Header>
        <Content className="main-layout-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
