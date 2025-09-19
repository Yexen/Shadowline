import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus, Invite, InviteType } from '@/types/auth';
import { nanoid } from 'nanoid';

// Database initialization
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('author', 'viewer', 'analyst', 'contributor')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
        avatar_url TEXT DEFAULT 'https://placehold.co/128x128.png',
        data_ai_hint TEXT DEFAULT 'user portrait',
        invite_token TEXT,
        invited_by TEXT,
        invited_at TIMESTAMP,
        approved_by TEXT,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create invites table
    await sql`
      CREATE TABLE IF NOT EXISTS invites (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        token TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('guest', 'role-specific')),
        target_role TEXT CHECK (target_role IN ('author', 'viewer', 'analyst', 'contributor')),
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        used_by TEXT,
        used_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invites_active ON invites(is_active);`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// User operations
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  inviteToken?: string
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = nanoid();

  let inviteData = null;
  if (inviteToken) {
    const invite = await getInviteByToken(inviteToken);
    if (invite && invite.isActive) {
      inviteData = invite;
      // Override role if invite specifies one
      if (invite.targetRole) {
        role = invite.targetRole;
      }
    }
  }

  const { rows } = await sql`
    INSERT INTO users (
      id, email, name, password_hash, role, status,
      invite_token, invited_by, invited_at
    )
    VALUES (
      ${userId}, ${email.toLowerCase()}, ${name}, ${passwordHash}, ${role}, 'pending',
      ${inviteToken || null}, ${inviteData?.createdBy || null}, ${inviteData ? new Date().toISOString() : null}
    )
    RETURNING *;
  `;

  // Mark invite as used
  if (inviteToken && inviteData) {
    await useInvite(inviteToken, userId);
  }

  return mapRowToUser(rows[0]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase()};
  `;

  return rows.length > 0 ? mapRowToUser(rows[0]) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE id = ${id};
  `;

  return rows.length > 0 ? mapRowToUser(rows[0]) : null;
}

export async function getAllUsers(): Promise<User[]> {
  const { rows } = await sql`
    SELECT * FROM users ORDER BY created_at DESC;
  `;

  return rows.map(mapRowToUser);
}

export async function updateUserStatus(userId: string, status: UserStatus, approvedBy?: string): Promise<void> {
  await sql`
    UPDATE users
    SET status = ${status},
        approved_by = ${approvedBy || null},
        approved_at = ${status === 'approved' ? new Date().toISOString() : null},
        updated_at = NOW()
    WHERE id = ${userId};
  `;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await sql`
    UPDATE users
    SET role = ${role}, updated_at = NOW()
    WHERE id = ${userId};
  `;
}

export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  await sql`
    UPDATE users
    SET avatar_url = ${avatarUrl}, updated_at = NOW()
    WHERE id = ${userId};
  `;
}

export async function deleteUser(userId: string): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${userId};`;
}

// Invite operations
export async function createInvite(
  type: InviteType,
  createdBy: string,
  targetRole?: UserRole,
  expiresIn?: number,
  maxUses?: number
): Promise<string> {
  const token = nanoid(32);
  const inviteId = nanoid();
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
    : null;

  await sql`
    INSERT INTO invites (
      id, token, type, target_role, created_by, expires_at, max_uses
    )
    VALUES (
      ${inviteId}, ${token}, ${type}, ${targetRole || null}, ${createdBy}, ${expiresAt}, ${maxUses || null}
    );
  `;

  return token;
}

export async function getInviteByToken(token: string): Promise<Invite | null> {
  const { rows } = await sql`
    SELECT * FROM invites WHERE token = ${token};
  `;

  return rows.length > 0 ? mapRowToInvite(rows[0]) : null;
}

export async function getAllInvites(): Promise<Invite[]> {
  const { rows } = await sql`
    SELECT * FROM invites ORDER BY created_at DESC;
  `;

  return rows.map(mapRowToInvite);
}

export async function useInvite(token: string, usedBy: string): Promise<boolean> {
  const invite = await getInviteByToken(token);
  if (!invite || !invite.isActive) return false;

  if (invite.expiresAt && invite.expiresAt < new Date()) return false;
  if (invite.maxUses && invite.currentUses >= invite.maxUses) return false;

  const newUseCount = invite.currentUses + 1;
  const shouldDeactivate = invite.maxUses && newUseCount >= invite.maxUses;

  await sql`
    UPDATE invites
    SET current_uses = ${newUseCount},
        used_by = ${usedBy},
        used_at = NOW(),
        is_active = ${!shouldDeactivate}
    WHERE token = ${token};
  `;

  return true;
}

export async function deactivateInvite(inviteId: string): Promise<void> {
  await sql`
    UPDATE invites
    SET is_active = FALSE
    WHERE id = ${inviteId};
  `;
}

export async function deleteInvite(inviteId: string): Promise<void> {
  await sql`DELETE FROM invites WHERE id = ${inviteId};`;
}

// Helper functions to map database rows to our types
function mapRowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url,
    dataAiHint: row.data_ai_hint,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    inviteToken: row.invite_token,
    invitedBy: row.invited_by,
    invitedAt: row.invited_at ? new Date(row.invited_at) : undefined,
    approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
    approvedBy: row.approved_by,
  };
}

function mapRowToInvite(row: any): Invite {
  return {
    id: row.id,
    token: row.token,
    type: row.type as InviteType,
    targetRole: row.target_role as UserRole,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    usedBy: row.used_by,
    usedAt: row.used_at ? new Date(row.used_at) : null,
    isActive: row.is_active,
    maxUses: row.max_uses,
    currentUses: row.current_uses,
  };
}