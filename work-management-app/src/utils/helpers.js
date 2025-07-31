import { STATUS_OPTIONS, PRIORITY_OPTIONS } from './constants';

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getStatusColor = (status) => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption ? statusOption.color : 'bg-gray-400';
};

export const getStatusLabel = (status) => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption ? statusOption.label : status;
};

export const getPriorityColor = (priority) => {
  const priorityOption = PRIORITY_OPTIONS.find(option => option.value === priority);
  return priorityOption ? priorityOption.color : 'bg-gray-400';
};

export const getPriorityLabel = (priority) => {
  const priorityOption = PRIORITY_OPTIONS.find(option => option.value === priority);
  return priorityOption ? priorityOption.label : priority;
};

export const getBorderColor = (color) => {
  switch (color) {
    case 'blue': return 'border-blue-400';
    case 'green': return 'border-green-400';
    case 'red': return 'border-red-400';
    case 'purple': return 'border-purple-400';
    default: return 'border-gray-400';
  }
};

export const getTextColor = (color) => {
  switch (color) {
    case 'blue': return 'text-blue-600';
    case 'green': return 'text-green-600';
    case 'red': return 'text-red-600';
    case 'purple': return 'text-purple-600';
    default: return 'text-gray-600';
  }
};