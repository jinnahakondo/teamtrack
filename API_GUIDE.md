## 📋 TeamTrack API Guide

This project is a team collaboration and task management system using Next.js, MongoDB, and NextAuth. It supports:

- User signup/login
- Role-based access control (admin, project_manager, team_member)
- Projects and tasks
- Team member assignment
- Comments and notifications
- Dashboard analytics and workload summaries
- Activity logs


---

## API Design

### 1. Authentication

#### `POST /api/register`
- **Purpose:** user signup
- **Access:** public
- **Required fields:** name, email, password, optional role
- **Validation:**
  - email must be unique
  - password length minimum 6
- **Why:** required before using any protected features

#### `POST /api/auth/[...nextauth]`
- **Purpose:** login
- **Access:** public
- **Implementation:** NextAuth credentials provider + optional Google provider
- **Important:** return user id, role, name, email, and optionally image
- **Why:** establishes session and returns role-based identity

---

### 2. Projects

#### `GET /api/projects`
- **Access:** authenticated
- **Query parameters:** search, status, sortBy, order, page, limit
- **Purpose:** list projects, search, filter, sort, pagination

#### `POST /api/projects`
- **Access:** admin, project_manager
- **Required fields:** name, deadline, teamId
- **Validation:**
  - project name required
  - deadline required
  - deadline cannot be in the past
- **Why:** create new project with team assignment

#### `GET /api/projects/:id`
- **Access:** authenticated
- **Purpose:** view project detail

#### `PATCH /api/projects/:id`
- **Access:** admin, project_manager
- **Purpose:** update project fields
- **Validation:**
  - deadline cannot be in the past
  - status must be one of active, completed, on_hold

#### `DELETE /api/projects/:id`
- **Access:** admin
- **Purpose:** remove a project
- **Why:** destructive operation should be admin-only

---

### 3. Tasks

#### `GET /api/tasks`
- **Access:** authenticated
- **Query parameters:** projectId, status, priority, assignedTo, search, deadlineStatus, sortBy, order, page, limit
- **Behavior:**
  - team_member sees only tasks assigned to them
  - managers/admin see all tasks

#### `POST /api/tasks`
- **Access:** admin, project_manager
- **Required:** projectId, title, dueDate, assignedTo
- **Validation:**
  - title required
  - due date required and must not be past
  - duplicate title inside same project prevented
- **Failure messages:**
  - `"This task already exists in the project"`
  - `"Please select a valid deadline"`

#### `GET /api/tasks/:id`
- **Access:** authenticated
- **Behavior:**
  - team members can view only their assigned tasks

#### `PATCH /api/tasks/:id`
- **Access:** authenticated
- **Behavior:**
  - admin / project_manager can edit fields and reassign
  - team_member can only update their own task status
- **Validation:**
  - assignedTo cannot be changed on a completed task
  - dueDate cannot be set in the past
  - duplicate title in same project prevented on rename
- **Failure messages:**
  - `"Completed tasks cannot be reassigned"`
  - `"Please select a valid deadline"`
  - `"This task already exists in the project"`

#### `DELETE /api/tasks/:id`
- **Access:** admin, project_manager
- **Purpose:** delete task

---

### 4. Teams

#### `GET /api/teams`
- **Access:** admin, project_manager
- **Purpose:** list teams

#### `POST /api/teams`
- **Access:** admin, project_manager
- **Purpose:** create team

#### `GET /api/teams/:id/members`
- **Access:** admin, project_manager
- **Purpose:** list project team members

#### `POST /api/teams/:id/members`
- **Access:** admin, project_manager
- **Purpose:** add member to team

#### `DELETE /api/teams/:id/members`
- **Access:** admin, project_manager
- **Purpose:** remove member from team

---

### 5. Comments

#### `GET /api/comments?taskId=...`
- **Access:** authenticated
- **Purpose:** read task comments

#### `POST /api/comments`
- **Access:** authenticated
- **Purpose:** add a comment
- **Validation:**
  - taskId required
  - content required

---

### 6. Notifications

#### `GET /api/notifications`
- **Access:** authenticated
- **Purpose:** read user notifications
- **Optional:**
  - `PATCH /api/notifications/:id`
  - `DELETE /api/notifications/:id`

---

### 7. Activity Logs

#### `GET /api/activity-logs`
- **Access:** authenticated
- **Purpose:** recent system activity feed

---

### 8. Dashboard

#### `GET /api/dashboard`
- **Access:** authenticated
- **Purpose:** aggregated analytics
- **Returns:**
  - total projects
  - total tasks
  - completed tasks
  - pending tasks
  - overdue tasks
  - tasks by priority
  - tasks by status
  - recent activities
  - upcoming deadlines
  - high-priority tasks
  - project progress summary

---

### 9. Workload

#### `GET /api/workload`
- **Access:** admin, project_manager
- **Purpose:** member productivity and workload summary

