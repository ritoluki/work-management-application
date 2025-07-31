# 🔐 Permission System Testing Guide

## 🎮 Demo Accounts Available

### 👑 **ADMIN** (`admin@demo.com` / `123456`)
**Full access to everything**
- ✅ Can create/edit/delete workspaces  
- ✅ Can create/edit/delete boards
- ✅ Can create/edit/delete groups  
- ✅ Can create/edit/delete tasks
- ✅ All buttons visible
- 🎨 Red badge with crown icon

### 🔧 **MANAGER** (`manager@demo.com` / `123456`)  
**Can manage boards and tasks**
- ❌ Cannot delete workspaces
- ✅ Can create/edit boards (no delete)
- ✅ Can create/edit/delete groups
- ✅ Can create/edit/delete tasks  
- 🎨 Blue badge with wrench icon

### 👤 **MEMBER** (`member@demo.com` / `123456`)
**Can work with tasks**
- ❌ Cannot manage workspaces
- ❌ Cannot create/delete boards
- ✅ Can create/edit groups (no delete)
- ✅ Can create/edit tasks (no delete)
- 🎨 Green badge with person icon

### 👁️ **VIEWER** (`viewer@demo.com` / `123456`)
**Read-only access**
- ❌ Cannot create/edit/delete anything
- ✅ Can only view and navigate
- ❌ No action buttons visible
- 🎨 Gray badge with eye icon

---

## 🧪 Testing Scenarios

### **1. Login Flow Testing**
1. Open app at `http://localhost:3000`
2. See 4 demo account cards
3. Click any account → instant login
4. Check role badge appears in header
5. Logout and try different role

### **2. Workspace Management Testing**

#### **As ADMIN:**
- ✅ See workspace dropdown with edit/delete icons on hover
- ✅ Can click "Add workspace" 
- ✅ Can edit workspace names (✏️ icon)
- ✅ Can delete workspaces (🗑️ icon) - except last one

#### **As MANAGER/MEMBER/VIEWER:**
- ❌ No "Add workspace" option in dropdown
- ❌ No edit/delete icons on workspace hover
- ❌ Click edit/delete → permission denied alert

### **3. Board Management Testing**

#### **As ADMIN:**
- ✅ See "+" button next to workspace name
- ✅ Can edit board names (hover board → ✏️)  
- ✅ Can delete boards (hover board → 🗑️)

#### **As MANAGER:**
- ✅ See "+" button (can create boards)
- ✅ Can edit board names  
- ❌ No delete button (cannot delete boards)

#### **As MEMBER/VIEWER:**
- ❌ No "+" button visible
- ❌ No edit/delete icons on hover
- ❌ Click edit/delete → permission denied alert

### **4. Empty Workspace Testing**

#### **As ADMIN/MANAGER:**
- ✅ See "Tạo board đầu tiên" button
- ✅ Can click to create board

#### **As MEMBER/VIEWER:**  
- ❌ See "🔒 Không có quyền tạo board" instead
- ❌ Different message about contacting Admin

### **5. Group & Task Testing**

#### **As ADMIN:**
- ✅ All group/task CRUD operations
- ✅ All edit/delete buttons visible

#### **As MANAGER:**
- ✅ Can create/edit groups and tasks
- ✅ Can delete groups and tasks  

#### **As MEMBER:**
- ✅ Can create/edit groups and tasks
- ❌ Cannot delete groups or tasks

#### **As VIEWER:**
- ❌ No action buttons visible
- ❌ Pure read-only interface

---

## 🎯 Quick Test Checklist

### **ADMIN Role:**
- [ ] Role badge shows "👑 ADMIN" in red
- [ ] Can see all workspace edit/delete icons
- [ ] Can create new workspaces  
- [ ] Can create/edit/delete boards
- [ ] Can create/edit/delete groups
- [ ] Can create/edit/delete tasks

### **MANAGER Role:**
- [ ] Role badge shows "🔧 MANAGER" in blue  
- [ ] Cannot see workspace edit/delete
- [ ] Can create/edit boards (no delete)
- [ ] Can create/edit/delete groups  
- [ ] Can create/edit/delete tasks

### **MEMBER Role:**
- [ ] Role badge shows "👤 MEMBER" in green
- [ ] Cannot create/edit boards
- [ ] Can create/edit groups (no delete)
- [ ] Can create/edit tasks (no delete)

### **VIEWER Role:**
- [ ] Role badge shows "👁️ VIEWER" in gray
- [ ] No action buttons anywhere
- [ ] Read-only interface only
- [ ] Empty workspace shows permission message

---

## 🚨 Expected Error Messages

### **Workspace Actions:**
- `"Chỉ Admin mới có thể tạo workspace!"`
- `"Chỉ Admin mới có thể xóa workspace!"`  
- `"Chỉ Admin mới có thể sửa workspace!"`

### **Board Actions:**
- `"Bạn cần quyền Manager trở lên để tạo board!"`
- `"Chỉ Admin mới có thể xóa board!"`
- `"Bạn cần quyền Manager trở lên để sửa board!"`

### **Group/Task Actions:**
- `"Bạn cần quyền Manager trở lên để xóa group!"`
- `"Bạn cần quyền Manager trở lên để xóa task!"`

---

## 💡 Tips for Testing

1. **Switch Roles Frequently:** Test same action with different roles
2. **Check UI Changes:** Notice buttons appear/disappear based on role
3. **Test Edge Cases:** Try actions that should be blocked
4. **Verify Messages:** Check error messages are helpful and in Vietnamese
5. **Test Empty States:** Create empty workspace and test with different roles

---

## 🔧 Development Notes

### **Permission System Files:**
- `src/utils/permissions.js` - Permission matrix & canDo function
- `src/utils/mockUsers.js` - Demo accounts & styling helpers  
- `src/components/LoginForm.jsx` - Demo account selector
- `src/components/WorkManagement.jsx` - All permission checks

### **Key Functions:**
- `canDo(action, role)` - Check if role can perform action
- `getPermissionDeniedMessage(action, role)` - Get localized error message
- Demo accounts with realistic role hierarchy

---

## ✅ Success Criteria

**Permission system is working correctly when:**
- ✅ Each role sees appropriate UI elements only
- ✅ Blocked actions show helpful error messages  
- ✅ Role badges display correctly in header
- ✅ Demo accounts login instantly
- ✅ No console errors during role switching
- ✅ Empty states handle permissions gracefully 