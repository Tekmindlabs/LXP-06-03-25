# Dashboard Routing Structure

This directory contains the central dashboard page that handles role-based routing in the AIVY LXP application.

## How It Works

1. When a user navigates to `/dashboard`, the `layout.tsx` file in this directory checks the user's role.
2. Based on the user's role, they are redirected to the appropriate role-specific dashboard.

## Role-Based Dashboards

All role-specific dashboards are now located in their own directories:

- `/admin/system`: System Admin dashboard
- `/admin/campus`: Campus Admin dashboard
- `/admin/coordinator`: Coordinator dashboard
- `/teacher/dashboard`: Teacher dashboard
- `/student/dashboard`: Student dashboard
- `/parent/dashboard`: Parent dashboard

## Settings Pages

Settings pages are located in the `src/app/(dashboard)/settings` directory and are shared across all roles.
The appropriate settings are displayed based on the user's role.

## Important Notes

- This structure avoids routing conflicts by using distinct URL paths for each role-specific dashboard.
- All role-specific dashboards use the shared `RoleDashboard` component from `src/components/dashboard/RoleDashboard.tsx`.
- The dashboard layout handles the initial role check and redirection.
