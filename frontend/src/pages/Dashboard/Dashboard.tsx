import { useEffect, useState } from 'react';
import { Row, Col, Card, Spin, message, Typography, Button, Modal, Form, Select, Dropdown, Input, Empty } from 'antd';
import type { MenuProps } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  UsergroupDeleteOutlined,
  DollarOutlined,
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import StethoscopeIcon from '../../components/StethoscopeIcon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import ApiService from '../../services/apiService';
import './Dashboard.css';

const { Title, Text } = Typography;

interface DashboardStats {
  totalEmployees: number;
  activeCount: number;
  inactiveCount: number;
  totalSalary: number;
  activeHealthCases?: number;
  topSymptom?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line';
  groupBy: 'department' | 'designation' | 'status';
  metric: 'count' | 'sum_salary' | 'avg_salary';
}

const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const DEFAULT_CHARTS: ChartConfig[] = [
  { id: '1', title: 'Department Distribution', type: 'bar', groupBy: 'department', metric: 'count' },
  { id: '2', title: 'Workforce Status', type: 'pie', groupBy: 'status', metric: 'count' }
];

// Helper to format currency correctly
const formatMetric = (value: number, metric: string) => {
  if (metric.includes('salary')) {
    return `₹${value.toLocaleString('en-IN')}`;
  }
  return value.toLocaleString('en-IN');
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [chartDataCache, setChartDataCache] = useState<Record<string, any[]>>({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Watch the selected chart type to dynamically change form labels
  const selectedChartType = Form.useWatch('type', form);

  useEffect(() => {
    fetchStats();

    const saved = localStorage.getItem('dashboard_charts');
    if (saved) {
      try {
        setChartConfigs(JSON.parse(saved));
      } catch (e) {
        setChartConfigs(DEFAULT_CHARTS);
      }
    } else {
      setChartConfigs(DEFAULT_CHARTS);
    }
  }, []);

  useEffect(() => {
    if (chartConfigs.length > 0) {
      chartConfigs.forEach(config => {
        if (!chartDataCache[config.id]) {
          fetchChartData(config);
        }
      });
      localStorage.setItem('dashboard_charts', JSON.stringify(chartConfigs));
    }
  }, [chartConfigs]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response: any = await ApiService.getDashboardStats();
      if (response?.dataResponse?.returnCode === 0) {
        setStats(response.data);
      } else {
        message.error('Failed to load dashboard statistics.');
      }
    } catch (error) {
      message.error('An error occurred while loading overview data.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchChartData = async (config: ChartConfig) => {
    try {
      const response: any = await ApiService.getDynamicChartData({
        groupBy: config.groupBy,
        metric: config.metric
      });
      if (response?.dataResponse?.returnCode === 0) {
        setChartDataCache(prev => ({ ...prev, [config.id]: response.data }));
      }
    } catch (error) {
      message.error(`Failed to load data for ${config.title}`);
    }
  };

  const handleAddChart = (values: any) => {
    const newConfig: ChartConfig = {
      id: Date.now().toString(),
      title: values.title,
      type: values.type,
      groupBy: values.groupBy,
      metric: values.metric
    };
    setChartConfigs([...chartConfigs, newConfig]);
    setIsModalVisible(false);
    form.resetFields();
  };

  const removeChart = (id: string) => {
    setChartConfigs(chartConfigs.filter(c => c.id !== id));
    setChartDataCache(prev => {
      const newCache = { ...prev };
      delete newCache[id];
      return newCache;
    });
  };

  const renderChart = (config: ChartConfig) => {
    const data = chartDataCache[config.id];

    if (!data) return <div className="dashboard-chart-loading"><Spin /></div>;
    if (data.length === 0) return <div className="dashboard-chart-loading"><Empty description="No data available" /></div>;

    switch (config.type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="label">
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(val: any) => formatMetric(Number(val) || 0, config.metric)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatMetric(val, config.metric)}
                width={80}
              />
              <RechartsTooltip
                formatter={(val: any) => formatMetric(Number(val) || 0, config.metric)}
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatMetric(val, config.metric)}
                width={80}
              />
              <RechartsTooltip
                formatter={(val: any) => formatMetric(Number(val) || 0, config.metric)}
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  if (loadingStats || !stats) {
    return (
      <div className="dashboard-loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="app-container dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0px', marginTop: '8px' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} className="dashboard-add-chart-btn">
          Add Chart
        </Button>
      </div>

      <Row gutter={[24, 24]} className="dashboard-stat-cards">
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <TeamOutlined />
            </div>
            <div className="dashboard-stat-content">
              <Text type="secondary" className="dashboard-stat-title">Total Employees</Text>
              <Title level={2} className="dashboard-stat-value">{stats.totalEmployees}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#10b981' }}>
              <UserOutlined />
            </div>
            <div className="dashboard-stat-content">
              <Text type="secondary" className="dashboard-stat-title">Active Employees</Text>
              <Title level={2} className="dashboard-stat-value">{stats.activeCount}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <UsergroupDeleteOutlined />
            </div>
            <div className="dashboard-stat-content">
              <Text type="secondary" className="dashboard-stat-title">Inactive Employees</Text>
              <Title level={2} className="dashboard-stat-value">{stats.inactiveCount}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-wrapper" style={{ background: '#fdf4ff', color: '#d946ef' }}>
              <DollarOutlined />
            </div>
            <div className="dashboard-stat-content">
              <Text type="secondary" className="dashboard-stat-title">Total Monthly Salary</Text>
              <Title level={2} className="dashboard-stat-value">₹{stats.totalSalary.toLocaleString('en-IN')}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-wrapper" style={{ background: '#fff7ed', color: '#f97316' }}>
              <StethoscopeIcon size={24} />
            </div>
            <div className="dashboard-stat-content">
              <Text type="secondary" className="dashboard-stat-title">Active Health Cases</Text>
              <Title level={2} className="dashboard-stat-value">{stats.activeHealthCases ?? 0}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-wrapper" style={{ background: '#f0fdfa', color: '#0d9488' }}>
              <MedicineBoxOutlined />
            </div>
            <div className="dashboard-stat-content">
              <Text type="secondary" className="dashboard-stat-title">Top Active Symptom</Text>
              <Title level={2} className="dashboard-stat-value" style={{ fontSize: '20px', marginTop: '4px' }}>{stats.topSymptom ?? 'None'}</Title>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-charts-row">
        {chartConfigs.map((config) => {
          const menuItems: MenuProps['items'] = [
            { key: '1', danger: true, icon: <DeleteOutlined />, label: 'Remove Chart', onClick: () => removeChart(config.id) }
          ];

          return (
            <Col xs={24} lg={config.type === 'pie' ? 8 : 16} key={config.id}>
              <Card
                title={config.title}
                bordered={false}
                className="dashboard-chart-card"
                extra={
                  <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                    <Button type="text" icon={<SettingOutlined />} />
                  </Dropdown>
                }
              >
                <div className="dashboard-chart-container">
                  {renderChart(config)}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title="Create Custom Chart"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Add Chart"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddChart} initialValues={{ type: 'bar', groupBy: 'department', metric: 'count' }}>
          <Form.Item name="title" label="Chart Title" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input placeholder="e.g. Salary by Department" />
          </Form.Item>
          <Form.Item name="type" label="Chart Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="bar">Bar Chart</Select.Option>
              <Select.Option value="pie">Pie Chart</Select.Option>
              <Select.Option value="line">Line Chart</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="groupBy"
            label={selectedChartType === 'pie' ? 'Slice Category (Group By)' : 'X-Axis Category (Group By)'}
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="department">Department</Select.Option>
              <Select.Option value="designation">Designation</Select.Option>
              <Select.Option value="status">Status</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="metric"
            label={selectedChartType === 'pie' ? 'Slice Size (Metric)' : 'Y-Axis Value (Metric)'}
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="count">Employee Count</Select.Option>
              <Select.Option value="sum_salary">Total Salary</Select.Option>
              <Select.Option value="avg_salary">Average Salary</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
