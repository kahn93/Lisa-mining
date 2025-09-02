"use client";
// SSR-safe localStorage helpers
/* global localStorage */
// SSR-safe localStorage helpers
function safeGetItem(key: string, fallback: string = '0') {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  }
  return fallback;
}

function safeSetItem(key: string, value: string) {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}
import * as React from 'react';


import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'mining' | 'adventure' | 'social' | 'premium' | 'special';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    target: number;
    current?: number;
  };
  rewards: {
    coins: number;
    experience: number;
    items?: string[];
    title?: string;
  };
  completed: boolean;
  completedDate?: Date;
  hidden?: boolean;
}

interface GameStats {
  coins: number;
  // Add other relevant fields as needed, for example:
  // questsCompleted?: number;
  // enemiesDefeated?: number;
  // premiumPurchases?: number;
  // daysPlayed?: number;
  // maxCombo?: number;
  // totalSpent?: number;
}

interface AchievementsProps {
  gameStats: GameStats;
}

export function Achievements({ gameStats }: AchievementsProps) {
  // Hydration guard to prevent SSR/client mismatch
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Hydration-safe helpers
  const safeNow = () => (typeof window !== 'undefined' ? Date.now() : 0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  // Removed unused playerStats state
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const { toast } = useToast();

  const achievementsList: Achievement[] = React.useMemo(() => [
    // Mining Achievements
    {
      id: 'first_mine',
      title: 'First Steps',
      description: 'Mine your first LISA token',
      category: 'mining',
      icon: '⛏️',
      rarity: 'common',
      requirements: { type: 'mine_count', target: 1 },
      rewards: { coins: 100, experience: 50 },
      completed: false,
    },
    {
      id: 'mining_novice',
      title: 'Mining Novice',
      description: 'Mine 100 LISA tokens',
      category: 'mining',
      icon: '💎',
      rarity: 'common',
      requirements: { type: 'total_mined', target: 100 },
      rewards: { coins: 500, experience: 100 },
      completed: false,
    },
    {
      id: 'mining_expert',
      title: 'Mining Expert',
      description: 'Mine 10,000 LISA tokens',
      category: 'mining',
      icon: '💰',
      rarity: 'rare',
      requirements: { type: 'total_mined', target: 10000 },
      rewards: { coins: 5000, experience: 1000, items: ['Golden Pickaxe'] },
      completed: false,
    },
    {
      id: 'combo_master',
      title: 'Combo Master',
      description: 'Achieve a 50x mining combo',
      category: 'mining',
      icon: '🔥',
      rarity: 'epic',
      requirements: { type: 'max_combo', target: 50 },
      rewards: { coins: 10000, experience: 2000, title: 'Combo Master' },
      completed: false,
    },

    // Adventure Achievements
    {
      id: 'first_quest',
      title: "Guardian's Calling",
      description: 'Complete your first sacred quest',
      category: 'adventure',
      icon: '🗡️',
      rarity: 'common',
      requirements: { type: 'quests_completed', target: 1 },
      rewards: { coins: 200, experience: 100 },
      completed: false,
    },
    {
      id: 'demon_slayer',
      title: 'Demon Slayer',
      description: 'Defeat 10 demons in battle',
      category: 'adventure',
      icon: '👹',
      rarity: 'rare',
      requirements: { type: 'enemies_defeated', target: 10 },
      rewards: { coins: 1000, experience: 500, items: ['Demon Bane Sword'] },
      completed: false,
    },
    {
      id: 'devil_conqueror',
      title: 'Devil Conqueror',
      description: 'Defeat the Devil himself',
      category: 'adventure',
      icon: '😈',
      rarity: 'legendary',
      requirements: { type: 'boss_defeated', target: 1 },
      rewards: {
        coins: 50000,
        experience: 10000,
        title: 'Devil Conqueror',
        items: ['Crown of Light'],
      },
      completed: false,
      hidden: true,
    },

    // Social Achievements
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Invite 5 friends to play',
      category: 'social',
      icon: '👥',
      rarity: 'rare',
      requirements: { type: 'friends_invited', target: 5 },
      rewards: { coins: 2000, experience: 500 },
      completed: false,
    },
    {
      id: 'top_player',
      title: 'Top Guardian',
      description: 'Reach top 10 on the leaderboard',
      category: 'social',
      icon: '🏆',
      rarity: 'epic',
      requirements: { type: 'leaderboard_rank', target: 10 },
      rewards: { coins: 5000, experience: 1000, title: 'Top Guardian' },
      completed: false,
    },

    // Premium Achievements
    {
      id: 'first_purchase',
      title: 'Supporter',
      description: 'Make your first TON purchase',
      category: 'premium',
      icon: '💳',
      rarity: 'rare',
      requirements: { type: 'premium_purchases', target: 1 },
      rewards: { coins: 1000, experience: 200, title: 'Supporter' },
      completed: false,
    },
    {
      id: 'whale',
      title: 'Divine Whale',
      description: 'Spend 10 TON on premium items',
      category: 'premium',
      icon: '🐋',
      rarity: 'legendary',
      requirements: { type: 'total_spent', target: 10 },
      rewards: {
        coins: 25000,
        experience: 5000,
        title: 'Divine Whale',
        items: ['Whale Badge NFT'],
      },
      completed: false,
    },

    // Special Achievements
    {
      id: 'early_adopter',
      title: 'Early Adopter',
      description: 'Play during the first week of launch',
      category: 'special',
      icon: '🌟',
      rarity: 'epic',
      requirements: { type: 'early_player', target: 1 },
      rewards: {
        coins: 5000,
        experience: 1000,
        title: 'Early Adopter',
        items: ["Founder's Badge"],
      },
      completed: false,
    },
    {
      id: 'dedication',
      title: 'Dedicated Guardian',
      description: 'Play for 30 consecutive days',
      category: 'special',
      icon: '📅',
      rarity: 'legendary',
      requirements: { type: 'days_played', target: 30 },
      rewards: { coins: 20000, experience: 5000, title: 'Dedicated Guardian' },
      completed: false,
    },
  ], []);

  const completeAchievement = React.useCallback((achievement: Achievement) => {
    safeSetItem(`achievement_${achievement.id}`, 'true');
    safeSetItem(`achievement_${achievement.id}_date`, new Date().toISOString());
    toast({
      title: 'Achievement Unlocked!',
      description: `${achievement.title} - ${achievement.description}`,
    });
    // Award rewards (this would integrate with your game state)
    // For now, we'll just show the notification
  }, [toast]);

  useEffect(() => {
    // Initialize achievements with current progress
    const updatedAchievements = achievementsList.map((achievement) => {
      let current = 0;
      switch (achievement.requirements.type) {
        case 'total_mined':
          current = gameStats.coins;
          break;
        case 'mine_count':
          current = Number.parseInt(safeGetItem('mine_count'));
          break;
        case 'max_combo':
          current = Number.parseInt(safeGetItem('max_combo'));
          break;
        case 'quests_completed':
          current = Number.parseInt(safeGetItem('quests_completed'));
          break;
        case 'enemies_defeated':
          current = Number.parseInt(safeGetItem('enemies_defeated'));
          break;
        case 'premium_purchases':
          current = Number.parseInt(safeGetItem('premium_purchases'));
          break;
        case 'total_spent':
          current = Number.parseFloat(safeGetItem('total_spent'));
          break;
        case 'days_played':
          current = Number.parseInt(safeGetItem('days_played', '1'));
          break;
        default:
          current = 0;
      }

      let wasCompleted = false;
      let completedDate: Date | undefined = undefined;
      wasCompleted = safeGetItem(`achievement_${achievement.id}`) === 'true';
      if (wasCompleted) {
        const dateStr = safeGetItem(`achievement_${achievement.id}_date`, '');
        completedDate = dateStr ? new Date(dateStr) : new Date(safeNow());
      }

      const completed = current >= achievement.requirements.target;

      // Check if achievement was just completed
      if (completed && !wasCompleted) {
        completeAchievement(achievement);
      }

      return {
        ...achievement,
        requirements: { ...achievement.requirements, current },
        completed: completed || wasCompleted,
        completedDate,
      };
    });
    setAchievements(updatedAchievements);
  }, [gameStats, achievementsList, completeAchievement]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500';
      case 'rare':
        return 'bg-blue-500';
      case 'epic':
        return 'bg-purple-500';
      case 'legendary':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRarityBadgeVariant = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'default';
      case 'epic':
        return 'secondary';
      case 'rare':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (achievement.hidden && !achievement.completed) return false;
    if (activeCategory !== 'all' && achievement.category !== activeCategory) return false;
    if (!showCompleted && achievement.completed) return false;
    return true;
  });

  const completedCount = achievements.filter((a) => a.completed).length;
  const totalCount = achievements.filter((a) => !a.hidden || a.completed).length;

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-lg text-muted-foreground">Loading achievements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Achievement Progress Overview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-primary">Sacred Achievements</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round((completedCount / totalCount) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        <Progress value={(completedCount / totalCount) * 100} className="h-3" />
      </Card>

      {/* Category Filters */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mining">Mining</TabsTrigger>
          <TabsTrigger value="adventure">Adventure</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between mt-4 mb-4">
          <h3 className="font-semibold">
            {activeCategory === 'all'
              ? 'All Achievements'
              : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Achievements`}
          </h3>
          <Button variant="outline" size="sm" onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? 'Hide' : 'Show'} Completed
          </Button>
        </div>

        <div className="space-y-3">
          {filteredAchievements.map((achievement: Achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 ${achievement.completed ? 'bg-primary/5 border-primary/20' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${achievement.completed ? 'bg-primary/20' : 'bg-muted/20'}`}
                >
                  {achievement.completed ? '✅' : achievement.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${achievement.completed ? 'text-primary' : ''}`}>
                      {achievement.title}
                    </h3>
                    <Badge
                      variant={getRarityBadgeVariant(
                        achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary',
                      )}
                      className={getRarityColor(
                        achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary',
                      )}
                    >
                      {achievement.rarity}
                    </Badge>
                    {achievement.completed && (
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

                  {!achievement.completed && achievement.requirements.current !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.requirements.current}/{achievement.requirements.target}
                        </span>
                      </div>
                      <Progress
                        value={
                          (achievement.requirements.current / achievement.requirements.target) * 100
                        }
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>💰 {achievement.rewards.coins} coins</span>
                      <span>⭐ {achievement.rewards.experience} XP</span>
                      {achievement.rewards.title && (
                        <span>🏷️ &quot;{achievement.rewards.title}&quot; title</span>
                      )}
                    </div>
                    {achievement.completed && hydrated && achievement.completedDate && (
                      <span className="text-xs text-muted-foreground">
                        {hydrated && achievement.completedDate ? achievement.completedDate.toLocaleDateString() : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-semibold mb-2">No Achievements Found</h3>
            <p className="text-sm text-muted-foreground">
              {showCompleted
                ? 'No completed achievements in this category'
                : 'Try a different category or show completed achievements'}
            </p>
          </Card>
        )}
      </Tabs>

      {/* Achievement Statistics */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Achievement Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {
                achievements.filter(
                  (a: Achievement) =>
                    a.completed && a.rarity === 'legendary',
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Legendary</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {
                achievements.filter(
                  (a: Achievement) => a.completed && a.rarity === 'epic',
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Epic</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {
                achievements.filter(
                  (a: Achievement) => a.completed && a.rarity === 'rare',
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Rare</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {
                achievements.filter(
                  (a: Achievement) => a.completed && a.rarity === 'common',
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Common</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
