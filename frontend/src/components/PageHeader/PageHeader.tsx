import React from 'react';
import { TeamOutlined } from '@ant-design/icons';
import './PageHeader.css';
import logoImg from '../../assets/vedanta-logo-tagline.jpg';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="page-header-container">
      <div className="page-header-main-row">
        <div className="page-header-left-group">
          <div className="page-header-icon-wrapper">
            {icon || <TeamOutlined className="page-header-icon" />}
          </div>
          <h1 className="page-header-title">{title}</h1>
        </div>
        <div className="page-header-logo">
          <img src={logoImg} alt="Vedanta Logo" className="vedanta-logo-img" />
        </div>
      </div>
      <p className="page-header-subtitle">{subtitle}</p>
    </div>
  );
}
