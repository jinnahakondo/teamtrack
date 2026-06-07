Smart Project & Task Collaboration System
Build a full-stack web application that helps teams manage projects, tasks, team members, and work progress with proper validation and workflow handling.
1. Authentication
User Authentication
User Signup & Login
Email + Password authentication
Secure session/token handling
After login → redirect to Dashboard
Include a Demo Login button (pre-filled credentials)
Role-Based Access Control
Support at least:
Admin
Project Manager
Team Member
Role Permissions Example
Admin → Full system access
Project Manager → Create/manage projects and assign tasks
Team Member → Update assigned tasks only
2. Project Management
Users can create and manage projects.
Project Fields
Each project includes:
Project Name
Description
Deadline
Project Status:
Active
Completed
On Hold
Users can:
Create projects
Update project details
Delete projects
View all projects
3. Task Management
Users can create tasks under projects.
Task Fields
Each task includes:
Task Title
Description
Assigned Member
Due Date
Priority:
High
Medium
Low
Task Status:
Todo
In Progress
Completed
Features
Users can:
Create tasks
Edit tasks
Delete tasks
Change task status
View tasks by project or status
4. Task Validation & Conflict Handling
While creating/updating tasks:
Rules
Prevent duplicate task titles inside the same project
Prevent assigning completed tasks
Prevent setting past dates as deadlines
Example Messages
“This task already exists in the project.”
“Completed tasks cannot be reassigned.”
“Please select a valid deadline.”
5. Team Collaboration
Team Features
Users can:
Add team members to projects
Assign tasks to members
View member-wise task lists
Workload Summary
Display:
Total tasks per member
Completed tasks
Pending tasks
6. Progress Tracking
Dashboard Insights
Display:
Total Projects
Total Tasks
Completed Tasks
Pending Tasks
Overdue Tasks
Project Summary Example
Website Redesign — 5 tasks pending
Mobile App — 80% completed
Admin Dashboard — Deadline in 2 days
7. Activity Log
Track recent system activities.
Examples
10:00 AM — Project “E-Commerce App” created
10:15 AM — Task “Setup API” assigned to John
10:30 AM — Task “Homepage Design” marked as Completed
11:00 AM — Member added to “Dashboard Project”
Show latest 5–10 activities.
8. Dashboard & Analytics
Display project progress and team productivity insights.
KPI Cards
Total Projects
Total Tasks
Completed Tasks
Pending Tasks
Overdue Tasks
Charts / Analytics
Examples:
Tasks by Priority
Project Progress Trend
Team Productivity Overview
Task Status Distribution
Additional Dashboard Features
Recent Activities
Upcoming Deadlines
High Priority Tasks
Member Workload Summary
9. Search, Filtering & Productivity Features
Support advanced task and project management features.
Search Features
Users can:
Search projects by name
Search tasks by title or description
Search team members by name
Filter Options
Filter tasks/projects by:
Project Status
Task Status
Priority
Assigned Member
Deadline Status (Upcoming / Overdue)
Pagination & Navigation
Pagination or Infinite Scroll for large datasets
Responsive table/grid layouts
Sorting Options
Sort by:
Latest Created
Nearest Deadline
Highest Priority
Recently Updated
Productivity Features
Quick task status update
Bulk task actions (optional)
Task progress indicators
Recent activity shortcuts
10. Additional Features
Dark/Light mode
File attachment support
Comments on tasks
Notification system
Simple analytics chart
Role-based access (Admin / Member)
11. Technical Instructions
Any frontend, backend, database, or deployment technology can be used for this assessment.
Candidates are free to choose any architecture or development approach.
Clean code structure and proper validation are expected.
12. Deployment Requirements
The application must be deployed and publicly accessible.
Provide:
Live Application URL
GitHub Repository
README Documentation
README should include:
Project setup instructions
Features overview
Environment variables
Demo credentials
Deployment instructions
