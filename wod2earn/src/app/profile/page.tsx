'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Zap, Flame, Dumbbell, Trophy, Award, Calendar, Pencil, Ruler, Weight, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { getLevelInfo } from '@/lib/xp';
import type { UserProfile, UserAchievement, Workout, Gender, FitnessGoal } from '@/types';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatGender(g: Gender): string {
  const map: Record<Gender, string> = {
    male: 'Male',
    female: 'Female',
    non_binary: 'Non-binary',
    prefer_not_to_say: 'Prefer not to say',
  };
  return map[g];
}

function formatGoal(g: FitnessGoal): string {
  const map: Record<FitnessGoal, string> = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    maintain: 'Maintain',
    endurance: 'Endurance',
  };
  return map[g];
}

function formatBodyType(bt: string): string {
  return bt.charAt(0).toUpperCase() + bt.slice(1);
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  useEffect(() => {
    async function fetch_data() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAchievements(data.achievements ?? []);
          setWorkouts(data.recentWorkouts ?? []);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch_data();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <Sidebar />
        <main className="pt-16 lg:pl-60 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const levelInfo = getLevelInfo(user.level, user.current_xp, user.total_xp);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-60">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card glow="blue">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar username={user.username} avatarUrl={user.avatar_url} level={user.level} size="lg" />
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading text-2xl font-bold">{user.display_name}</h1>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-dark-surface text-text-muted hover:text-neon-blue transition-colors"
                    title="Edit Profile"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                <p className="text-text-secondary text-sm">@{user.username}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <span className="text-neon-blue font-semibold text-sm">
                    <Zap size={14} className="inline mr-1" />
                    Level {levelInfo.level} - {levelInfo.title}
                  </span>
                </div>
                <div className="mt-3 max-w-sm">
                  <ProgressBar value={levelInfo.progressPercent} color="blue" size="md" />
                  <p className="text-xs text-text-muted mt-1">
                    {levelInfo.currentXP} / {levelInfo.xpForNextLevel} XP to next level
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total XP', value: user.total_xp.toLocaleString(), icon: Zap, color: 'text-gold' },
              { label: 'Workouts', value: user.workouts_completed.toString(), icon: Dumbbell, color: 'text-neon-green' },
              { label: 'Current Streak', value: `${user.streak_count} days`, icon: Flame, color: 'text-neon-pink' },
              { label: 'Best Streak', value: `${user.longest_streak} days`, icon: Trophy, color: 'text-neon-purple' },
            ].map((stat) => (
              <Card key={stat.label} hover={false}>
                <stat.icon className={`${stat.color} mb-2`} size={20} />
                <p className={`font-heading font-bold text-lg ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Profile Details */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="text-neon-blue" size={20} />
                <h2 className="font-heading font-bold text-lg">Profile Details</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil size={14} className="mr-1" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-dark-surface border border-card-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Ruler size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Height</p>
                </div>
                <p className="text-sm font-medium">{user.height_cm ? `${user.height_cm} cm` : '---'}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface border border-card-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Weight size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Weight</p>
                </div>
                <p className="text-sm font-medium">{user.weight_kg ? `${user.weight_kg} kg` : '---'}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface border border-card-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Body Type</p>
                </div>
                <p className="text-sm font-medium">{user.body_type ? formatBodyType(user.body_type) : '---'}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface border border-card-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Age</p>
                </div>
                <p className="text-sm font-medium">{user.date_of_birth ? `${calculateAge(user.date_of_birth)} years` : '---'}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface border border-card-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Gender</p>
                </div>
                <p className="text-sm font-medium">{user.gender ? formatGender(user.gender) : '---'}</p>
              </div>
              <div className="p-3 rounded-lg bg-dark-surface border border-card-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted">Fitness Goal</p>
                </div>
                <p className="text-sm font-medium">{user.fitness_goal ? formatGoal(user.fitness_goal) : '---'}</p>
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-gold" size={20} />
              <h2 className="font-heading font-bold text-lg">Achievements</h2>
              <span className="text-xs text-text-muted ml-auto">{achievements.length} unlocked</span>
            </div>
            {achievements.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">
                No achievements yet. Keep grinding!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {achievements.map((ua) => {
                  const ach = ua.achievement;
                  if (!ach) return null;
                  return (
                    <div key={ua.id} className="flex flex-col items-center p-3 rounded-lg bg-dark-surface border border-card-border text-center">
                      <span className="text-2xl mb-1">{ach.icon}</span>
                      <p className="text-xs font-medium text-text-primary mb-1">{ach.name}</p>
                      <Badge variant="rarity" rarity={ach.rarity}>{ach.rarity}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Workout History */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-neon-green" size={20} />
              <h2 className="font-heading font-bold text-lg">Recent Activity</h2>
            </div>
            {workouts.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No workout history yet.</p>
            ) : (
              <div className="space-y-2">
                {workouts.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-surface border border-card-border">
                    <div>
                      <p className="text-sm font-medium">{w.title}</p>
                      <p className="text-xs text-text-muted">{new Date(w.completed_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-gold">+{w.xp_earned} XP</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Member since */}
          <div className="text-center text-xs text-text-muted pb-8">
            <User size={12} className="inline mr-1" />
            Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editOpen && (
        <ProfileEditModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
          onSave={(updated) => setUser(updated)}
        />
      )}
    </div>
  );
}