---

### 10. Attachments (Optional)

#### `POST /api/attachments`
- **Purpose:** upload file attachment

#### `GET /api/attachments`
- **Purpose:** list attachments

#### `DELETE /api/attachments/:id`
- **Purpose:** delete attachment

*This is optional but useful if you want file uploads and task attachments.*

---

## Role-Based Access Matrix

| API Resource | Admin | Project Manager | Team Member |
| --- | --- | --- | --- |
| /api/register | yes | yes | yes |
| /api/auth/[...nextauth] | yes | yes | yes |
| GET /api/projects | yes | yes | yes |
| POST /api/projects | yes | yes | no |
| PATCH /api/projects/:id | yes | yes | no |
| DELETE /api/projects/:id | yes | no | no |
| GET /api/tasks | yes | yes | yes (assigned only) |
| POST /api/tasks | yes | yes | no |
| GET /api/tasks/:id | yes | yes | yes (assigned only) |
| PATCH /api/tasks/:id | yes | yes | yes (status only, own tasks) |
| DELETE /api/tasks/:id | yes | yes | no |
| GET /api/teams | yes | yes | no |
| POST /api/teams | yes | yes | no |
| GET /api/teams/:id/members | yes | yes | no |
| POST /api/teams/:id/members | yes | yes | no |
| DELETE /api/teams/:id/members | yes | yes | no |
| GET /api/comments | yes | yes | yes |
| POST /api/comments | yes | yes | yes |
| GET /api/notifications | yes | yes | yes |
| GET /api/activity-logs | yes | yes | yes |
| GET /api/dashboard | yes | yes | yes |
| GET /api/workload | yes | yes | no |

---

## Step-by-Step Implementation

### Step 1: Build Auth
- [ ] Implement `POST /api/register`
  - [ ] validate input
  - [ ] hash password before save
  - [ ] assign default role team_member
- [ ] Implement `POST /api/auth/[...nextauth]`
  - [ ] use connectDb
  - [ ] lookup user, compare password
  - [ ] include role in JWT and session

### Step 2: Add Auth Helpers
- [ ] Implement `requireAuth()` to enforce logged-in users
- [ ] Implement `requireRole(...roles)` to enforce role access
- [ ] Use these helpers in every API route

### Step 3: Build Project API
- [ ] `GET /api/projects`
- [ ] `POST /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `PATCH /api/projects/:id`
- [ ] `DELETE /api/projects/:id`

### Step 4: Build Task API
- [ ] `GET /api/tasks`
- [ ] `POST /api/tasks`
- [ ] `GET /api/tasks/:id`
- [ ] `PATCH /api/tasks/:id`
- [ ] `DELETE /api/tasks/:id`

### Step 5: Build Team API
- [ ] `GET /api/teams`
- [ ] `POST /api/teams`
- [ ] `GET /api/teams/:id/members`
- [ ] `POST /api/teams/:id/members`
- [ ] `DELETE /api/teams/:id/members`

### Step 6: Build Comments + Notifications
- [ ] `GET /api/comments`
- [ ] `POST /api/comments`
- [ ] `GET /api/notifications`

### Step 7: Build Analytics
- [ ] `GET /api/dashboard`
- [ ] `GET /api/workload`
- [ ] `GET /api/activity-logs`

### Step 8: Connect Frontend
- [ ] Login/register pages
- [ ] Dashboard page
- [ ] Projects page
- [ ] Tasks page
- [ ] Team page
- [ ] Task comments and notifications

---

## Why This API Structure is Perfect

- **Each domain has a clear route set** - Projects, tasks, teams are separated logically
- **List endpoints use query filters instead of many duplicate APIs** - Keeps route count minimal
- **Role rules are enforced server-side** - Never trust client-side auth
- **Team members cannot access manager/admin actions** - Proper access control
- **Dashboard/workload are separate** - They return aggregated data, not entity CRUD
- **Optional attachments can be added later** - Without changing core APIs

---

## Key Validation Rules (IMPORTANT!)

### Tasks
- **No duplicate titles** within the same project
  - Error: `"This task already exists in the project"`
- **Completed tasks cannot be reassigned**
  - Error: `"Completed tasks cannot be reassigned"`
- **No past deadlines**
  - Error: `"Please select a valid deadline"`

### Projects
- **No past deadlines**
  - Error: `"Please select a valid deadline"`

### Teams
- **No duplicate membership**
  - Error: `"User is already a member of this team"`

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtrack
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
```

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Next.js 16 API Routes
- **Database:** MongoDB + Mongoose
- **Authentication:** NextAuth v4
- **Styling:** Tailwind CSS (with dark mode)

---

## Ready to Use

Paste this into your README.md and use it as your API implementation checklist.

If you want, generate a second block that turns this into a project task list with exact file names and endpoint validation checks.

---

## License