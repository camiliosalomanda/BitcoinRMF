import { supabaseAdmin } from '@/lib/supabase';
import { getWeekStart } from '@/lib/streaks';
import type { Guild, GuildMember, GuildWithRole, GuildMemberEntry, GuildRole, LeaderboardEntry } from '@/types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Guild CRUD ---

export async function createGuild(params: {
  name: string;
  description?: string;
  created_by: string;
}): Promise<Guild | null> {
  if (!supabaseAdmin) return null;

  const slug = slugify(params.name);
  if (!slug) throw new Error('Invalid guild name');

  // Create guild
  const { data: guild, error } = await supabaseAdmin
    .from('guilds')
    .insert({
      name: params.name,
      slug,
      description: params.description || null,
      created_by: params.created_by,
    })
    .select()
    .single();

  if (error) throw error;

  // Add creator as admin member
  const { error: memberError } = await supabaseAdmin
    .from('guild_members')
    .insert({
      guild_id: guild.id,
      user_id: params.created_by,
      role: 'admin',
    });

  if (memberError) {
    // Rollback guild creation
    await supabaseAdmin.from('guilds').delete().eq('id', guild.id);
    throw memberError;
  }

  return guild as Guild;
}

export async function getGuildBySlug(slug: string): Promise<Guild | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('guilds')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data as Guild;
}

export async function searchGuilds(search?: string, limit = 50): Promise<Guild[]> {
  if (!supabaseAdmin) return [];
  let query = supabaseAdmin
    .from('guilds')
    .select('*')
    .order('member_count', { ascending: false })
    .limit(limit);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Guild[];
}

export async function updateGuild(
  guildId: string,
  updates: { name?: string; description?: string }
): Promise<Guild | null> {
  if (!supabaseAdmin) return null;

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name;
    updateData.slug = slugify(updates.name);
  }
  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }

  const { data, error } = await supabaseAdmin
    .from('guilds')
    .update(updateData)
    .eq('id', guildId)
    .select()
    .single();

  if (error) throw error;
  return data as Guild;
}

// --- Membership ---

export async function getUserGuild(userId: string): Promise<GuildWithRole | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('guild_members')
    .select('role, guild:guilds(*)')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  const guild = data.guild as unknown as Guild;
  return { ...guild, role: data.role as GuildRole };
}

export async function joinGuild(guildId: string, userId: string): Promise<GuildMember | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('guild_members')
    .insert({ guild_id: guildId, user_id: userId, role: 'member' })
    .select()
    .single();

  if (error) throw error;

  // Increment member count
  const guild = await getGuildById(guildId);
  if (guild) {
    await supabaseAdmin
      .from('guilds')
      .update({ member_count: guild.member_count + 1 })
      .eq('id', guildId);
  }

  return data as GuildMember;
}

export async function leaveGuild(guildId: string, userId: string): Promise<void> {
  if (!supabaseAdmin) return;

  // Check if user is admin
  const member = await getGuildMember(guildId, userId);
  if (!member) return;

  if (member.role === 'admin') {
    // Check if there are other members
    const { count } = await supabaseAdmin
      .from('guild_members')
      .select('*', { count: 'exact', head: true })
      .eq('guild_id', guildId);

    if (count && count > 1) {
      throw new Error('Admin must transfer ownership before leaving');
    }

    // Last member — delete the guild entirely
    await supabaseAdmin.from('guilds').delete().eq('id', guildId);
    return;
  }

  const { error } = await supabaseAdmin
    .from('guild_members')
    .delete()
    .eq('guild_id', guildId)
    .eq('user_id', userId);

  if (error) throw error;

  // Decrement member count
  const guild = await getGuildById(guildId);
  if (guild) {
    await supabaseAdmin
      .from('guilds')
      .update({ member_count: Math.max(0, guild.member_count - 1) })
      .eq('id', guildId);
  }
}

export async function getGuildMembers(guildId: string): Promise<GuildMemberEntry[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from('guild_members')
    .select('user_id, role, joined_at, user:users(username, display_name, avatar_url, level)')
    .eq('guild_id', guildId)
    .order('joined_at', { ascending: true });

  if (error || !data) return [];

  return data.map((m) => {
    const user = m.user as unknown as {
      username: string;
      display_name: string;
      avatar_url: string | null;
      level: number;
    };
    return {
      user_id: m.user_id,
      username: user?.username ?? 'Unknown',
      display_name: user?.display_name ?? 'Unknown',
      avatar_url: user?.avatar_url ?? null,
      level: user?.level ?? 1,
      role: m.role as GuildRole,
      joined_at: m.joined_at,
    };
  });
}

