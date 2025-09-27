import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus, Invite, InviteType } from '@/types/auth';
import { nanoid } from 'nanoid';

// Application data types
export interface BibleEntry {
  id: string;
  category: string;
  title: string;
  fixedFields?: Record<string, any>;
  fields: Array<{ label: string; value: string }>;
  relationships?: Array<{ characterName: string; relationshipType: string; description?: string }>;
  pages?: Array<{ id: string; title: string; content: string }>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Volume {
  id: string;
  title: string;
  description: string;
  chapters: Array<{ id: string; title: string; content: string; order: number }>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

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

    // Create bible_entries table
    await sql`
      CREATE TABLE IF NOT EXISTS bible_entries (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        fixed_fields JSONB DEFAULT '{}',
        fields JSONB DEFAULT '[]',
        relationships JSONB DEFAULT '[]',
        pages JSONB DEFAULT '[]',
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create volumes table
    await sql`
      CREATE TABLE IF NOT EXISTS volumes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        chapters JSONB DEFAULT '[]',
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create drafts table
    await sql`
      CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create notes table
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_invites_active ON invites(is_active);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bible_entries_user_id ON bible_entries(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bible_entries_category ON bible_entries(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_volumes_user_id ON volumes(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`;

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
  // In development mode without proper DB connection, return null
  if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL?.startsWith('postgresql://')) {
    return null;
  }

  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()};
    `;

    return rows.length > 0 ? mapRowToUser(rows[0]) : null;
  } catch (error) {
    console.warn('Database query failed, returning null:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await sql`
    SELECT * FROM users WHERE id = ${id};
  `;

  return rows.length > 0 ? mapRowToUser(rows[0]) : null;
}

export async function getAllUsers(): Promise<User[]> {
  // In development mode without proper DB connection, return empty array
  if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL?.startsWith('postgresql://')) {
    return [];
  }

  try {
    const { rows } = await sql`
      SELECT * FROM users ORDER BY created_at DESC;
    `;

    return rows.map(mapRowToUser);
  } catch (error) {
    console.warn('Database query failed, returning empty array:', error);
    return [];
  }
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

// Bible Entries operations
export async function createBibleEntry(
  category: string,
  title: string,
  fixedFields: Record<string, any> = {},
  fields: Array<{ label: string; value: string }> = [],
  relationships: Array<{ characterName: string; relationshipType: string; description?: string }> = [],
  pages: Array<{ id: string; title: string; content: string }> = [],
  userId: string
): Promise<BibleEntry> {
  const entryId = nanoid();

  const { rows } = await sql`
    INSERT INTO bible_entries (
      id, category, title, fixed_fields, fields, relationships, pages, user_id
    )
    VALUES (
      ${entryId}, ${category}, ${title}, ${JSON.stringify(fixedFields)},
      ${JSON.stringify(fields)}, ${JSON.stringify(relationships)},
      ${JSON.stringify(pages)}, ${userId}
    )
    RETURNING *;
  `;

  return mapRowToBibleEntry(rows[0]);
}

export async function getBibleEntriesByUser(userId: string): Promise<BibleEntry[]> {
  const { rows } = await sql`
    SELECT * FROM bible_entries
    WHERE user_id = ${userId}
    ORDER BY category, title;
  `;

  return rows.map(mapRowToBibleEntry);
}

export async function updateBibleEntry(
  id: string,
  updates: Partial<Pick<BibleEntry, 'title' | 'fixedFields' | 'fields' | 'relationships' | 'pages'>>
): Promise<BibleEntry> {
  const setClause = [];
  const values = [];

  if (updates.title !== undefined) {
    setClause.push(`title = $${setClause.length + 1}`);
    values.push(updates.title);
  }
  if (updates.fixedFields !== undefined) {
    setClause.push(`fixed_fields = $${setClause.length + 1}`);
    values.push(JSON.stringify(updates.fixedFields));
  }
  if (updates.fields !== undefined) {
    setClause.push(`fields = $${setClause.length + 1}`);
    values.push(JSON.stringify(updates.fields));
  }
  if (updates.relationships !== undefined) {
    setClause.push(`relationships = $${setClause.length + 1}`);
    values.push(JSON.stringify(updates.relationships));
  }
  if (updates.pages !== undefined) {
    setClause.push(`pages = $${setClause.length + 1}`);
    values.push(JSON.stringify(updates.pages));
  }

  setClause.push(`updated_at = NOW()`);

  const { rows } = await sql.query(
    `UPDATE bible_entries SET ${setClause.join(', ')} WHERE id = $${setClause.length} RETURNING *`,
    [...values, id]
  );

  return mapRowToBibleEntry(rows[0]);
}

export async function deleteBibleEntry(id: string): Promise<void> {
  await sql`DELETE FROM bible_entries WHERE id = ${id};`;
}

// Volumes operations
export async function createVolume(
  title: string,
  description: string = '',
  chapters: Array<{ id: string; title: string; content: string; order: number }> = [],
  userId: string
): Promise<Volume> {
  const volumeId = nanoid();

  const { rows } = await sql`
    INSERT INTO volumes (id, title, description, chapters, user_id)
    VALUES (${volumeId}, ${title}, ${description}, ${JSON.stringify(chapters)}, ${userId})
    RETURNING *;
  `;

  return mapRowToVolume(rows[0]);
}

export async function getVolumesByUser(userId: string): Promise<Volume[]> {
  const { rows } = await sql`
    SELECT * FROM volumes
    WHERE user_id = ${userId}
    ORDER BY title;
  `;

  return rows.map(mapRowToVolume);
}

export async function updateVolume(
  id: string,
  updates: Partial<Pick<Volume, 'title' | 'description' | 'chapters'>>
): Promise<Volume> {
  const setClause = [];
  const values = [];

  if (updates.title !== undefined) {
    setClause.push(`title = $${setClause.length + 1}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    setClause.push(`description = $${setClause.length + 1}`);
    values.push(updates.description);
  }
  if (updates.chapters !== undefined) {
    setClause.push(`chapters = $${setClause.length + 1}`);
    values.push(JSON.stringify(updates.chapters));
  }

  setClause.push(`updated_at = NOW()`);

  const { rows } = await sql.query(
    `UPDATE volumes SET ${setClause.join(', ')} WHERE id = $${setClause.length} RETURNING *`,
    [...values, id]
  );

  return mapRowToVolume(rows[0]);
}

