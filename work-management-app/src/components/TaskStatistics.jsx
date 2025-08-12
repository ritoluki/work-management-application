import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { taskService } from '../services/taskService';
import { BarChart3, PieChart as PieChartIcon, RefreshCw, TrendingUp } from 'lucide-react';

const TaskStatistics = () => {
  const [taskStats, setTaskStats] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'
  const [loading, setLoading] = useState(false);

  const statusColors = {
    'TODO': '#3B82F6',          // Xanh da trời
    'WORKING_ON_IT': '#F59E0B', // Vàng
    'DONE': '#10B981',          // Xanh lá
    'EXPIRED': '#EF4444'        // Đỏ
  };

  const statusLabels = {
    'TODO': 'Cần làm',
    'WORKING_ON_IT': 'Đang làm',
    'DONE': 'Hoàn thành',
    'EXPIRED': 'Quá hạn'
  };

  useEffect(() => {
    loadTaskStatistics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTaskStatistics = async () => {
    setLoading(true);
    try {
      // Lấy tất cả tasks từ tất cả boards
      const response = await taskService.getAllTasks();
      const allTasks = response.data || response; // Handle both response.data and direct array
      
      if (!Array.isArray(allTasks)) {
        console.error('getAllTasks did not return an array:', allTasks);
        setTaskStats([]);
        setTotalTasks(0);
        return;
      }
      
      // Đếm số lượng task theo status
      const statusCount = {};
      let total = 0;

      allTasks.forEach(task => {
        const status = task.status || 'TODO';
        statusCount[status] = (statusCount[status] || 0) + 1;
        total++;
      });



      // Chuyển đổi thành format cho biểu đồ
      const chartData = Object.keys(statusCount).map(status => ({
        status: status,
        label: statusLabels[status] || status,
        count: statusCount[status],
        color: statusColors[status] || '#8884d8',
        percentage: total > 0 ? ((statusCount[status] / total) * 100).toFixed(1) : 0
      }));

      setTaskStats(chartData);
      setTotalTasks(total);
    } catch (error) {
      console.error('Error loading task statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Custom label cho pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Không hiển thị label nếu < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thống kê Task theo Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng cộng: {totalTasks} tasks</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle Chart Type */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'pie' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'bar' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={loadTaskStatistics}
            disabled={loading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : taskStats.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có dữ liệu task</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={taskStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} tasks (${props.payload.percentage}%)`,
                      props.payload.label
                    ]}
                  />
                  <Legend
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color }}>
                        {taskStats.find(item => item.status === value)?.label || value}
                      </span>
                    )}
                  />
                </PieChart>
              ) : (
                <BarChart data={taskStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="label" 
                    fontSize={12}
                    className="fill-gray-600 dark:fill-gray-400"
                  />
                  <YAxis 
                    fontSize={12}
                    className="fill-gray-600 dark:fill-gray-400"
                  />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} tasks (${props.payload.percentage}%)`,
                      'Số lượng'
                    ]}
                    labelFormatter={(label) => `Status: ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {taskStats.map((stat) => (
              <div key={stat.status} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stat.color }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.count} tasks ({stat.percentage}%)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStatistics;
