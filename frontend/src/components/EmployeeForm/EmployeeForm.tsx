/**
 * EmployeeForm Component
 * Handles both Add and Edit operations for employee records.
 * Opens as a drawer (sliding panel) from the right side.
 */

import { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Space,
  Divider,
  message,
  Popconfirm,
} from 'antd';
import { SaveOutlined, CloseOutlined, UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import ApiService from '../../services/apiService';
import './EmployeeForm.css';

const ENCRYPT_KEY = '0123456789COSTSHEET';

const DEPARTMENTS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'HR', value: 'HR' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Sales', value: 'Sales' },
  { label: 'IT', value: 'IT' },
  { label: 'Admin', value: 'Admin' },
];

const LOCATIONS = [
  { label: 'Udaipur', value: 'Udaipur' },
  { label: 'Chittorgarh', value: 'Chittorgarh' },
  { label: 'Bhilwara', value: 'Bhilwara' },
  { label: 'Rajsamand', value: 'Rajsamand' },
  { label: 'Ajmer', value: 'Ajmer' },
  { label: 'Jaipur', value: 'Jaipur' },
  { label: 'Kota', value: 'Kota' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
];

interface EmployeeFormProps {
  open: boolean;
  editId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeeForm({ open, editId, onClose, onSuccess }: EmployeeFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const isEdit = editId !== null && editId > 0;
  
  const selectedCountryCode = Form.useWatch('countryCode', form);
  const isIndia = selectedCountryCode === '+91' || !selectedCountryCode;

  const selectedGender = Form.useWatch('gender', form);
  const [salutationPrefix, setSalutationPrefix] = useState('Mr.');

  const handleGenderChange = (value: string) => {
    if (value === 'Male') {
      setSalutationPrefix('Mr.');
      form.setFieldsValue({ salutation: 'Mr.' });
    } else {
      setSalutationPrefix('');
      form.setFieldsValue({ salutation: undefined });
    }
  };

  const fetchEmployee = async () => {
    try {
      setFetching(true);
      const response: any = await ApiService.getSpecificEmployee({ id: editId });
      if (response.dataResponse.returnCode === 0) {
        const emp = response.data;
        let cCode = '+91';
        let pNum = emp.phone || '';
        if (pNum.startsWith('+')) {
          const knownCodes = ['+91', '+1', '+44', '+61', '+81'];
          const matchedCode = knownCodes.find(code => pNum.startsWith(code));
          if (matchedCode) {
            cCode = matchedCode;
            pNum = pNum.slice(matchedCode.length);
          }
        }
        
        // Parse salutation prefix
        const currentFirstName = emp.firstName || '';
        const matched = currentFirstName.match(/^(Mr\.|Ms\.|Mrs\.)/);
        let salutation = 'Mr.';
        let cleanFirstName = currentFirstName;
        if (matched) {
          salutation = matched[0];
          cleanFirstName = currentFirstName.replace(/^(Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
        }

        setSalutationPrefix(salutation);

        form.setFieldsValue({
          ...emp,
          salutation,
          firstName: cleanFirstName,
          countryCode: cCode,
          phone: pNum,
          joiningDate: emp.joiningDate ? dayjs(emp.joiningDate) : null,
        });
      } else {
        message.error('Failed to fetch employee details');
      }
    } catch {
      message.error('Error loading employee data');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (isEdit) {
        fetchEmployee();
      } else {
        form.resetFields();
        setSalutationPrefix('Mr.');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      let encryptedPassword = undefined;
      if (values.password) {
        encryptedPassword = CryptoJS.AES.encrypt(values.password, ENCRYPT_KEY).toString();
      }

      let cleanFirstName = values.firstName || '';
      // Clean prefix if manually typed
      cleanFirstName = cleanFirstName.replace(/^(Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
      
      const finalFirstName = `${salutationPrefix || 'Mr.'} ${cleanFirstName}`;

      const payload = {
        ...values,
        firstName: finalFirstName,
        password: encryptedPassword,
        phone: `${values.countryCode}${values.phone}`,
        id: isEdit ? editId : undefined,
        joiningDate: values.joiningDate ? dayjs(values.joiningDate).format('YYYY-MM-DD') : null,
      };

      const response: any = await ApiService.addEditEmployee(payload);
      if (response.dataResponse.returnCode === 0) {
        message.success(isEdit ? 'Employee updated successfully' : 'Employee added successfully');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.dataResponse.description || 'Operation failed');
      }
    } catch {
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    try {
      setLoading(true);
      const response: any = await ApiService.deleteEmployee({ id: editId });
      if (response.dataResponse.returnCode === 0) {
        message.success('Employee deleted successfully');
        onSuccess();
        onClose();
      } else {
        message.error(response.dataResponse.description || 'Delete failed');
      }
    } catch {
      message.error('An error occurred while deleting the employee.');
    } finally {
      setLoading(false);
    }
  };

  const prefixSelector = (
    <Form.Item name="countryCode" noStyle initialValue="+91">
      <Select className="employee-form-country-code">
        <Select.Option value="+91">+91 (IN)</Select.Option>
        <Select.Option value="+1">+1 (US)</Select.Option>
        <Select.Option value="+44">+44 (UK)</Select.Option>
        <Select.Option value="+61">+61 (AU)</Select.Option>
        <Select.Option value="+81">+81 (JP)</Select.Option>
      </Select>
    </Form.Item>
  );

  return (
    <Drawer
      title={
        <Space>
          {isEdit ? <EditOutlined /> : <UserAddOutlined />}
          <span>{isEdit ? 'Edit Employee' : 'Add New Employee'}</span>
        </Space>
      }
      placement="right"
      width={680}
      onClose={onClose}
      open={open}
      destroyOnClose
      maskClosable={false}
      footer={
        <div className="employee-form-footer">
          <div>
            {isEdit && (
              <Popconfirm
                title="Delete Employee"
                description="Are you sure you want to delete this employee? This action cannot be undone."
                onConfirm={handleDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, style: { background: '#000000', borderColor: '#000000' } }}
              >
                <Button 
                  danger 
                  type="primary" 
                  style={{ background: '#000000', borderColor: '#000000' }} 
                  icon={<DeleteOutlined />}
                  loading={loading}
                >
                  Delete Employee
                </Button>
              </Popconfirm>
            )}
          </div>
          <Space size={12}>
            <Button icon={<CloseOutlined />} onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
              className="employee-form-save-btn"
            >
              {isEdit ? 'Update Employee' : 'Save Employee'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: 1, salary: 0 }}
        disabled={fetching}
      >
        <Divider orientation={"left" as any} plain className="employee-form-divider">
          Personal Information
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="empId"
              label="Emp ID"
              rules={[
                { required: true, message: 'Emp ID is required' },
                { pattern: /^EMP-\d+$/, message: 'Format must be EMP-XXX (e.g. EMP-001)' }
              ]}
            >
              <Input placeholder="e.g. EMP-001" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {!isEdit && (
            <Col span={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select placeholder="Select Gender" size="large" onChange={handleGenderChange}>
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          )}
          <Col span={!isEdit ? 8 : 12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input 
                addonBefore={<span style={{ fontWeight: 600, color: '#475569' }}>{salutationPrefix}</span>} 
                placeholder="e.g. Rohit" 
                size="large" 
              />
            </Form.Item>
          </Col>
          <Col span={!isEdit ? 8 : 12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input placeholder="e.g. Yadav" size="large" />
            </Form.Item>
          </Col>
        </Row>

        {!isEdit && selectedGender === 'Female' && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="salutation"
                label="Salutation (Ms. / Mrs.)"
                rules={[{ required: true, message: 'Please select salutation' }]}
              >
                <Select placeholder="Select Salutation" size="large" onChange={(val) => setSalutationPrefix(val)}>
                  <Select.Option value="Ms.">Ms.</Select.Option>
                  <Select.Option value="Mrs.">Mrs.</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email address' },
              ]}
            >
              <Input placeholder="e.g. rohit@hzl.com" size="large" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              dependencies={['countryCode']}
              rules={[
                { required: true, message: 'Phone number is required' },
                { pattern: /^\d+$/, message: 'Must contain only numbers' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    if (isIndia && value.length !== 10) {
                      return Promise.reject(new Error('Indian phone number must be exactly 10 digits'));
                    }
                    if (!isIndia && value.length !== 15) {
                      return Promise.reject(new Error('International phone number must be exactly 15 digits'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input 
                addonBefore={prefixSelector} 
                placeholder="e.g. 9876543210" 
                size="large" 
                maxLength={isIndia ? 10 : 15} 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="password"
              label={isEdit ? "Update Password" : "Login Password"}
              rules={[
                { required: true, message: 'Password is required' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                  message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
                }
              ]}
              extra={isEdit ? "You can edit this to change their password" : ""}
            >
              <Input.Password placeholder={isEdit ? "Current password" : "Set a secure password"} size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation={"left" as any} plain className="employee-form-divider">
          Job Details
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select a department' }]}
            >
              <Select placeholder="Select department" options={DEPARTMENTS} size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: 'Designation is required' }]}
            >
              <Input placeholder="e.g. Software Engineer" size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please select a location' }]}
            >
              <Select placeholder="Select location" options={LOCATIONS} size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="salary"
              label="Salary (₹)"
              rules={[{ required: true, message: 'Salary is required' }]}
            >
              <InputNumber
                placeholder="e.g. 75000"
                size="large"
                className="employee-form-number-input"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="joiningDate"
              label="Joining Date"
              rules={[{ required: true, message: 'Joining date is required' }]}
            >
              <DatePicker 
                className="employee-form-date-input" 
                size="large" 
                format="DD-MM-YYYY" 
                disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Select status' }]}
            >
              <Select options={STATUS_OPTIONS} size="large" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
