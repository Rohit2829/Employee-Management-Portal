import { useEffect, useState, useRef, useMemo } from 'react';
import { Row, Col, Card, Form, Input, Select, Button, Table, Popconfirm, message, Spin, Space, Drawer, Tag, Switch, Pagination, Tabs, Tooltip, Divider, DatePicker, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, AreaChartOutlined, SearchOutlined, EditOutlined, DownloadOutlined, SwapOutlined, InfoCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';
import ApiService from '../../services/apiService';
import './HealthTracker.css';

interface HealthRecord {
  id: number;
  empId: string;
  location: string;
  symptom: string;
  status: string;
  createdOn: string;
  employeeName: string;
  email?: string;
}

const COLORS = [
  '#3b82f6', // Indigo/Blue for BP
  '#ef4444', // Red for Sugar/Fever
  '#10b981', // Emerald/Green for Malaria
  '#8b5cf6', // Violet/Purple
  '#f59e0b', // Amber/Orange
  '#06b6d4', // Cyan/Teal
  '#ec4899', // Pink
];

const symptomColors: Record<string, string> = {
  'BP': '#3b82f6',      // Blue
  'Fever': '#ef4444',   // Red
  'Malaria': '#10b981', // Green
  'Sugar': '#8b5cf6',   // Purple
};

const getSymptomColor = (symptom: string): string => {
  if (symptomColors[symptom]) {
    return symptomColors[symptom];
  }
  const hash = symptom.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const LOCATIONS = [
  'Ajmer',
  'Bhilwara',
  'Chittorgarh',
  'Jaipur',
  'Kota',
  'Rajsamand',
  'Udaipur'
];

export default function HealthTracker() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomStatuses, setSymptomStatuses] = useState<Record<string, string>>({});
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();

  // Job Rotation states
  const [rotationData, setRotationData] = useState<any[]>([]);
  const [loadingRotation, setLoadingRotation] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [executingRotation, setExecutingRotation] = useState(false);

  // New Features states
  const [trendData, setTrendData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sickLeaves, setSickLeaves] = useState<any[]>([]);
  const [runningScheduler, setRunningScheduler] = useState(false);
  
  const [sickLeaveModalOpen, setSickLeaveModalOpen] = useState(false);
  const [submittingSickLeave, setSubmittingSickLeave] = useState(false);
  const [sickLeaveForm] = Form.useForm();

  const [rotationModalOpen, setRotationModalOpen] = useState(false);
  const [selectedRotationPair, setSelectedRotationPair] = useState<any>(null);
  const [rotationForm] = Form.useForm();

  const fetchRotationSuggestions = async () => {
    try {
      setLoadingRotation(true);
      const response: any = await ApiService.getJobRotationSuggestions();
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        setRotationData(response.data || []);
      } else {
        message.error(response?.dataResponse?.description || 'Failed to fetch job rotation recommendations.');
      }
    } catch (error) {
      message.error('An error occurred while fetching job rotation recommendations.');
    } finally {
      setLoadingRotation(false);
    }
  };

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const response: any = await ApiService.getHealthRecords();
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        setRecords(response.data || []);
      } else {
        message.error(response?.dataResponse?.description || 'Failed to load health records.');
      }
    } catch (error) {
      message.error('An error occurred while fetching health records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const response: any = await ApiService.getSymptomImpactTrend();
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        setTrendData(response.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response: any = await ApiService.getRotationAuditTrail();
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        setAuditLogs(response.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSickLeaves = async () => {
    try {
      const response: any = await ApiService.getSickLeaves();
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        setSickLeaves(response.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const reloadAll = () => {
    fetchHealthRecords();
    fetchRotationSuggestions();
    fetchTrendData();
    fetchAuditLogs();
    fetchSickLeaves();
  };

  useEffect(() => {
    fetchHealthRecords();
    fetchRotationSuggestions();
    fetchTrendData();
    fetchAuditLogs();
    fetchSickLeaves();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, showActiveOnly]);

  const handleOpenAddDrawer = () => {
    setEditingId(null);
    setSelectedSymptoms([]);
    setSymptomStatuses({});
    form.resetFields();
    setDrawerOpen(true);
  };

  const handleAddRecord = async (values: any) => {
    try {
      setSubmitting(true);
      const payload: any = {
        empId: values.empId.trim(),
        location: values.location.trim(),
        symptom: values.symptom,
        statuses: symptomStatuses
      };
      if (editingId) {
        payload.id = editingId;
      }
      const response: any = await ApiService.addHealthRecord(payload);

      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        message.success(editingId ? 'Health record updated successfully!' : 'Health record registered successfully!');
        form.resetFields();
        setEditingId(null);
        setDrawerOpen(false);
        reloadAll();
      } else {
        message.error(response?.dataResponse?.description || 'Failed to save health record.');
      }
    } catch (error) {
      message.error('An error occurred during save.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingId(record.id);
    const symptomsArray = record.symptomsWithStatus.map((s: any) => s.name);
    setSymptomStatuses(Object.fromEntries(record.symptomsWithStatus.map((s: any) => [s.name, s.status])));
    setSelectedSymptoms(symptomsArray);
    form.setFieldsValue({
      empId: record.empId,
      location: record.location,
      symptom: symptomsArray
    });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setSelectedSymptoms([]);
    setSymptomStatuses({});
    form.resetFields();
  };

  const handleExportCSV = () => {
    try {
      if (groupedTableData.length === 0) {
        message.warning('No records available to export.');
        return;
      }

      const headers = ['Employee ID', 'Employee Name', 'Location', 'Symptoms', 'Symptom Statuses'];
      const rows = groupedTableData.map(record => {
        const symptomsList = record.symptomsWithStatus.map((s: any) => s.name).join('; ');
        const statusesList = record.symptomsWithStatus.map((s: any) => `${s.name}: ${s.status}`).join('; ');
        return [
          record.empId,
          record.employeeName,
          record.location,
          symptomsList,
          statusesList
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `employee_health_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Report exported successfully!');
    } catch (error) {
      message.error('Failed to export CSV report.');
    }
  };

  const fetchEmployeeLocation = async (empId: string): Promise<string | null> => {
    try {
      const response: any = await ApiService.getEmployeeList({
        currentPage: 1,
        pageSize: 1,
        searchText: empId.trim()
      });
      if (response?.dataResponse?.returnCode === 0 && response.data?.rows?.length > 0) {
        return response.data.rows[0].location || null;
      }
    } catch {
      // Ignore
    }
    return null;
  };

  const validateLocation = async (_: any, value: string) => {
    const empId = form.getFieldValue('empId');
    if (!empId || !value) return Promise.resolve();

    const existingRecord = records.find(r => r.empId === empId && r.id !== editingId);
    if (existingRecord && existingRecord.location.toLowerCase() !== value.trim().toLowerCase()) {
      return Promise.reject(new Error(`Employee is already registered in ${existingRecord.location}`));
    }

    const loc = await fetchEmployeeLocation(empId);
    if (loc && loc.toLowerCase() !== value.trim().toLowerCase()) {
      return Promise.reject(new Error(`Employee is registered in ${loc}`));
    }

    return Promise.resolve();
  };

  const handleEmpIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (/^EMP-\d+$/.test(val)) {
      const loc = await fetchEmployeeLocation(val);
      if (loc) {
        form.setFieldsValue({ location: loc });
        form.validateFields(['location', 'empId']);
      }
    }
  };

  const handleDeleteRecord = async (empId: string) => {
    try {
      const response: any = await ApiService.deleteHealthRecord({ empId });
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        message.success('Health record deleted successfully.');
        setDrawerOpen(false);
        reloadAll();
      } else {
        message.error('Failed to delete health record.');
      }
    } catch (error) {
      message.error('An error occurred while deleting the record.');
    }
  };

  const handleOpenRotationModal = (candidate: any, counterpart: any) => {
    setSelectedRotationPair({ candidate, counterpart });
    rotationForm.setFieldsValue({
      swapType: 'Permanent',
      durationMonths: 3
    });
    setRotationModalOpen(true);
  };

  const handleExecuteRotationSubmit = async (values: any) => {
    if (!selectedRotationPair) return;
    try {
      setExecutingRotation(true);
      const response: any = await ApiService.executeJobRotation({
        candidateEmpId: selectedRotationPair.candidate.empId,
        counterpartEmpId: selectedRotationPair.counterpart.empId,
        swapType: values.swapType,
        durationMonths: values.swapType === 'Temporary' ? values.durationMonths : null
      });
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        message.success('Job rotation executed successfully!');
        setRotationModalOpen(false);
        setSelectedRotationPair(null);
        setSelectedCandidateId(null);
        reloadAll();
      } else {
        message.error(response?.dataResponse?.description || 'Failed to execute job rotation.');
      }
    } catch (error) {
      message.error('An error occurred during execution of job rotation.');
    } finally {
      setExecutingRotation(false);
    }
  };

  const handleRunScheduler = async () => {
    try {
      setRunningScheduler(true);
      const response: any = await ApiService.runSchedulerSimulation();
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        message.success('Scheduler simulator evaluation completed.');
        reloadAll();
      } else {
        message.error(response?.dataResponse?.description || 'Failed to run scheduler check.');
      }
    } catch (error) {
      message.error('An error occurred running scheduler check.');
    } finally {
      setRunningScheduler(false);
    }
  };

  const handleAddSickLeave = async (values: any) => {
    try {
      setSubmittingSickLeave(true);
      const response: any = await ApiService.addSickLeave({
        empId: values.empId.trim(),
        leaveDate: values.leaveDate.format('YYYY-MM-DD'),
        reason: values.reason
      });

      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        message.success('Sick leave logged successfully!');
        sickLeaveForm.resetFields();
        reloadAll();
      } else {
        message.error(response?.dataResponse?.description || 'Failed to log sick leave.');
      }
    } catch (error) {
      message.error('An error occurred logging sick leave.');
    } finally {
      setSubmittingSickLeave(false);
    }
  };

  const handleRespondToRecommendation = async (logId: number, action: 'Approve' | 'Dismiss') => {
    try {
      const response: any = await ApiService.respondToAutomatedRecommendation({ logId, action });
      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
        message.success(`Recommendation ${action === 'Approve' ? 'approved and executed' : 'dismissed'}.`);
        reloadAll();
      } else {
        message.error(response?.dataResponse?.description || 'Failed to respond to recommendation.');
      }
    } catch (error) {
      message.error('An error occurred responding to recommendation.');
    }
  };

  const filteredRecords = records.filter(record => {
    const query = searchText.toLowerCase().trim();
    if (!query) return true;
    return (
      record.empId.toLowerCase().includes(query) ||
      record.employeeName.toLowerCase().includes(query) ||
      record.location.toLowerCase().includes(query) ||
      record.symptom.toLowerCase().includes(query)
    );
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartInstanceRef = useRef<any>(null);

  // Render & Update Bar Chart
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chartRecords = showActiveOnly
      ? filteredRecords.filter(r => r.status !== 'Resolved')
      : filteredRecords.filter(r => r.status === 'Resolved');

    if (chartRecords.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const uniqueSymptoms = [...new Set(chartRecords.map(r => r.symptom))].sort();
    const locations = [...new Set(chartRecords.map(r => r.location))].sort();

    const datasets = uniqueSymptoms.map((symptom) => {
      const counts = locations.map(loc => {
        const count = chartRecords.filter(r => r.location === loc && r.symptom === symptom).length;
        return count > 0 ? count : null;
      });

      const color = getSymptomColor(symptom);

      return {
        label: symptom,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 0,
        data: counts,
        skipNull: true,
        barThickness: 20
      };
    });

    const rightAlignBarsPlugin = {
      id: 'rightAlignBars',
      afterUpdate(chart: any) {
        const xScale = chart.scales.x;
        if (!xScale) return;
        const datasetCount = chart.data.datasets.length;
        const locationsCount = chart.data.labels.length;

        const getPixel = (scale: any, idx: number) => {
          if (typeof scale.getPixelForTick === 'function') {
            return scale.getPixelForTick(idx);
          }
          if (typeof scale.getPixelForIndex === 'function') {
            return scale.getPixelForIndex(idx);
          }
          return scale.getPixelForValue(idx);
        };

        const categoryWidth = locationsCount > 1 
          ? getPixel(xScale, 1) - getPixel(xScale, 0)
          : xScale.width;

        for (let locIndex = 0; locIndex < locationsCount; locIndex++) {
          const activeBars: any[] = [];
          for (let datasetIndex = 0; datasetIndex < datasetCount; datasetIndex++) {
            const meta = chart.getDatasetMeta(datasetIndex);
            const bar = meta.data[locIndex];
            const value = chart.data.datasets[datasetIndex].data[locIndex];
            if (bar && value !== null && value !== undefined && value > 0) {
              activeBars.push({ bar, datasetIndex });
            }
          }

          if (activeBars.length === 0) continue;

          activeBars.sort((a, b) => a.datasetIndex - b.datasetIndex);

          const barWidth = activeBars[0].bar.width || 20;
          const barGap = 2;

          const categoryCenter = getPixel(xScale, locIndex);
          const categoryRight = categoryCenter + (categoryWidth / 2) - 15;

          for (let k = activeBars.length - 1; k >= 0; k--) {
            const reverseIndex = activeBars.length - 1 - k;
            const newX = categoryRight - (barWidth / 2) - reverseIndex * (barWidth + barGap);
            activeBars[k].bar.x = newX;
          }
        }
      }
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = locations;
      chartInstanceRef.current.data.datasets = datasets;
      chartInstanceRef.current.update();
    } else {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: locations,
          datasets: datasets
        },
        plugins: [rightAlignBarsPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_event: any, elements: any[]) => {
            if (elements && elements.length > 0 && chartInstanceRef.current) {
              const element = elements[0];
              const index = element.index;
              const locationLabel = chartInstanceRef.current.data.labels[index];
              if (locationLabel) {
                setSearchText(locationLabel);
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  family: 'Inter, sans-serif',
                  size: 12,
                  weight: 500
                },
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleFont: {
                family: 'Inter, sans-serif',
                size: 13,
                weight: 600
              },
              bodyFont: {
                family: 'Inter, sans-serif',
                size: 13
              },
              padding: 12,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function (context: any) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + (context.parsed.y === 1 ? ' Employee' : ' Employees');
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f1f5f9'
              },
              ticks: {
                stepSize: 1,
                precision: 0,
                font: {
                  family: 'Inter, sans-serif',
                  size: 12
                },
                color: '#64748b'
              },
              title: {
                display: true,
                text: 'Number of Employees',
                color: '#475569',
                font: {
                  family: 'Inter, sans-serif',
                  size: 13,
                  weight: 600
                },
                padding: 10
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: 'Inter, sans-serif',
                  size: 12
                },
                color: '#64748b'
              },
              title: {
                display: true,
                text: 'Locations',
                color: '#475569',
                font: {
                  family: 'Inter, sans-serif',
                  size: 13,
                  weight: 600
                },
                padding: 10
              }
            }
          }
        }
      });
    }
  }, [filteredRecords, showActiveOnly]);

  // Render & Update Line Chart
  useEffect(() => {
    if (!trendCanvasRef.current || trendData.length === 0) return;
    const ctx = trendCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clean up dates to show as "Jul 28" instead of "2026-07-28"
    const formattedLabels = trendData.map(d => {
      const dateObj = new Date(d.date);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const activeData = trendData.map(d => d.active);
    const resolvedData = trendData.map(d => d.resolved);
    const rotationDataPoints = trendData.map(d => d.rotations);

    if (trendChartInstanceRef.current) {
      trendChartInstanceRef.current.data.labels = formattedLabels;
      trendChartInstanceRef.current.data.datasets[0].data = activeData;
      trendChartInstanceRef.current.data.datasets[1].data = resolvedData;
      trendChartInstanceRef.current.data.datasets[2].data = rotationDataPoints;
      trendChartInstanceRef.current.update();
    } else {
      trendChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: formattedLabels,
          datasets: [
            {
              label: 'Active Symptoms',
              data: activeData,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.02)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#ef4444',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2,
              yAxisID: 'y'
            },
            {
              label: 'Resolved Symptoms',
              data: resolvedData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.02)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#10b981',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2,
              yAxisID: 'y'
            },
            {
              label: 'Rotations Executed',
              data: rotationDataPoints,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.02)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#3b82f6',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2,
              yAxisID: 'y'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  family: 'Inter, sans-serif',
                  size: 12,
                  weight: 500
                },
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleFont: { family: 'Inter, sans-serif', size: 13, weight: 600 },
              bodyFont: { family: 'Inter, sans-serif', size: 13 }
            }
          },
          scales: {
            y: {
              type: 'linear' as const,
              position: 'left',
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: {
                stepSize: 2,
                font: { family: 'Inter, sans-serif', size: 11 },
                color: '#64748b'
              },
              title: {
                display: true,
                text: 'Metrics Count',
                color: '#475569',
                font: { family: 'Inter, sans-serif', size: 12, weight: 600 }
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { family: 'Inter, sans-serif', size: 11 },
                color: '#64748b',
                maxTicksLimit: 8
              },
              title: {
                display: true,
                text: 'Timeline',
                color: '#475569',
                font: { family: 'Inter, sans-serif', size: 13, weight: 600 },
                padding: 10
              }
            }
          }
        }
      });
    }
  }, [trendData]);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (trendChartInstanceRef.current) {
        trendChartInstanceRef.current.destroy();
        trendChartInstanceRef.current = null;
      }
    };
  }, []);

  const groupedTableData = useMemo(() => {
    const map = new Map<string, any>();
    filteredRecords.forEach(({ id, empId, employeeName, email, location, symptom, status }) => {
      if (!map.has(empId)) {
        map.set(empId, { id, empId, employeeName: employeeName || '', email: email || '', location, ss: {} });
      }
      map.get(empId).ss[symptom] = status;
    });

    return Array.from(map.values()).map(m => ({
      ...m,
      symptomsWithStatus: Object.entries(m.ss).map(([name, status]) => ({ name, status: status as string }))
    }));
  }, [filteredRecords]);

  const pendingRecommendations = useMemo(() => {
    return auditLogs.filter(log => log.status === 'Pending' && log.isAutomated);
  }, [auditLogs]);

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 55,
      align: 'center' as const,
      render: (_: unknown, record: any) => groupedTableData.indexOf(record) + 1,
    },
    {
      title: 'Emp ID',
      dataIndex: 'empId',
      key: 'empId',
      sorter: (a: any, b: any) => a.empId.localeCompare(b.empId),
    },
    {
      title: 'Name',
      key: 'employeeName',
      sorter: (a: any, b: any) => a.employeeName.localeCompare(b.employeeName),
      render: (_: unknown, record: any) => (
        <div>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>
            {record.employeeName}
          </span>
          {record.email && (
            <>
              <br />
              <span style={{ color: '#64748b', fontSize: '12px' }}>{record.email}</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a: any, b: any) => a.location.localeCompare(b.location),
    },
    {
      title: 'Symptoms',
      dataIndex: 'symptomsWithStatus',
      key: 'symptoms',
      render: (symptoms: Array<{ name: string; status: string }>) => (
        <Space size={[4, 4]} wrap>
          {symptoms.map(sym => (
            <Tag 
              key={sym.name} 
              style={{ 
                borderRadius: '4px', 
                margin: 0, 
                border: '1px solid #e2e8f0', 
                backgroundColor: '#f8fafc', 
                color: '#334155', 
                fontWeight: 700,
                textDecoration: sym.status === 'Resolved' ? 'line-through' : 'none',
                opacity: sym.status === 'Resolved' ? 0.55 : 1
              }}
            >
              {sym.name}
            </Tag>
          ))}
        </Space>
      ),
      sorter: (a: any, b: any) => 
        a.symptomsWithStatus.map((s: any) => s.name).join(', ')
         .localeCompare(b.symptomsWithStatus.map((s: any) => s.name).join(', ')),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          style={{ color: '#000000' }} 
          onClick={() => handleEditClick(record)} 
        />
      ),
    },
  ];

  if (loading && records.length === 0) {
    return (
      <div className="health-tracker-loading">
        <Spin size="large" tip="Loading Health Records..." />
      </div>
    );
  }

  return (
    <div className="app-container health-tracker-page">
      <Tabs 
        defaultActiveKey="1"
        className="health-tabs-container"
        style={{ marginBottom: '24px' }}
        items={[
          {
            key: '1',
            label: (
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                Health Records & Analytics
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Left Side: Data Management Form and Table */}
                <Col span={24}>
                  <Card bordered={false} className="health-card health-manager-card">
                    <div className="health-card-header">
                      <h2>Employee Health Data</h2>
                      <Space size={8} wrap>
                        <span className="record-badge">{filteredRecords.length} Records</span>
                        <Button 
                          type="default" 
                          size="small" 
                          onClick={() => setSickLeaveModalOpen(true)}
                        >
                          Log Sick Leave
                        </Button>
                        <Button 
                          type="default" 
                          size="small" 
                          loading={runningScheduler}
                          onClick={handleRunScheduler}
                        >
                          Run Scheduler Check
                        </Button>
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<PlusOutlined />} 
                          onClick={handleOpenAddDrawer}
                        >
                          Add Entry
                        </Button>
                      </Space>
                    </div>

                    {/* Local Search Filter */}
                    <div className="health-search-wrapper" style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                      <Input
                        placeholder="Search by ID, Name, Location or Symptom..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                        style={{ flex: 1 }}
                      />
                      {searchText && (
                        <Button 
                          onClick={() => setSearchText('')} 
                          type="text" 
                          danger
                          style={{ fontWeight: 500 }}
                        >
                          Clear Filter
                        </Button>
                      )}
                    </div>

                    {/* Table */}
                    <Table
                      dataSource={groupedTableData.slice((currentPage - 1) * 5, currentPage * 5)}
                      columns={columns}
                      rowKey="empId"
                      pagination={false}
                      size="middle"
                      className="health-table"
                      scroll={{ x: 'max-content' }}
                    />

                    {/* Bottom Actions and Pagination Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={handleExportCSV}
                        className="health-export-btn"
                        size="middle"
                      >
                        Export CSV
                      </Button>
                      {groupedTableData.length > 0 && (
                        <Pagination
                          current={currentPage}
                          pageSize={5}
                          total={groupedTableData.length}
                          onChange={(page) => setCurrentPage(page)}
                          showSizeChanger={false}
                          size="small"
                        />
                      )}
                    </div>
                  </Card>
                </Col>

                {/* Bar Chart Visualizer */}
                <Col xs={24} lg={12}>
                  <Card bordered={false} className="health-card health-chart-card">
                    <div className="health-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2>Symptom Distribution by Location</h2>
                      <Space>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                          {showActiveOnly ? 'Active Cases' : 'Resolved Cases'}
                        </span>
                        <Switch size="small" checked={showActiveOnly} onChange={(val) => setShowActiveOnly(val)} />
                      </Space>
                    </div>
                    
                    <div className="health-chart-body" style={{ minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      {filteredRecords.length > 0 ? (
                        <div style={{ width: '100%', height: '430px' }}>
                          <canvas ref={canvasRef}></canvas>
                        </div>
                      ) : (
                        <div className="health-empty-state">
                          <AreaChartOutlined className="empty-icon" />
                          <p>No health data matches your search query.</p>
                          <span className="subtext">Add a new health record or clear the filters to load chart analytics.</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* Trend Chart Visualizer */}
                <Col xs={24} lg={12}>
                  <Card bordered={false} className="health-card health-chart-card">
                    <div className="health-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2>Symptom Impact Trend</h2>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        30-Day Health Tracker Timeline
                      </span>
                    </div>
                    
                    <div className="health-chart-body" style={{ minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      {trendData.length > 0 ? (
                        <div style={{ width: '100%', height: '430px' }}>
                          <canvas ref={trendCanvasRef}></canvas>
                        </div>
                      ) : (
                        <div className="health-empty-state">
                          <AreaChartOutlined className="empty-icon" />
                          <p>No trend data available.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: '2',
            label: (
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                Job Rotation Engine
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Pending Automated Recommendations Banners */}
                {pendingRecommendations.length > 0 && (
                  <Col span={24}>
                    <Card 
                      bordered={false} 
                      className="health-card" 
                      style={{ borderLeft: '4px solid #3b82f6', background: '#eff6ff' }}
                      title={
                        <span style={{ fontWeight: 600, fontSize: '15px', color: '#1e3a8a' }}>
                          Pending Automated Recommendations ({pendingRecommendations.length})
                        </span>
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingRecommendations.map(rec => (
                          <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                            <div>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {rec.candidateName} ({rec.candidateOldLocation}) ⇄ {rec.counterpartName} ({rec.counterpartOldLocation})
                              </span>
                              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                <strong>Reason:</strong> {rec.reason} | Temporary swap drafted for 3 months.
                              </div>
                            </div>
                            <Space>
                              <Button 
                                size="small" 
                                onClick={() => handleRespondToRecommendation(rec.id, 'Dismiss')}
                              >
                                Dismiss
                              </Button>
                              <Button 
                                type="primary" 
                                size="small" 
                                style={{ background: '#000000', borderColor: '#000000' }}
                                onClick={() => handleRespondToRecommendation(rec.id, 'Approve')}
                              >
                                Approve & Execute
                              </Button>
                            </Space>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )}

                {/* Candidates List */}
                <Col xs={24} lg={10}>
                  <Card 
                    title={
                      <Space size={6}>
                        <span style={{ fontWeight: 600, fontSize: '16px' }}>
                          Flagged High-Risk Candidates
                        </span>
                        <Tooltip title="Flags employees with > 2 active symptoms OR > 3 sick leaves in the past 30 days to suggest job rotations.">
                          <InfoCircleOutlined style={{ color: '#64748b', cursor: 'help', fontSize: '14px' }} />
                        </Tooltip>
                      </Space>
                    }
                    bordered={false}
                    className="health-card"
                    bodyStyle={{ padding: '12px' }}
                  >
                    {loadingRotation ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin tip="Loading suggestions..." />
                      </div>
                    ) : rotationData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                        <CheckCircleOutlined style={{ fontSize: '32px', color: '#10b981', marginBottom: '12px' }} />
                        <p style={{ fontWeight: 500, margin: 0 }}>All Employees Healthy</p>
                        <span style={{ fontSize: '12px' }}>No HZL employees currently exceed the symptom or sick leave load threshold.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {rotationData.map(({ candidate }) => {
                          const isSelected = selectedCandidateId === candidate.empId;
                          return (
                            <div
                              key={candidate.empId}
                              onClick={() => setSelectedCandidateId(candidate.empId)}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: isSelected ? '1px solid #000000' : '1px solid #e2e8f0',
                                backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{candidate.name}</span>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>{candidate.empId} • {candidate.department}</div>
                                </div>
                                <Tag style={{ borderRadius: '4px', margin: 0, border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 500 }}>{candidate.location}</Tag>
                              </div>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {candidate.activeSymptoms.map((sym: string) => (
                                  <Tag key={sym} style={{ borderRadius: '4px', margin: 0, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '11px' }}>{sym}</Tag>
                                ))}
                                {candidate.sickLeaveCount > 3 && (
                                  <Tag style={{ borderRadius: '4px', margin: 0, border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 700, fontSize: '11px' }}>
                                    {candidate.sickLeaveCount} Sick Leaves
                                  </Tag>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </Col>

                {/* Suggestions List */}
                <Col xs={24} lg={14}>
                  <Card
                    title={
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>
                        Recommended Cross-Plant Counterparts
                      </span>
                    }
                    bordered={false}
                    className="health-card"
                  >
                    {(() => {
                      if (!selectedCandidateId) {
                        return (
                          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                            <UserOutlined style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
                            <p style={{ fontWeight: 500, margin: 0 }}>No Candidate Selected</p>
                            <span style={{ fontSize: '12px' }}>Select an employee on the left to show available rotation recommendations.</span>
                          </div>
                        );
                      }

                      const selectedPair = rotationData.find(item => item.candidate.empId === selectedCandidateId);
                      if (!selectedPair) return null;

                      const { candidate, counterparts } = selectedPair;

                      return (
                        <div>
                          <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '16px', border: '1px dashed #cbd5e1' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Target Employee for Rotation</span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                              <div>
                                <strong style={{ color: '#0f172a' }}>{candidate.name}</strong> ({candidate.empId})
                                <div style={{ fontSize: '12px', color: '#475569' }}>Dept: {candidate.department} • Plant: <strong>{candidate.location}</strong></div>
                              </div>
                              <Space size={4}>
                                {candidate.activeSymptoms.map((sym: string) => (
                                  <Tag key={sym} style={{ borderRadius: '4px', margin: 0, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700 }}>{sym}</Tag>
                                ))}
                                {candidate.sickLeaveCount > 3 && (
                                  <Tag style={{ borderRadius: '4px', margin: 0, border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 700 }}>
                                    {candidate.sickLeaveCount} Leaves
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          </div>

                          <Divider style={{ margin: '16px 0' }} />

                          <span style={{ fontWeight: 600, display: 'block', marginBottom: '12px', color: '#334155' }}>
                            Counterpart Swaps ({counterparts.length} matches found)
                          </span>

                          {counterparts.length === 0 ? (
                            <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b' }}>
                              No healthy counterparts in other HZL plants share the same department.
                            </div>
                          ) : (
                            <Table
                              dataSource={counterparts}
                              rowKey="empId"
                              pagination={{ pageSize: 4, size: 'small' }}
                              size="middle"
                              columns={[
                                {
                                  title: 'Employee',
                                  key: 'employee',
                                  render: (_: any, record: any) => (
                                    <div>
                                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{record.name}</span>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>{record.empId}</div>
                                    </div>
                                  )
                                },
                                {
                                  title: 'Plant Location',
                                  dataIndex: 'location',
                                  key: 'location',
                                  render: (text: string) => <Tag style={{ borderRadius: '4px', margin: 0, border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 500 }}>{text}</Tag>
                                },
                                {
                                  title: 'Symptom Load',
                                  key: 'symptomLoad',
                                  render: (_: any, record: any) => (
                                    record.activeSymptoms.length === 0 ? (
                                      <Tag style={{ borderRadius: '4px', margin: 0, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 700 }}>Healthy (0)</Tag>
                                    ) : (
                                      <Space size={2}>
                                        {record.activeSymptoms.map((s: string) => (
                                          <Tag key={s} style={{ borderRadius: '4px', margin: 0, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '11px' }}>{s}</Tag>
                                        ))}
                                      </Space>
                                    )
                                  )
                                },
                                {
                                  title: 'Action',
                                  key: 'action',
                                  width: 120,
                                  render: (_: any, record: any) => (
                                    <Button 
                                      type="primary" 
                                      size="small" 
                                      style={{ background: '#000000', borderColor: '#000000' }}
                                      icon={<SwapOutlined />}
                                      onClick={() => handleOpenRotationModal(candidate, record)}
                                    >
                                      Rotate
                                    </Button>
                                  )
                                }
                              ]}
                            />
                          )}
                        </div>
                      );
                    })()}
                  </Card>
                </Col>

                {/* Audit Trail & Active Temp Swaps */}
                <Col span={24}>
                  <Card 
                    title={
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>
                        Job Rotation Audit Trail & Active Temp Swaps
                      </span>
                    }
                    bordered={false}
                    className="health-card"
                  >
                    <Table
                      dataSource={auditLogs}
                      rowKey="id"
                      pagination={{ pageSize: 5 }}
                      size="middle"
                      columns={[
                        {
                          title: 'Date',
                          dataIndex: 'createdOn',
                          key: 'date',
                          render: (text: string) => text ? new Date(text).toLocaleDateString() : 'N/A',
                        },
                        {
                          title: 'Candidate Employee',
                          key: 'candidate',
                          render: (_, record) => (
                            <div>
                              <strong>{record.candidateName}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{record.candidateEmpId} ({record.candidateOldLocation})</div>
                            </div>
                          )
                        },
                        {
                          title: 'Counterpart Employee',
                          key: 'counterpart',
                          render: (_, record) => (
                            <div>
                              <strong>{record.counterpartName}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{record.counterpartEmpId} ({record.counterpartOldLocation})</div>
                            </div>
                          )
                        },
                        {
                          title: 'Duration Type',
                          key: 'swapType',
                          render: (_, record) => (
                            <Tag style={{ borderRadius: '4px', margin: 0, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155' }}>
                              {record.swapType} {record.durationMonths ? `(${record.durationMonths}m)` : ''}
                            </Tag>
                          )
                        },
                        {
                          title: 'Trigger Metrics',
                          key: 'metrics',
                          render: (_, record) => (
                            <span style={{ fontSize: '12px', color: '#475569' }}>
                              Symptoms: {record.activeSymptomCount} | Leaves: {record.sickLeaveCount}
                            </span>
                          )
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status: string) => {
                            let color = 'default';
                            if (status === 'Active') color = 'processing';
                            if (status === 'Completed') color = 'success';
                            if (status === 'Reverted') color = 'warning';
                            if (status === 'Dismissed') color = 'error';
                            return <Tag color={color} style={{ borderRadius: '4px', fontWeight: 600 }}>{status}</Tag>;
                          }
                        },
                        {
                          title: 'Action',
                          key: 'action',
                          width: 140,
                          render: (_, record) => {
                            if (record.status === 'Active' && record.swapType === 'Temporary') {
                              return (
                                <Popconfirm
                                  title="Revert Temporary Swap?"
                                  description="This will restore both employees back to their original plant locations."
                                  onConfirm={async () => {
                                    try {
                                      const response: any = await ApiService.revertTemporarySwap({ logId: record.id });
                                      if (response?.dataResponse?.returnCode === 0 || response?.dataResponse?.returnCode === '1000') {
                                        message.success('Temporary swap reverted successfully!');
                                        reloadAll();
                                      } else {
                                        message.error('Failed to revert temporary swap.');
                                      }
                                    } catch {
                                      message.error('An error occurred while reverting.');
                                    }
                                  }}
                                  okText="Revert"
                                  cancelText="Cancel"
                                  okButtonProps={{ danger: true, style: { background: '#000000', borderColor: '#000000' } }}
                                >
                                  <Button type="primary" danger size="small" style={{ background: '#000000', borderColor: '#000000' }}>
                                    Revert Swap
                                  </Button>
                                </Popconfirm>
                              );
                            }
                            return null;
                          }
                        }
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* Sliding Drawer Sidebar Form */}
      <Drawer
        title={editingId ? 'Edit Health Entry' : 'Register New Health Entry'}
        placement="right"
        width={400}
        onClose={handleCloseDrawer}
        open={drawerOpen}
        destroyOnClose
        maskClosable={false}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {editingId !== null && (
                <Popconfirm
                  title="Delete Record"
                  description="Are you sure you want to delete this health record? This action cannot be undone."
                  onConfirm={() => {
                    const rec = records.find(r => r.id === editingId);
                    if (rec) {
                      handleDeleteRecord(rec.empId);
                    }
                  }}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, style: { background: '#000000', borderColor: '#000000' } }}
                >
                  <Button 
                    danger 
                    type="primary" 
                    style={{ background: '#000000', borderColor: '#000000' }} 
                    icon={<DeleteOutlined />}
                    loading={submitting}
                  >
                    Delete Record
                  </Button>
                </Popconfirm>
              )}
            </div>
            <Space size={8}>
              <Button onClick={handleCloseDrawer}>Cancel</Button>
              <Button type="primary" onClick={() => form.submit()} loading={submitting}>
                {editingId ? 'Update' : 'Save'}
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleAddRecord}>
          <Form.Item
            name="empId"
            label="Employee ID"
            dependencies={['location']}
            rules={[
              { required: true, message: 'Please input Employee ID!' },
              { pattern: /^EMP-\d+$/, message: 'Format must be EMP-XXX (e.g. EMP-001)' }
            ]}
          >
            <Input placeholder="e.g. EMP-001" disabled={editingId !== null} onChange={handleEmpIdChange} />
          </Form.Item>
          
          <Form.Item
            name="location"
            label="Location"
            dependencies={['empId']}
            rules={[
              { required: true, message: 'Please select Location!' },
              { validator: validateLocation }
            ]}
          >
            <Select placeholder="Select location..." onChange={() => form.validateFields(['empId'])}>
              {LOCATIONS.map(loc => (
                <Select.Option key={loc} value={loc}>{loc}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="symptom"
            label="Symptoms"
            rules={[{ required: true, message: 'Please select at least one Symptom!' }]}
          >
            <Select 
              placeholder="Select symptoms..." 
              mode="multiple"
              onChange={(val) => {
                setSelectedSymptoms(val);
                setSymptomStatuses(prev => {
                  const updated = { ...prev };
                  val.forEach((s: string) => {
                    if (!updated[s]) updated[s] = 'Active';
                  });
                  Object.keys(updated).forEach(k => {
                    if (!val.includes(k)) delete updated[k];
                  });
                  return updated;
                });
              }}
            >
              <Select.Option value="BP">BP</Select.Option>
              <Select.Option value="Fever">Fever</Select.Option>
              <Select.Option value="Sugar">Sugar</Select.Option>
              <Select.Option value="Malaria">Malaria</Select.Option>
            </Select>
          </Form.Item>

          {selectedSymptoms && selectedSymptoms.length > 0 && (
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Symptom Clearance Status
              </label>
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedSymptoms.map(sym => (
                  <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid #f1f5f9', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontWeight: 500, color: '#334155' }}>{sym}</span>
                    <Select 
                      value={symptomStatuses[sym] || 'Active'} 
                      size="small" 
                      style={{ width: '110px' }}
                      onChange={(val) => setSymptomStatuses(prev => ({ ...prev, [sym]: val }))}
                    >
                      <Select.Option value="Active">Active</Select.Option>
                      <Select.Option value="Resolved">Resolved</Select.Option>
                    </Select>
                  </div>
                ))}
              </Space>
            </div>
          )}
        </Form>
      </Drawer>

      {/* Log Sick Leave Modal */}
      <Modal
        title="Manage Sick Leaves"
        open={sickLeaveModalOpen}
        onCancel={() => setSickLeaveModalOpen(false)}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={sickLeaveForm} layout="vertical" onFinish={handleAddSickLeave}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="empId"
                label="Employee ID"
                rules={[
                  { required: true, message: 'Required!' },
                  { pattern: /^EMP-\d+$/, message: 'Format: EMP-XXX' }
                ]}
              >
                <Input placeholder="e.g. EMP-001" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="leaveDate"
                label="Leave Date"
                rules={[{ required: true, message: 'Required!' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reason"
                label="Reason"
              >
                <Input placeholder="e.g. Fever" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={submittingSickLeave} style={{ background: '#000000', borderColor: '#000000' }}>
              Log Leave
            </Button>
          </Form.Item>
        </Form>
        <Divider style={{ margin: '12px 0' }} />
        <h4 style={{ fontWeight: 600, color: '#334155', marginBottom: 10 }}>Recent Sick Leaves Log</h4>
        <Table
          dataSource={sickLeaves}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: 'Employee',
              key: 'employee',
              render: (_, record) => (
                <div>
                  <strong style={{ color: '#0f172a' }}>{record.employeeName}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{record.empId}</div>
                </div>
              )
            },
            {
              title: 'Leave Date',
              dataIndex: 'leaveDate',
              key: 'leaveDate'
            },
            {
              title: 'Reason',
              dataIndex: 'reason',
              key: 'reason'
            }
          ]}
        />
      </Modal>

      {/* Configure Job Rotation Swap Modal */}
      <Modal
        title="Configure Job Rotation Swap"
        open={rotationModalOpen}
        onCancel={() => { setRotationModalOpen(false); setSelectedRotationPair(null); }}
        onOk={() => rotationForm.submit()}
        confirmLoading={executingRotation}
        okButtonProps={{ style: { background: '#000000', borderColor: '#000000' } }}
        destroyOnClose
      >
        {selectedRotationPair && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>{selectedRotationPair.candidate.name}</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedRotationPair.candidate.location}</div>
              </div>
              <SwapOutlined style={{ fontSize: 16, color: '#64748b' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>{selectedRotationPair.counterpart.name}</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedRotationPair.counterpart.location}</div>
              </div>
            </div>
            
            <Form form={rotationForm} layout="vertical" onFinish={handleExecuteRotationSubmit} style={{ marginTop: 16 }}>
              <Form.Item name="swapType" label="Swap Duration Type" rules={[{ required: true }]}>
                <Select onChange={() => rotationForm.validateFields(['durationMonths'])}>
                  <Select.Option value="Permanent">Permanent Swap</Select.Option>
                  <Select.Option value="Temporary">Temporary Swap</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                noStyle 
                shouldUpdate={(prevValues, currentValues) => prevValues.swapType !== currentValues.swapType}
              >
                {({ getFieldValue }) => 
                  getFieldValue('swapType') === 'Temporary' ? (
                    <Form.Item name="durationMonths" label="Temporary Swap Duration" rules={[{ required: true }]}>
                      <Select>
                        <Select.Option value={1}>1 Month</Select.Option>
                        <Select.Option value={3}>3 Months</Select.Option>
                        <Select.Option value={6}>6 Months</Select.Option>
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
