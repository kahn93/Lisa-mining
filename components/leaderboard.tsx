'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Player {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  coins: number;
  miningPower: number;
  questsCompleted: number;
  achievements: number;
  tonSpent: number;
  lastActive: Date;
  rank: number;
  change: number; // Position change from last update
}

interface LeaderboardCategory {
  id: string;
  name: string;
  icon: string;
  sortBy: keyof Player;
  description: string;
}

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeCategory, setActiveCategory] = useState('coins');
  const [timeframe, setTimeframe] = useState('all-time');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const categories: LeaderboardCategory[] = [
    {
      id: 'coins',
      name: 'Richest Guardians',
      icon: '💰',
      sortBy: 'coins',
      description: 'Players with the most LISA tokens',
    },
    {
      id: 'level',
      name: 'Highest Level',
      icon: '⭐',
      sortBy: 'level',
      description: 'Most experienced guardians',
    },
    {
      id: 'mining',
      name: 'Mining Power',
      icon: '⛏️',
      sortBy: 'miningPower',
      description: 'Strongest miners in the realm',
    },
    {
      id: 'quests',
      name: 'Quest Masters',
      icon: '🗡️',
      sortBy: 'questsCompleted',
      description: 'Heroes who completed the most quests',
    },
    {
      id: 'achievements',
      name: 'Achievement Hunters',
      icon: '🏆',
      sortBy: 'achievements',
      description: 'Players with the most achievements',
    },
    {
      id: 'premium',
      name: 'Divine Supporters',
      icon: '💎',
      sortBy: 'tonSpent',
      description: 'Top supporters of the realm',
    },
  ];

  // Hydration guard for random and Date.now()
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Hydration-safe random and now
  const safeRandom = () => (typeof window !== 'undefined' ? Math.random() : 0.5);
  const safeNow = () => (typeof window !== 'undefined' ? Date.now() : 0);

  // Mock data - in a real app, this would come from your backend/blockchain
  const mockPlayers: Player[] = hydrated ? [
    {
      id: '1',
      username: 'AngelicMiner',
      level: 25,
      coins: 150000,
      miningPower: 45,
      questsCompleted: 12,
      achievements: 18,
      tonSpent: 15.5,
      lastActive: new Date(),
      rank: 1,
      change: 0,
    },
    {
      id: '2',
      username: 'DivineWarrior',
      level: 23,
      coins: 142000,
      miningPower: 42,
      questsCompleted: 15,
      achievements: 16,
      tonSpent: 12.3,
      lastActive: new Date(safeNow() - 3600000),
      rank: 2,
      change: 1,
    },
    {
      id: '3',
      username: 'HolyMiner99',
      level: 22,
      coins: 138000,
      miningPower: 40,
      questsCompleted: 10,
      achievements: 20,
      tonSpent: 8.7,
      lastActive: new Date(safeNow() - 7200000),
      rank: 3,
      change: -1,
    },
    {
      id: '4',
      username: 'GuardianElite',
      level: 21,
      coins: 125000,
      miningPower: 38,
      questsCompleted: 14,
      achievements: 15,
      tonSpent: 20.1,
      lastActive: new Date(safeNow() - 1800000),
      rank: 4,
      change: 2,
    },
    {
      id: '5',
      username: 'CelestialHero',
      level: 20,
      coins: 118000,
      miningPower: 35,
      questsCompleted: 11,
      achievements: 14,
      tonSpent: 6.4,
      lastActive: new Date(safeNow() - 5400000),
      rank: 5,
      change: -1,
    },
    // Add more mock players...
    ...Array.from({ length: 45 }, (_, i) => ({
      id: `${i + 6}`,
      username: `Player${i + 6}`,
      level: Math.floor(safeRandom() * 20) + 1,
      coins: Math.floor(safeRandom() * 100000) + 10000,
      miningPower: Math.floor(safeRandom() * 30) + 5,
      questsCompleted: Math.floor(safeRandom() * 10),
      achievements: Math.floor(safeRandom() * 15),
      tonSpent: safeRandom() * 10,
      lastActive: new Date(safeNow() - safeRandom() * 86400000 * 7),
      rank: i + 6,
      change: Math.floor(safeRandom() * 6) - 3,
    })),
  ] : [];

  useEffect(() => {
    // Sort players by selected category
    const sortedPlayers = [...mockPlayers].sort((a, b) => {
      const category = categories.find((c) => c.id === activeCategory);
      if (!category) return 0;

      const aValue = a[category.sortBy] as number;
      const bValue = b[category.sortBy] as number;
      return bValue - aValue;
    });

    // Update ranks
    const rankedPlayers = sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    setPlayers(rankedPlayers);

    // Set current player (mock - would be actual player data)
    const currentPlayerData = rankedPlayers.find((p) => p.username === 'YourUsername') || {
      id: 'current',
      username: 'You',
      level: 15,
      coins: 75000,
      miningPower: 25,
      questsCompleted: 8,
      achievements: 12,
      tonSpent: 3.2,
      lastActive: new Date(),
      rank: rankedPlayers.length + 1,
      change: 0,
    };
    setCurrentPlayer(currentPlayerData);
  }, [activeCategory]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➖';
  };

  const formatValue = (value: number, category: string) => {
    // Hydration-safe locale formatting
    if (!hydrated) return value.toString();
    switch (category) {
      case 'coins':
        return value.toLocaleString();
      case 'tonSpent':
        return `${value.toFixed(1)} TON`;
      default:
        return value.toString();
    }
  };

  const currentCategory = categories.find((c) => c.id === activeCategory);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-lg text-muted-foreground">Loading leaderboard...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-transparent">
        <h1 className="text-2xl font-bold text-primary mb-2">Sacred Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Compete with guardians across the realm</p>
      </Card>

      {/* Current Player Position */}
      {currentPlayer && (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold">
              {getRankIcon(currentPlayer.rank)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-primary">{currentPlayer.username}</h3>
                <Badge variant="outline">Your Rank</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentCategory &&
                  formatValue(currentPlayer[currentCategory.sortBy] as number, activeCategory)}{' '}
                • Level {currentPlayer.level}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">#{currentPlayer.rank}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {getChangeIcon(currentPlayer.change)}
                {Math.abs(currentPlayer.change)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              <span className="mr-1">{category.icon}</span>
              <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Category Description */}
        {currentCategory && (
          <Card className="p-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentCategory.icon}</span>
              <div>
                <h3 className="font-semibold">{currentCategory.name}</h3>
                <p className="text-xs text-muted-foreground">{currentCategory.description}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {players.slice(0, 50).map((player, index) => (
            <Card
              key={player.id}
              className={`p-3 ${index < 3 ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center font-bold text-sm">
                  {getRankIcon(player.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {player.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{player.username}</h4>
                    <Badge variant="outline">
                      L{player.level}
                    </Badge>
                    {index < 3 && (
                      <Badge variant="default">
                        Top {index + 1}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentCategory &&
                      formatValue(player[currentCategory.sortBy] as number, activeCategory)}{' '}
                    • {player.achievements} achievements
                  </p>
                </div>

                {/* Change Indicator */}
                <div className="text-right">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {getChangeIcon(player.change)}
                    {player.change !== 0 && Math.abs(player.change)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor((Date.now() - player.lastActive.getTime()) / 3600000)}h ago
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <Card className="p-4 text-center">
          <Button variant="outline" className="w-full bg-transparent">
            Load More Players
          </Button>
        </Card>
      </Tabs>

      {/* Leaderboard Stats */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Leaderboard Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{players.length}</div>
            <div className="text-xs text-muted-foreground">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {players.filter((p) => Date.now() - p.lastActive.getTime() < 3600000).length}
            </div>
            <div className="text-xs text-muted-foreground">Active (1h)</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {currentCategory &&
                Math.max(
                  ...players.map((p) => p[currentCategory.sortBy] as number),
                ).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Top Score</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {currentCategory &&
                Math.floor(
                  players.reduce((sum, p) => sum + (p[currentCategory.sortBy] as number), 0) /
                    players.length,
                ).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
