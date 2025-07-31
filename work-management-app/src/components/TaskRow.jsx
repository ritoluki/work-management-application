import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, Save, X, Check } from "lucide-react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import { canDo, getPermissionDeniedMessage } from '../utils/permissions';

const parseTimelineDate = (dateStr) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const match = dateStr.match(/(\w{3})\s+(\d{1,2})/);
  if (match) {
    const [, month, day] = match;
    const monthNum = monthMap[month];
    if (monthNum) {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${monthNum}-${day.padStart(2, '0')}`;
    }
  }
  
  return '';
};

const parseTimeline = (timelineText) => {
  if (!timelineText) return { timelineStart: '', timelineEnd: '' };
  
  const parts = timelineText.split(' - ');
  if (parts.length === 2) {
    const [start, end] = parts;
    
    const startDate = parseTimelineDate(start.trim());
    let endDate = parseTimelineDate(end.trim());
    if (!endDate && startDate && /^\d{1,2}$/.test(end.trim())) {
      const startDateObj = new Date(startDate);
      const year = startDateObj.getFullYear();
      const month = (startDateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = end.trim().padStart(2, '0');
      endDate = `${year}-${month}-${day}`;
    }
    
    return { timelineStart: startDate, timelineEnd: endDate };
  }
  
  return { timelineStart: '', timelineEnd: '' };
};

const TaskRow = ({ task, allTasks, searchFilter, onUpdateTask, onDeleteTask, groupId, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const { timelineStart, timelineEnd } = parseTimeline(task.timeline);
    setEditedTask(prev => ({
      ...task,
      timelineStart,
      timelineEnd
    }));
  }, [task]);

  // Generate unique task name with auto-suffix if needed (for editing, case-insensitive)
  const generateUniqueTaskName = (proposedName, currentTaskId) => {
    const baseName = proposedName.trim();
    const existingNames = allTasks
      .filter(t => t.id !== currentTaskId) // Exclude current task from check
      .map(t => t.name);
    const existingNamesLowerCase = existingNames.map(name => name.toLowerCase());
    
    if (!existingNamesLowerCase.includes(baseName.toLowerCase())) {
      return baseName;
    }
    
    // Find the highest suffix number for this base name
    let counter = 2;
    let uniqueName = `${baseName} (${counter})`;
    
    while (existingNamesLowerCase.includes(uniqueName.toLowerCase())) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }
    
    return uniqueName;
  };

  const formatTimelineFromDates = (startDate, endDate) => {
    if (!startDate && !endDate) return '';
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate).split(' ')[1]}`;
    } else if (startDate) {
      return formatDate(startDate);
    } else if (endDate) {
      return formatDate(endDate);
    }
    
    return '';
  };

  const handleSave = () => {
    // Permission check
    if (!canDo('EDIT_TASK', currentUser.role)) {
      alert(getPermissionDeniedMessage('EDIT_TASK', currentUser.role));
      return;
    }
    
    const uniqueName = generateUniqueTaskName(editedTask.name, task.id);
    const timeline = formatTimelineFromDates(editedTask.timelineStart, editedTask.timelineEnd);
    
    const taskToSave = { 
      ...editedTask, 
      name: uniqueName,
      timeline: timeline
    };
    
    onUpdateTask(groupId, taskToSave);
    setEditedTask(taskToSave); // Update local state with the unique name
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Re-parse timeline when canceling to ensure timelineStart and timelineEnd are set
    const { timelineStart, timelineEnd } = parseTimeline(task.timeline);
    setEditedTask({ ...task, timelineStart, timelineEnd });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    // Only update editedTask, don't save to parent until Save button is clicked
    setEditedTask({ ...editedTask, status: newStatus });
    setShowStatusDropdown(false);
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow status edit when in editing mode
    if (!isEditing) {
      return;
    }
    
    if (!showStatusDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
    setShowStatusDropdown(!showStatusDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showStatusDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="py-3 px-2 w-8">
        <input 
          type="checkbox" 
          className="rounded border-gray-300"
          checked={isEditing ? editedTask.status === 'DONE' : task.status === 'DONE'}
          disabled={!isEditing}
          onChange={() => isEditing && handleStatusChange(editedTask.status === 'DONE' ? 'TODO' : 'DONE')}
        />
      </td>
      <td className="py-3 px-4 w-64 text-center">
        {isEditing ? (
                      <input
              type="text"
              value={editedTask.name}
              onChange={(e) => setEditedTask({...editedTask, name: e.target.value})}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
        ) : (
          <span 
            className={`text-sm block truncate text-center ${
              searchFilter && searchFilter.type === 'task' && String(searchFilter.taskId) === String(task.id)
                ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded font-medium'
                : 'text-gray-700 dark:text-gray-200'
            }`} 
            title={task.name}

          >
            {task.name}
          </span>
        )}
      </td>
      <td className="py-3 px-4 w-32 text-center">
        <div className="flex justify-center">
          <div className="dropdown-container">
            {isEditing ? (
              <button
                ref={buttonRef}
                onClick={handleDropdownToggle}
                className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(editedTask.status)} hover:opacity-80 cursor-pointer`}
              >
                {getStatusLabel(editedTask.status)}
              </button>
            ) : (
              <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            )}
            {isEditing && showStatusDropdown && createPortal(
              <div 
                ref={dropdownRef}
                className="dropdown-menu"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm border-0 bg-transparent text-gray-900 dark:text-gray-200"
                  >
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${option.color}`}></span>
                    {option.label}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>

        </div>
      </td>
      <td className="py-3 px-4 w-24 text-center">
        {isEditing ? (
          <input
            type="date"
            value={editedTask.dueDate}
            onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        ) : (
          <div className="flex items-center justify-center gap-1">
            {task.status === 'DONE' && (
              <Check className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm text-gray-600 dark:text-gray-300 ${task.status === 'DONE' ? 'line-through' : ''}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </td>
      <td className="py-3 px-4 w-28 text-center">
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <input
              type="date"
              value={editedTask.timelineStart || ''}
              onChange={(e) => setEditedTask({...editedTask, timelineStart: e.target.value})}
              className="w-full px-1 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Start"
            />
            <input
              type="date"
              value={editedTask.timelineEnd || ''}
              onChange={(e) => setEditedTask({...editedTask, timelineEnd: e.target.value})}
              className="w-full px-1 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="End"
            />
          </div>
        ) : (
          <span className={`px-2 py-1 rounded text-white text-xs inline-block max-w-full truncate ${getStatusColor(task.status)}`} title={task.timeline}>
            {task.timeline}
          </span>
        )}
      </td>
      <td className="py-3 px-4 w-40 text-center">
        {isEditing ? (
                      <input
              type="text"
              value={editedTask.notes}
              onChange={(e) => setEditedTask({...editedTask, notes: e.target.value})}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-center"
              placeholder="Add notes..."
            />
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-300 block truncate text-center" title={task.notes}>
            {task.notes}
          </span>
        )}
      </td>
      <td className="py-3 px-4 w-32 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-300 block truncate text-center" title={task.assignedToName}>
          {task.assignedToName || 'Unassigned'}
        </span>
      </td>
      <td className="py-3 px-4 w-24 text-center">
        {isEditing ? (
          <select
            value={editedTask.priority}
            onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-2 py-1 rounded text-white text-xs font-medium ${PRIORITY_OPTIONS.find(opt => opt.value === task.priority)?.color || 'bg-gray-500'}`}>
            {PRIORITY_OPTIONS.find(opt => opt.value === task.priority)?.label || 'Normal'}
          </span>
        )}
      </td>
      <td className="py-3 px-4 w-20 text-center">
        <div className="flex items-center justify-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-800 p-1"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {canDo('EDIT_TASK', currentUser.role) && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              )}
              {canDo('DELETE_TASK', currentUser.role) && (
              <button
                onClick={() => onDeleteTask(groupId, task.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TaskRow;