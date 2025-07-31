// Mock user data - REMOVED: Now using DEMO_ACCOUNTS from mockUsers.js
  
// Initial data structure
export const INITIAL_DATA = {
  workspaces: [
    {
      id: 1,
      name: "Main workspace",
      boards: [
        {
          id: 1,
          name: "TakaIT",
          groups: [
            {
              id: 1,
              name: "To-Do",
              color: "blue",
              tasks: [
                {
                  id: 1,
                  name: "Task 1",
                  status: "WORKING_ON_IT",
                  dueDate: "2024-07-21",
                  timeline: "Jul 21 - 22",
                  notes: "Action items",
                  priority: "HIGH",
                  createdAt: new Date().toISOString()
                },
                {
                  id: 2,
                  name: "Task 2",
                  status: "DONE",
                  dueDate: "2024-07-22",
                  timeline: "Jul 23 - 24",
                  notes: "Meeting notes",
                  priority: "NORMAL",
                  createdAt: new Date().toISOString()
                },
                {
                  id: 3,
                  name: "Task 3",
                  status: "TODO",
                  dueDate: "2024-07-23",
                  timeline: "Jul 25 - 26",
                  notes: "Other",
                  priority: "LOW",
                  createdAt: new Date().toISOString()
                },
                {
                  id: 4,
                  name: "Lập trình chức năng margin",
                  status: "EXPIRED",
                  dueDate: "2024-07-19",
                  timeline: "Jul 1 - 19",
                  notes: "Lập trình chức năng...",
                  priority: "HIGH",
                  createdAt: new Date().toISOString()
                }
              ]
            },
            {
              id: 2,
              name: "Feature todo",
              color: "green",
              tasks: []
            }
          ]
        }
      ]
    }
  ]
};

export const STATUS_OPTIONS = [
  { value: "TODO", color: "bg-gray-500", label: "Todo" },
  { value: "WORKING_ON_IT", color: "bg-orange-500", label: "Working on it" },
  { value: "DONE", color: "bg-green-500", label: "Done" },
  { value: "EXPIRED", color: "bg-red-500", label: "Expired" }
];

export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "bg-blue-400" },
  { value: "NORMAL", label: "Normal", color: "bg-yellow-400" },
  { value: "HIGH", label: "High", color: "bg-red-500" }
];