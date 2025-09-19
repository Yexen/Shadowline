export type UserRole = 'author' | 'viewer' | 'analyst' | 'contributor';
export type UserStatus = 'approved' | 'pending' | 'rejected';
export type InviteType = 'guest' | 'role-specific';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  dataAiHint: string;
  role: UserRole;
  status: UserStatus;
  inviteToken?: string;
  invitedBy?: string;
  invitedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface Invite {
  id: string;
  token: string;
  type: InviteType;
  targetRole?: UserRole;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  usedBy?: string;
  usedAt?: Date;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const PERMISSIONS = {
  // Content permissions
  CONTENT_READ: { id: 'content:read', name: 'Read Content', description: 'View published content', resource: 'content', action: 'read' },
  CONTENT_CREATE: { id: 'content:create', name: 'Create Content', description: 'Create new content', resource: 'content', action: 'create' },
  CONTENT_EDIT: { id: 'content:edit', name: 'Edit Content', description: 'Edit existing content', resource: 'content', action: 'edit' },
  CONTENT_DELETE: { id: 'content:delete', name: 'Delete Content', description: 'Delete content', resource: 'content', action: 'delete' },
  CONTENT_PUBLISH: { id: 'content:publish', name: 'Publish Content', description: 'Publish content', resource: 'content', action: 'publish' },

  // Comment permissions
  COMMENT_READ: { id: 'comment:read', name: 'Read Comments', description: 'View comments', resource: 'comment', action: 'read' },
  COMMENT_CREATE: { id: 'comment:create', name: 'Create Comments', description: 'Add comments', resource: 'comment', action: 'create' },
  COMMENT_EDIT: { id: 'comment:edit', name: 'Edit Comments', description: 'Edit own comments', resource: 'comment', action: 'edit' },
  COMMENT_MODERATE: { id: 'comment:moderate', name: 'Moderate Comments', description: 'Moderate all comments', resource: 'comment', action: 'moderate' },

  // Annotation permissions
  ANNOTATION_READ: { id: 'annotation:read', name: 'Read Annotations', description: 'View annotations', resource: 'annotation', action: 'read' },
  ANNOTATION_CREATE: { id: 'annotation:create', name: 'Create Annotations', description: 'Add annotations', resource: 'annotation', action: 'create' },
  ANNOTATION_EDIT: { id: 'annotation:edit', name: 'Edit Annotations', description: 'Edit own annotations', resource: 'annotation', action: 'edit' },
  ANNOTATION_MODERATE: { id: 'annotation:moderate', name: 'Moderate Annotations', description: 'Moderate all annotations', resource: 'annotation', action: 'moderate' },

  // User management permissions
  USER_READ: { id: 'user:read', name: 'Read Users', description: 'View user profiles', resource: 'user', action: 'read' },
  USER_INVITE: { id: 'user:invite', name: 'Invite Users', description: 'Create invite links', resource: 'user', action: 'invite' },
  USER_MANAGE: { id: 'user:manage', name: 'Manage Users', description: 'Manage user roles and status', resource: 'user', action: 'manage' },

  // Proposal permissions
  PROPOSAL_READ: { id: 'proposal:read', name: 'Read Proposals', description: 'View content proposals', resource: 'proposal', action: 'read' },
  PROPOSAL_CREATE: { id: 'proposal:create', name: 'Create Proposals', description: 'Submit content proposals', resource: 'proposal', action: 'create' },
  PROPOSAL_REVIEW: { id: 'proposal:review', name: 'Review Proposals', description: 'Review and approve proposals', resource: 'proposal', action: 'review' },
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  author: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.COMMENT_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_EDIT,
    PERMISSIONS.COMMENT_MODERATE,
    PERMISSIONS.ANNOTATION_READ,
    PERMISSIONS.ANNOTATION_CREATE,
    PERMISSIONS.ANNOTATION_EDIT,
    PERMISSIONS.ANNOTATION_MODERATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_INVITE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.PROPOSAL_READ,
    PERMISSIONS.PROPOSAL_REVIEW,
  ],
  viewer: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.COMMENT_READ,
    PERMISSIONS.ANNOTATION_READ,
  ],
  analyst: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.COMMENT_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_EDIT,
    PERMISSIONS.ANNOTATION_READ,
    PERMISSIONS.ANNOTATION_CREATE,
    PERMISSIONS.ANNOTATION_EDIT,
  ],
  contributor: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.COMMENT_READ,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_EDIT,
    PERMISSIONS.ANNOTATION_READ,
    PERMISSIONS.PROPOSAL_READ,
    PERMISSIONS.PROPOSAL_CREATE,
  ],
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].some(p => p.id === permission.id);
}

export function canPerform(userRole: UserRole, resource: string, action: string): boolean {
  return ROLE_PERMISSIONS[userRole].some(p => p.resource === resource && p.action === action);
}