export async function deleteVolume(id: string): Promise<void> {
  await sql`DELETE FROM volumes WHERE id = ${id};`;
}

// Drafts operations
export async function createDraft(title: string, content: string = '', userId: string): Promise<Draft> {
  const draftId = nanoid();

  const { rows } = await sql`
    INSERT INTO drafts (id, title, content, user_id)
    VALUES (${draftId}, ${title}, ${content}, ${userId})
    RETURNING *;
  `;

  return mapRowToDraft(rows[0]);
}

export async function getDraftsByUser(userId: string): Promise<Draft[]> {
  const { rows } = await sql`
    SELECT * FROM drafts
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC;
  `;

  return rows.map(mapRowToDraft);
}

export async function updateDraft(
  id: string,
  updates: Partial<Pick<Draft, 'title' | 'content'>>
): Promise<Draft> {
  const setClause = [];
  const values = [];

  if (updates.title !== undefined) {
    setClause.push(`title = $${setClause.length + 1}`);
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    setClause.push(`content = $${setClause.length + 1}`);
    values.push(updates.content);
  }

  setClause.push(`updated_at = NOW()`);

  const { rows } = await sql.query(
    `UPDATE drafts SET ${setClause.join(', ')} WHERE id = $${setClause.length} RETURNING *`,
    [...values, id]
  );

  return mapRowToDraft(rows[0]);
}

export async function deleteDraft(id: string): Promise<void> {
  await sql`DELETE FROM drafts WHERE id = ${id};`;
}

// Notes operations
export async function createNote(title: string, content: string = '', userId: string): Promise<Note> {
  const noteId = nanoid();

  const { rows } = await sql`
    INSERT INTO notes (id, title, content, user_id)
    VALUES (${noteId}, ${title}, ${content}, ${userId})
    RETURNING *;
  `;

  return mapRowToNote(rows[0]);
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const { rows } = await sql`
    SELECT * FROM notes
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC;
  `;

  return rows.map(mapRowToNote);
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, 'title' | 'content'>>
): Promise<Note> {
  const setClause = [];
  const values = [];

  if (updates.title !== undefined) {
    setClause.push(`title = $${setClause.length + 1}`);
    values.push(updates.title);
  }
  if (updates.content !== undefined) {
    setClause.push(`content = $${setClause.length + 1}`);
    values.push(updates.content);
  }

  setClause.push(`updated_at = NOW()`);

  const { rows } = await sql.query(
    `UPDATE notes SET ${setClause.join(', ')} WHERE id = $${setClause.length} RETURNING *`,
    [...values, id]
  );

  return mapRowToNote(rows[0]);
}

export async function deleteNote(id: string): Promise<void> {
  await sql`DELETE FROM notes WHERE id = ${id};`;
}

// Helper functions to map database rows to our types
function mapRowToBibleEntry(row: any): BibleEntry {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    fixedFields: row.fixed_fields || {},
    fields: row.fields || [],
    relationships: row.relationships || [],
    pages: row.pages || [],
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapRowToVolume(row: any): Volume {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    chapters: row.chapters || [],
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapRowToDraft(row: any): Draft {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapRowToNote(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}