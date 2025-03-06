# Role-Based Access Control (RBAC) Documentation

This document provides an overview of the Role-Based Access Control (RBAC) system implemented in the AIVY LXP application. The RBAC system controls access to features, pages, and UI elements based on user roles, permissions, and access scopes.

## Components

The RBAC system consists of the following components:

### 1. AccessControl

`AccessControl` is a component that conditionally renders content based on the user's role, access scope, and permissions.

#### Usage

```tsx
import { AccessControl } from '@/components/auth/AccessControl';
import { UserType } from '@prisma/client';

// Basic usage
<AccessControl
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
  allowedUserTypes={['TEACHER', 'COORDINATOR']}
>
  <p>Only teachers and coordinators can see this content</p>
</AccessControl>

// With fallback content
<AccessControl
  userType="CAMPUS_STUDENT"
  accessScope="SINGLE_CAMPUS"
  allowedUserTypes={['TEACHER', 'COORDINATOR']}
  fallback={<p>You don't have permission to view this content</p>}
>
  <p>Only teachers and coordinators can see this content</p>
</AccessControl>

// With permissions
<AccessControl
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
  requiredPermissions={['edit_course']}
  userPermissions={['view_course', 'edit_course']}
>
  <button>Edit Course</button>
</AccessControl>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | The content to render if the user has access |
| `allowedUserTypes` | `UserType[]` | Optional array of user types allowed to access the content |
| `allowedScopes` | `AccessScope[]` | Optional array of access scopes allowed to access the content |
| `fallback` | `React.ReactNode` | Optional content to render if the user doesn't have access |
| `userType` | `UserType` | The current user's type |
| `accessScope` | `AccessScope` | The current user's access scope |
| `requiredPermissions` | `string[]` | Optional array of permissions required to access the content |
| `userPermissions` | `string[]` | Optional array of permissions the user has |

### 2. ProtectedRoute

`ProtectedRoute` is a component that protects routes based on authentication and authorization rules.

#### Usage

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserType } from '@prisma/client';

// Basic usage
<ProtectedRoute
  isAuthenticated={true}
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
>
  <DashboardPage />
</ProtectedRoute>

// With specific allowed user types
<ProtectedRoute
  isAuthenticated={true}
  userType="CAMPUS_ADMIN"
  accessScope="SINGLE_CAMPUS"
  allowedUserTypes={['CAMPUS_ADMIN', 'SYSTEM_ADMIN']}
  unauthorizedRedirect="/unauthorized"
>
  <AdminPage />
</ProtectedRoute>

// With custom loading component
<ProtectedRoute
  isAuthenticated={true}
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
  showLoading={true}
  loadingComponent={<CustomLoadingSpinner />}
>
  <CoursePage />
</ProtectedRoute>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | The content to render if the user has access |
| `isAuthenticated` | `boolean` | Whether the user is authenticated |
| `allowedUserTypes` | `UserType[]` | Optional array of user types allowed to access the route |
| `allowedScopes` | `AccessScope[]` | Optional array of access scopes allowed to access the route |
| `requiredPermissions` | `string[]` | Optional array of permissions required to access the route |
| `userType` | `UserType` | The current user's type |
| `accessScope` | `AccessScope` | The current user's access scope |
| `userPermissions` | `string[]` | Optional array of permissions the user has |
| `loginRedirect` | `string` | Optional path to redirect to if the user is not authenticated (default: '/auth/login') |
| `unauthorizedRedirect` | `string` | Optional path to redirect to if the user is not authorized (default: '/unauthorized') |
| `showLoading` | `boolean` | Optional flag to show a loading indicator while checking authentication (default: true) |
| `loadingComponent` | `React.ReactNode` | Optional custom loading component |

### 3. PermissionIndicator

`PermissionIndicator` is a component that displays the user's role and access scope as a badge or tooltip.

#### Usage

```tsx
import { PermissionIndicator } from '@/components/auth/PermissionIndicator';
import { UserType } from '@prisma/client';

// Basic usage
<PermissionIndicator
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
/>

// As a tooltip
<PermissionIndicator
  userType="SYSTEM_ADMIN"
  accessScope="ALL_CAMPUSES"
  renderAs="tooltip"
/>

// With custom display options
<PermissionIndicator
  userType="CAMPUS_ADMIN"
  accessScope="MULTI_CAMPUS"
  showUserType={true}
  showAccessScope={true}
  renderAs="badge"
  className="custom-badge"
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `userType` | `UserType` | The user's type |
| `accessScope` | `AccessScope` | The user's access scope |
| `showUserType` | `boolean` | Whether to show the user type (default: true) |
| `showAccessScope` | `boolean` | Whether to show the access scope (default: true) |
| `renderAs` | `'badge' \| 'tooltip' \| 'text'` | How to render the indicator (default: 'badge') |
| `className` | `string` | Optional additional CSS class names |
| `badgeClassName` | `string` | Optional additional CSS class names for the badge |
| `tooltipClassName` | `string` | Optional additional CSS class names for the tooltip |
| `textClassName` | `string` | Optional additional CSS class names for the text |

### 4. RoleBasedNavigation

`RoleBasedNavigation` is a component that renders navigation items based on the user's role, access scope, and permissions.

#### Usage

