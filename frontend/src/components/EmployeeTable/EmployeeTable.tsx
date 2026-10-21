/**
 * EmployeeTable Component
 * Displays the paginated, searchable employee list with edit and delete actions.
 */

import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { IEmployee, IEmployeeFilter } from '../../types/employee';
import './EmployeeTable.css';

interface EmployeeTableProps {
  data: IEmployee[];
  loading: boolean;
  filterModel: IEmployeeFilter;
  onEdit: (id: number) => void;
  onView: (employee: IEmployee) => void;
  onFilterChange: (filter: Partial<IEmployeeFilter>) => void;
}

export default function EmployeeTable({
  data,
  loading,
  filterModel,
  onEdit,
  onView,
  onFilterChange,
}: EmployeeTableProps) {

  const handleTableChange = (pagination: TablePaginationConfig) => {
    onFilterChange({
      currentPage: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    });
  };

  const columns: ColumnsType<IEmployee> = [
    {
      title: '#',
      key: 'index',
      width: 55,
      align: 'center',
      render: (_: unknown, __: IEmployee, index: number) =>
        (filterModel.currentPage - 1) * filterModel.pageSize + index + 1,
    },
    {
      title: 'Emp ID',
      dataIndex: 'empId',
      key: 'empId',
      width: 100,
      render: (code: string) => (
        <span className="employee-table-code">{code}</span>
      ),
    },
    {
      title: 'Employee Name',
      key: 'name',
      width: 180,
      render: (_: unknown, record: IEmployee) => (
        <div>
          <span className="employee-table-name">
            {record.firstName} {record.lastName}
          </span>
          <br />
          <span className="employee-table-email">{record.email}</span>
        </div>
      ),
      sorter: (a: IEmployee, b: IEmployee) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 140,
      render: (dept: string) => (
        <span className="employee-table-dept">
          {dept}
        </span>
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 160,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 130,
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      width: 120,
      render: (salary: number) => (
        <span className="employee-table-salary">
          ₹{Number(salary).toLocaleString('en-IN')}
        </span>
      ),
      sorter: (a: IEmployee, b: IEmployee) => a.salary - b.salary,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag
          color={status === 1 ? 'success' : 'default'}
          className={`employee-table-tag ${status === 1 ? 'employee-table-tag-active' : 'employee-table-tag-inactive'}`}
        >
          {status === 1 ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 90,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: IEmployee) => (
        <Space size={4}>
          <Tooltip title="View Profile">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className="employee-table-action-view"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record.id)}
              className="employee-table-action-edit"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      onChange={handleTableChange}
      scroll={{ x: 1000 }}
      pagination={{
        current: filterModel.currentPage,
        pageSize: filterModel.pageSize,
        total: filterModel.totalRows,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50'],
        showTotal: (total, range) => (
          <span className="employee-table-pagination-total">
            Showing {range[0]}–{range[1]} of {total} employees
          </span>
        ),
      }}
    />
  );
}
