/**
 * SearchBar Component
 * Clean, human-made, minimalist design without AI gradients.
 */

import { Button, Input, Space, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import './SearchBar.css';

const { Search } = Input;

interface SearchBarProps {
  onSearch: (value: string) => void;
  onReset: () => void;
  onAdd: () => void;
}

export default function SearchBar({ onSearch, onReset, onAdd }: SearchBarProps) {
  return (
    <div className="search-bar-container">
      <Row gutter={[16, 12]} align="middle">
        <Col xs={24} sm={14} md={10}>
          <Search
            placeholder="Search by name, email, department..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={onSearch}
            size="middle"
            className="search-bar-input"
          />
        </Col>
        <Col xs={24} sm={10} md={14} className="search-bar-actions-col">
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
              size="middle"
              className="search-bar-reset-btn"
            >
              Reset
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
              size="middle"
              className="search-bar-add-btn"
            >
              Add Employee
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