```tsx
import { RoleBasedNavigation, NavigationItem } from '@/components/auth/RoleBasedNavigation';
import { UserType } from '@prisma/client';

// Define navigation items
const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Admin Settings',
    href: '/admin',
    icon: <SettingsIcon />,
    allowedUserTypes: ['SYSTEM_ADMIN', 'CAMPUS_ADMIN'],
  },
  {
    label: 'Courses',
    href: '/courses',
    icon: <CoursesIcon />,
    children: [
      {
        label: 'My Courses',
        href: '/courses/my-courses',
      },
      {
        label: 'Course Management',
        href: '/courses/management',
        allowedUserTypes: ['TEACHER', 'COORDINATOR'],
      },
    ],
    isExpanded: true,
  },
];

// Basic usage
<RoleBasedNavigation
  items={navigationItems}
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
/>

// As a horizontal navigation
<RoleBasedNavigation
  items={navigationItems}
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
  vertical={false}
/>

// With mobile support
<RoleBasedNavigation
  items={navigationItems}
  userType="TEACHER"
  accessScope="SINGLE_CAMPUS"
  mobile={true}
  collapsible={true}
  isCollapsed={isNavCollapsed}
  onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
  onToggleExpand={(item) => handleToggleExpand(item)}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `NavigationItem[]` | The navigation items to display |
| `userType` | `UserType` | The current user's type |
| `accessScope` | `AccessScope` | The current user's access scope |
| `userPermissions` | `string[]` | Optional array of permissions the user has |
| `vertical` | `boolean` | Whether to render as a vertical navigation (default: true) |
| `mobile` | `boolean` | Whether to render as a mobile navigation (default: false) |
| `collapsible` | `boolean` | Whether to collapse the navigation on mobile (default: true) |
| `isCollapsed` | `boolean` | Whether the navigation is collapsed |
| `onToggleCollapse` | `() => void` | Callback for toggling the collapsed state |
| `onToggleExpand` | `(item: NavigationItem) => void` | Callback for toggling the expanded state of an item |
| `className` | `string` | Optional additional CSS class names for the container |
| Various class name props | `string` | Optional additional CSS class names for different elements |

## Types

### UserType

The `UserType` enum is imported from `@prisma/client` and includes the following values:

- `SYSTEM_ADMIN`: System administrator with access to all campuses and features
- `CAMPUS_ADMIN`: Campus administrator with access to a specific campus or multiple campuses
- `COORDINATOR`: Course coordinator with access to specific courses
- `TEACHER`: Teacher with access to their assigned courses
- `CAMPUS_STUDENT`: Student with access to their enrolled courses

### AccessScope

The `AccessScope` type is defined in `AccessControl.tsx` and includes the following values:

- `SINGLE_CAMPUS`: Access to a single campus
- `MULTI_CAMPUS`: Access to multiple specific campuses
- `ALL_CAMPUSES`: Access to all campuses

## Best Practices

1. **Use AccessControl for UI Elements**: Use the `AccessControl` component to conditionally render UI elements based on the user's role and permissions.

2. **Protect Routes**: Use the `ProtectedRoute` component to protect routes that require authentication or specific roles.

3. **Provide Fallback Content**: Always provide fallback content for users who don't have access to specific features.

4. **Keep Navigation Consistent**: Use the `RoleBasedNavigation` component to ensure that users only see navigation items they have access to.

5. **Combine with Backend Authorization**: The RBAC system should be used in conjunction with backend authorization to ensure that users can't access restricted data or perform unauthorized actions.

6. **Test Different User Roles**: Test the application with different user roles to ensure that the RBAC system is working correctly.

## Examples

### Protecting a Page

```tsx
// pages/admin/settings.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSettingsPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      userType={user?.userType}
      accessScope={user?.accessScope}
      allowedUserTypes={['SYSTEM_ADMIN', 'CAMPUS_ADMIN']}
      loginRedirect="/auth/login?redirect=/admin/settings"
      unauthorizedRedirect="/dashboard"
    >
      <div>
        <h1>Admin Settings</h1>
        {/* Page content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Conditional UI Elements

```tsx
// components/CourseCard.tsx
import { AccessControl } from '@/components/auth/AccessControl';

export default function CourseCard({ course, userType, accessScope, userPermissions }) {
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      
      <AccessControl
        userType={userType}
        accessScope={accessScope}
        allowedUserTypes={['TEACHER', 'COORDINATOR']}
        userPermissions={userPermissions}
        requiredPermissions={['edit_course']}
      >
        <button className="edit-button">Edit Course</button>
      </AccessControl>
      
      <AccessControl
        userType={userType}
        accessScope={accessScope}
        allowedUserTypes={['SYSTEM_ADMIN', 'CAMPUS_ADMIN']}
        userPermissions={userPermissions}
        requiredPermissions={['delete_course']}
      >
        <button className="delete-button">Delete Course</button>
      </AccessControl>
    </div>
  );
}
```

### Role-Based Navigation

```tsx
// components/Layout.tsx
import { useState } from 'react';
import { RoleBasedNavigation, NavigationItem } from '@/components/auth/RoleBasedNavigation';
import { useAuth } from '@/hooks/useAuth';

export default function Layout({ children }) {
  const { user } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const navigationItems: NavigationItem[] = [
    // ... navigation items
  ];

  const handleToggleExpand = (item: NavigationItem) => {
    setExpandedItems(prev => ({
      ...prev,
      [item.href]: !prev[item.href]
    }));
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <RoleBasedNavigation
          items={navigationItems}
          userType={user?.userType}
          accessScope={user?.accessScope}
          userPermissions={user?.permissions}
          mobile={true}
          collapsible={true}
          isCollapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
          onToggleExpand={handleToggleExpand}
        />
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
}
```

## Conclusion

The Role-Based Access Control system provides a flexible and powerful way to control access to features, pages, and UI elements based on user roles, permissions, and access scopes. By using the components provided by the RBAC system, you can ensure that users only have access to the features and content they are authorized to use. 