export async function getGuildMember(guildId: string, userId: string): Promise<GuildMember | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('guild_members')
    .select('*')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data as GuildMember;
}

export async function updateMemberRole(
  guildId: string,
  userId: string,
  role: GuildRole
): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from('guild_members')
    .update({ role })
    .eq('guild_id', guildId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function transferAdmin(
  guildId: string,
  fromUserId: string,
  toUserId: string
): Promise<void> {
  if (!supabaseAdmin) return;

  // Demote current admin to member
  await supabaseAdmin
    .from('guild_members')
    .update({ role: 'member' })
    .eq('guild_id', guildId)
    .eq('user_id', fromUserId);

  // Promote new admin
  await supabaseAdmin
    .from('guild_members')
    .update({ role: 'admin' })
    .eq('guild_id', guildId)
    .eq('user_id', toUserId);

  // Update guild created_by
  await supabaseAdmin
    .from('guilds')
    .update({ created_by: toUserId })
    .eq('id', guildId);
}

export async function removeMember(guildId: string, userId: string): Promise<void> {
  if (!supabaseAdmin) return;
  const { error } = await supabaseAdmin
    .from('guild_members')
    .delete()
    .eq('guild_id', guildId)
    .eq('user_id', userId);
  if (error) throw error;

  // Decrement member count
  const guild = await getGuildById(guildId);
  if (guild) {
    await supabaseAdmin
      .from('guilds')
      .update({ member_count: Math.max(0, guild.member_count - 1) })
      .eq('id', guildId);
  }
}

// --- Helper ---

async function getGuildById(guildId: string): Promise<Guild | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('guilds')
    .select('*')
    .eq('id', guildId)
    .single();
  if (error || !data) return null;
  return data as Guild;
}

// --- Guild Leaderboards ---

async function getGuildMemberIds(guildId: string): Promise<string[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from('guild_members')
    .select('user_id')
    .eq('guild_id', guildId);
  if (error || !data) return [];
  return data.map((m) => m.user_id);
}

export async function getGuildLeaderboardTotalXP(guildId: string): Promise<LeaderboardEntry[]> {
  if (!supabaseAdmin) return [];
  const memberIds = await getGuildMemberIds(guildId);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, display_name, avatar_url, level, total_xp')
    .in('id', memberIds)
    .order('total_xp', { ascending: false });

  if (error || !data) return [];
  return data.map((u, i) => ({
    rank: i + 1,
    user_id: u.id,
    username: u.username,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
    level: u.level,
    value: u.total_xp,
  }));
}

export async function getGuildLeaderboardWeeklyXP(guildId: string): Promise<LeaderboardEntry[]> {
  if (!supabaseAdmin) return [];
  const memberIds = await getGuildMemberIds(guildId);
  if (memberIds.length === 0) return [];

  const weekStart = getWeekStart();
  const { data, error } = await supabaseAdmin
    .from('weekly_xp')
    .select('user_id, xp_earned, user:users(username, display_name, avatar_url, level)')
    .in('user_id', memberIds)
    .eq('week_start', weekStart)
    .order('xp_earned', { ascending: false });

  if (error || !data) return [];
  return data.map((entry, i) => {
    const user = entry.user as unknown as {
      username: string;
      display_name: string;
      avatar_url: string | null;
      level: number;
    };
    return {
      rank: i + 1,
      user_id: entry.user_id,
      username: user?.username ?? 'Unknown',
      display_name: user?.display_name ?? 'Unknown',
      avatar_url: user?.avatar_url ?? null,
      level: user?.level ?? 1,
      value: entry.xp_earned,
    };
  });
}

export async function getGuildLeaderboardStreaks(guildId: string): Promise<LeaderboardEntry[]> {
  if (!supabaseAdmin) return [];
  const memberIds = await getGuildMemberIds(guildId);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, display_name, avatar_url, level, streak_count')
    .in('id', memberIds)
    .gt('streak_count', 0)
    .order('streak_count', { ascending: false });

  if (error || !data) return [];
  return data.map((u, i) => ({
    rank: i + 1,
    user_id: u.id,
    username: u.username,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
    level: u.level,
    value: u.streak_count,
  }));
}
