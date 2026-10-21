/**
 * EmployeePage - Main Container
 * Composes PageHeader, SearchBar, EmployeeTable, and EmployeeForm
 * into a complete CRUD management page.
 */

import { useCallback, useEffect, useState } from 'react';
import { Card, Drawer, Descriptions, Timeline, Tabs, Spin, Badge, Tag } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { IEmployee, IEmployeeFilter } from '../../types/employee';
import ApiService from '../../services/apiService';
import SearchBar from '../../components/SearchBar/SearchBar';
import EmployeeTable from '../../components/EmployeeTable/EmployeeTable';
import EmployeeForm from '../../components/EmployeeForm/EmployeeForm';
import StethoscopeIcon from '../../components/StethoscopeIcon';
import './EmployeePage.css';

const DEFAULT_FILTER: IEmployeeFilter = {
  currentPage: 1,
  pageSize: 10,
  searchText: '',
  totalRows: 0,
  filterRowsCount: 0,
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterModel, setFilterModel] = useState<IEmployeeFilter>(DEFAULT_FILTER);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await ApiService.getEmployeeList({ ...filterModel });
      if (response?.dataResponse?.returnCode === 0) {
        setEmployees(response.data.rows || []);
        setFilterModel((prev) => ({
          ...prev,
          totalRows: response.data.count || 0,
          filterRowsCount: response.data.rows?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  }, [filterModel]);

  useEffect(() => {
    fetchEmployees();
  }, [filterModel.currentPage, filterModel.pageSize, filterModel.searchText]);

  const handleSearch = (value: string) => {
    setFilterModel((prev) => ({ ...prev, searchText: value, currentPage: 1 }));
  };

  const handleReset = () => {
    setFilterModel({ ...DEFAULT_FILTER });
  };

  const handleFilterChange = (partial: Partial<IEmployeeFilter>) => {
    setFilterModel((prev) => ({ ...prev, ...partial }));
  };

  const openAddDrawer = () => {
    setEditId(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (id: number) => {
    setEditId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditId(null);
  };

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);
  const [healthHistory, setHealthHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleView = async (employee: IEmployee) => {
    setSelectedEmployee(employee);
    setViewDrawerOpen(true);
    
    try {
      setLoadingHistory(true);
      const response: any = await ApiService.getHealthRecords();
      if (response?.dataResponse?.returnCode === 0) {
        const filtered = (response.data || []).filter((r: any) => r.empId === employee.empId);
        setHealthHistory(filtered);
      }
    } catch (err) {
      console.error('Failed to load health history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerOpen(false);
    setSelectedEmployee(null);
    setHealthHistory([]);
  };

  return (
    <div className="app-container employee-page">
      <SearchBar onSearch={handleSearch} onReset={handleReset} onAdd={openAddDrawer} />

      <Card
        className="employee-table-card"
        styles={{ body: { padding: 0 } }}
      >
        <EmployeeTable
          data={employees}
          loading={loading}
          filterModel={filterModel}
          onEdit={openEditDrawer}
          onView={handleView}
          onFilterChange={handleFilterChange}
        />
      </Card>

      <EmployeeForm
        open={drawerOpen}
        editId={editId}
        onClose={closeDrawer}
        onSuccess={fetchEmployees}
      />

      <Drawer
        title={selectedEmployee ? `Employee Profile - ${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Employee Profile"}
        placement="right"
        width={500}
        onClose={handleCloseViewDrawer}
        open={viewDrawerOpen}
        destroyOnClose
      >
        {selectedEmployee && (
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'General Information',
              children: (
                <Descriptions bordered column={1} size="small" style={{ marginTop: '10px' }}>
                  <Descriptions.Item label="Employee ID">{selectedEmployee.empId}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedEmployee.email}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{selectedEmployee.phone}</Descriptions.Item>
                  <Descriptions.Item label="Department">{selectedEmployee.department}</Descriptions.Item>
                  <Descriptions.Item label="Designation">{selectedEmployee.designation}</Descriptions.Item>
                  <Descriptions.Item label="Location">{selectedEmployee.location || 'Not Specified'}</Descriptions.Item>
                  <Descriptions.Item label="Salary">₹{Number(selectedEmployee.salary).toLocaleString('en-IN')}</Descriptions.Item>
                  <Descriptions.Item label="Joining Date">{selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString('en-IN') : 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Badge status={selectedEmployee.status === 1 ? 'success' : 'default'} text={selectedEmployee.status === 1 ? 'Active' : 'Inactive'} />
                  </Descriptions.Item>
                </Descriptions>
              )
            },
            {
              key: '2',
              label: 'Medical Timeline',
              children: (
                <div style={{ marginTop: '16px', padding: '0 4px' }}>
                  {loadingHistory ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <Spin tip="Loading Timeline..." />
                    </div>
                  ) : healthHistory.length > 0 ? (
                    <Timeline mode="left" style={{ marginTop: '12px' }}>
                      {healthHistory.map((h: any) => (
                        <Timeline.Item 
                          key={h.id} 
                          color={h.status === 'Resolved' ? 'green' : 'red'}
                          dot={h.status === 'Resolved' ? <CheckCircleOutlined style={{ fontSize: '14px' }} /> : <StethoscopeIcon size={14} />}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>Symptom: {h.symptom}</span>
                              <Tag color={h.status === 'Resolved' ? 'success' : 'warning'} style={{ borderRadius: '4px', fontSize: '10px' }}>
                                {h.status}
                              </Tag>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              Location: {h.location}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                              Logged: {new Date(h.createdOn).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <p>No health symptoms recorded for this employee.</p>
                    </div>
                  )}
                </div>
              )
            }
          ]} />
        )}
      </Drawer>
    </div>
  );
}
