import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Info, Calendar, Clock, Edit2, Trash2, Save, X } from "lucide-react";
import TaskRow from './TaskRow';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';
import { getBorderColor, getTextColor } from '../utils/helpers';
import { canDo, getPermissionDeniedMessage } from '../utils/permissions';
import { userService } from '../services/userService';

const TaskGroup = ({ group, allGroups, searchFilter, isExpanded, onUpdateGroup, onDeleteGroup, onAddTask, onUpdateTask, onDeleteTask, currentUser }) => {
  const [localExpanded, setLocalExpanded] = useState(true);
  // const [hasBeenIndividuallyToggled, setHasBeenIndividuallyToggled] = useState(false);
  const [lastParentState, setLastParentState] = useState(isExpanded);

  useEffect(() => {
    if (isExpanded !== undefined && isExpanded !== lastParentState) {
      // Parent state changed - reset individual toggle and sync
      // setHasBeenIndividuallyToggled(false);
      setLocalExpanded(isExpanded);
      setLastParentState(isExpanded);
    }
  }, [isExpanded, lastParentState]);

  // Use local state for display
  const currentExpanded = localExpanded;
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const [showAddTask, setShowAddTask] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    name: '',
    status: 'Todo',
    dueDate: '',
    timelineStart: '',
    timelineEnd: '',
    notes: '',
    priority: 'normal',
    assignedTo: ''
  });

  // Load users for assignment dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const generateUniqueGroupName = (proposedName, currentGroupId) => {
    const baseName = proposedName.trim();
    const existingNames = allGroups
      .filter(g => g.id !== currentGroupId) // Exclude current group from check
      .map(g => g.name);
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

  const handleSaveName = () => {
    if (editedName.trim()) {
      const uniqueName = generateUniqueGroupName(editedName, group.id);
      onUpdateGroup({ ...group, name: uniqueName });
      setEditedName(uniqueName);
    }
    setIsEditingName(false);
  };

  // Generate unique task name with auto-suffix if needed (case-insensitive)
  const generateUniqueTaskName = (proposedName) => {
    const baseName = proposedName.trim();
    const existingNames = group.tasks.map(task => task.name);
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

  const handleAddTask = () => {
    // Permission check
    if (!canDo('CREATE_TASK', currentUser.role)) {
      alert(getPermissionDeniedMessage('CREATE_TASK', currentUser.role));
      return;
    }

    if (newTask.name.trim()) {
      const uniqueName = generateUniqueTaskName(newTask.name);
      const timeline = formatTimelineFromDates(newTask.timelineStart, newTask.timelineEnd);

      const task = {
        ...newTask,
        id: Date.now() + Math.random(), // More unique ID
        name: uniqueName,
        timeline: timeline,
        createdAt: new Date().toISOString()
      };
      onAddTask(group.id, task);
      setNewTask({
        name: '',
        status: 'Todo',
        dueDate: '',
        timelineStart: '',
        timelineEnd: '',
        notes: '',
        priority: 'normal',
        assignedTo: ''
      });
      setShowAddTask(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-6">
      <div className={`border-l-4 ${getBorderColor(group.color)}`}>
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLocalExpanded(!currentExpanded);
                // setHasBeenIndividuallyToggled(true);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              {currentExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 transition-colors duration-200"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(group.name);
                  }}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h3 className={`font-medium ${getTextColor(group.color)}`}>
                {group.name}
              </h3>
            )}

            <span className="text-sm text-gray-500">({group.tasks.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {canDo('EDIT_GROUP', currentUser.role) && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 transition-colors duration-200"
                title="Edit group name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDo('DELETE_GROUP', currentUser.role) && (
              <button
                onClick={() => onDeleteGroup(group.id)}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 p-1 transition-colors duration-200"
                title="Delete group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {currentExpanded && (
          <div className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-2 px-2 w-10"></th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-60">Task</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-32">
                      <div className="flex items-center justify-center gap-1">
                        Status
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-28">
                      <div className="flex items-center justify-center gap-1">
                        Due date
                        <Calendar className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-36">
                      <div className="flex items-center justify-center gap-1">
                        Timeline
                        <Clock className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-40">Notes</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-32">
                      <div className="flex items-center justify-center gap-1">
                        Assigned
                      </div>
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-28">
                      <div className="flex items-center justify-center gap-1">
                        Priority
                      </div>
                    </th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tasks
                    .filter(task => {
                      // Apply search filter for tasks
                      if (!searchFilter || searchFilter.type !== 'task') return true;
                      return String(task.id) === String(searchFilter.taskId);
                    })
                    .map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        groupId={group.id}
                        allTasks={group.tasks}
                        searchFilter={searchFilter}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        currentUser={currentUser}
                      />
                    ))}

                  {showAddTask && (
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-700/50">
                      <td className="py-3 px-2">
                        <input type="checkbox" className="rounded border-gray-300" disabled />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="text"
                          value={newTask.name}
                          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                          placeholder="Task name"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-center"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                          autoFocus
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={newTask.status}
                          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col gap-1">
                          <input
                            type="date"
                            value={newTask.timelineStart}
                            onChange={(e) => setNewTask({ ...newTask, timelineStart: e.target.value })}
                            className="w-full px-1 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            placeholder="Start"
                          />
                          <input
                            type="date"
                            value={newTask.timelineEnd}
                            onChange={(e) => setNewTask({ ...newTask, timelineEnd: e.target.value })}
                            className="w-full px-1 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-xs focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            placeholder="End"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="text"
                          value={newTask.notes}
                          onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                          placeholder="Add notes..."
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-center"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={newTask.assignedTo}
                          onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                          {PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleAddTask}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 transition-colors duration-200"
                            title="Save task"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowAddTask(false)}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-colors duration-200"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!showAddTask && canDo('CREATE_TASK', currentUser.role) && (
                    <tr>
                      <td className="py-3 px-2">
                        <Plus className="w-4 h-4 text-blue-500" />
                      </td>
                      <td className="py-3 px-4" colSpan={8}>
                        <button
                          onClick={() => setShowAddTask(true)}
                          className="text-blue-500 hover:text-blue-700 text-sm w-full text-left"
                        >
                          + Add task
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskGroup;