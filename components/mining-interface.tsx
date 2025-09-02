'use client';

import type { Achievement, Upgrade } from '@/app/page';
import type React from 'react';
import { setTimeout } from 'timers';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCallback, useEffect, useState } from 'react';

interface GameStats {
  coins: number;
  miningPower: number;
  energy: number;
  maxEnergy: number;
  experience: number;
  level: number;
  autoMining: boolean;
  experienceToNext?: number; // Optional to align with GameState
  achievements?: Achievement[]; // Optional to align with GameState
  upgrades?: Upgrade[]; // Optional to align with GameState
  totalTaps?: number; // Optional to align with GameState
  totalCoinsEarned?: number; // Optional to align with GameState
  maxCombo?: number; // Optional to align with GameState
  daysPlayed?: number; // Optional to align with GameState
  prestigeLevel?: number; // Optional to align with GameState
  prestigePoints?: number; // Optional to align with GameState
  lastCheckIn?: string; // Optional to align with GameState
  checkInStreak?: number; // Optional to align with GameState
  totalPoints?: number; // Optional to align with GameState
}

interface MiningInterfaceProps {
  gameStats: GameStats;
  setGameStatsAction: (stats: GameStats | ((prev: GameStats) => GameStats)) => void;
}

interface FloatingReward {
  id: number;
  amount: number;
  x: number;
  y: number;
  type: 'normal' | 'critical' | 'bonus';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function MiningInterface({ gameStats, setGameStatsAction }: MiningInterfaceProps) {
  const [tapAnimation, setTapAnimation] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [offlineRewards, setOfflineRewards] = useState(0);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const [lastPlayTime, setLastPlayTime] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  useEffect(() => {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      const lpt = globalThis.localStorage.getItem('lastPlayTime');
      setLastPlayTime(lpt ? Number.parseInt(lpt) : null);
      const gst = globalThis.localStorage.getItem('gameStartTime');
      setGameStartTime(gst ? Number.parseInt(gst) : Date.now());
    }
  }, []);

  useEffect(() => {
    if (lastPlayTime && gameStats.autoMining) {
      const now = Date.now();
      const offlineTime = (now - lastPlayTime) / 1000; // Calculate offline time in seconds
      const offlineEarnings = Math.floor(offlineTime * gameStats.miningPower * 0.5); // 50% efficiency offline

      if (offlineEarnings > 0) {
        setOfflineRewards(offlineEarnings);
        setShowOfflineModal(true);
      }
    }
    // Auto mining interval
    if (gameStats.autoMining) {
      const interval = globalThis.setInterval(() => {
        // Refine setGameStatsAction logic to ensure type compatibility
        setGameStatsAction((prev: GameStats) => {
          const updatedStats: GameStats = {
            ...prev,
            coins: prev.coins + prev.miningPower,
            energy: prev.energy, // Ensure all required fields are included
            maxEnergy: prev.maxEnergy,
            level: prev.level,
            experience: prev.experience,
            experienceToNext: prev.experienceToNext,
            miningPower: prev.miningPower,
            autoMining: prev.autoMining,
            achievements: prev.achievements,
            upgrades: prev.upgrades,
            totalTaps: prev.totalTaps,
            totalCoinsEarned: prev.totalCoinsEarned,
            maxCombo: prev.maxCombo,
            daysPlayed: prev.daysPlayed,
            prestigeLevel: prev.prestigeLevel,
            prestigePoints: prev.prestigePoints,
            lastCheckIn: prev.lastCheckIn,
            checkInStreak: prev.checkInStreak,
            totalPoints: prev.totalPoints,
          };
          return updatedStats;
        });
      }, 1000);
      return () => globalThis.clearInterval(interval);
    }
  }, [lastPlayTime, gameStats.autoMining, gameStats.miningPower, setGameStatsAction]);

  useEffect(() => {
    const regenRate = 2000 - gameStats.level * 50; // Faster regen at higher levels
    const interval = globalThis.setInterval(
      () => {
        setGameStatsAction((prev: GameStats) => ({
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + (1 + Math.floor(prev.level / 5))),
        }));
      },
      Math.max(1000, regenRate),
    );
    return () => globalThis.clearInterval(interval);
  }, [gameStats.level, setGameStatsAction]);

  useEffect(() => {
    if (comboTimer > 0) {
      const timeout = globalThis.setTimeout(() => {
        setComboTimer(comboTimer - 1);
        if (comboTimer === 1) {
          setComboCount(0);
        }
      }, 1000);
      return () => globalThis.clearTimeout(timeout);
    }
  }, [comboTimer, comboCount]);

  useEffect(() => {
    const interval = globalThis.setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // Gravity
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0),
      );
    }, 16); // 60fps
    return () => globalThis.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = globalThis.setInterval(() => {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem('lastPlayTime', Date.now().toString());
      }
    }, 5000);
    return () => globalThis.clearInterval(interval);
  }, []);

  const createParticles = useCallback((x: number, y: number, count = 5) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 60,
        maxLife: 60,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const handleMiningTap = (event: React.MouseEvent) => {
    if (gameStats.energy <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const basePower = gameStats.miningPower;
    const comboMultiplier = Math.min(1 + comboCount * 0.1, 3); // Max 3x multiplier
    const criticalChance = 0.1 + gameStats.level * 0.01; // Increases with level
    const isCritical = Math.random() < criticalChance;
    const isBonus = Math.random() < 0.05; // 5% bonus chance

    let finalReward = Math.floor(basePower * comboMultiplier);
    let rewardType: 'normal' | 'critical' | 'bonus' = 'normal';

    if (isBonus) {
      finalReward *= 5;
      rewardType = 'bonus';
    } else if (isCritical) {
      finalReward *= 2;
      rewardType = 'critical';
    }

    // Update combo
    setComboCount((prev) => prev + 1);
    setComboTimer(5); // 5 second combo window

    // Create particles
    createParticles(x, y, rewardType === 'bonus' ? 15 : rewardType === 'critical' ? 10 : 5);

    // Add floating reward
    const reward: FloatingReward = {
      id: Date.now(),
      amount: finalReward,
      x,
      y,
      type: rewardType,
    };
    setFloatingRewards((prev) => [...prev, reward]);

    // Remove floating reward after animation
    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((r) => r.id !== reward.id));
    }, 1500);

    setGameStatsAction((prev: GameStats) => {
      const newCoins = prev.coins + finalReward;
      const newExperience =
        prev.experience + (rewardType === 'bonus' ? 5 : rewardType === 'critical' ? 3 : 1);
      const newLevel = Math.floor(newExperience / 1000) + 1;

      return {
        ...prev,
        coins: newCoins,
        energy: Math.max(0, prev.energy - 1),
        experience: newExperience,
        level: newLevel,
      };
    });

    // Trigger tap animation
    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 150);
  };

  const claimOfflineRewards = () => {
    setGameStatsAction((prev: GameStats) => ({
      ...prev,
      coins: prev.coins + offlineRewards,
    }));
    setShowOfflineModal(false);
    setOfflineRewards(0);
  };

  return (
    <div className="space-y-6 pb-20">
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-primary mb-2">Welcome Back!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your auto-mining earned rewards while you were away
            </p>
            <div className="text-3xl font-bold text-primary mb-4">
              +{offlineRewards.toLocaleString()} coins
            </div>
            <Button onClick={claimOfflineRewards} className="w-full glow-effect">
              Claim Rewards
            </Button>
          </Card>
        </div>
      )}

      {comboCount > 1 && (
        <Card className="p-3 text-center bg-primary/10 border-primary/50">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-primary">{comboCount}x COMBO!</span>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${(comboTimer / 5) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Mining Core */}
      <Card className="p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />

        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                opacity: particle.life / particle.maxLife,
                transform: `scale(${particle.life / particle.maxLife})`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 text-primary">Sacred Mining Crystal</h2>

          <div className="relative inline-block">
            <Button
              size="lg"
              className={`w-36 h-36 rounded-full text-5xl mining-tap pulse-glow transition-all duration-150 ${tapAnimation ? 'scale-90' : ''
                } ${gameStats.energy <= 0 ? 'opacity-50 cursor-not-allowed' : ''} ${comboCount > 5 ? 'shadow-lg shadow-primary/50' : ''
                }`}
              onClick={handleMiningTap}
              disabled={gameStats.energy <= 0}
            >
              💎
            </Button>

            {/* Enhanced floating rewards */}
            {floatingRewards.map((reward) => (
              <div
                key={reward.id}
                className={`absolute font-bold pointer-events-none animate-bounce ${reward.type === 'bonus'
                  ? 'text-yellow-400 text-xl'
                  : reward.type === 'critical'
                    ? 'text-red-400 text-lg'
                    : 'text-primary text-base'
                  }`}
                style={{
                  left: reward.x,
                  top: reward.y,
                  transform: 'translate(-50%, -50%)',
                  animation: 'float-up 1.5s ease-out forwards',
                }}
              >
                +{reward.amount}
                {reward.type === 'bonus' && ' 🌟'}
                {reward.type === 'critical' && ' ⚡'}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Tap to mine LISA tokens • Power: {gameStats.miningPower}
            </p>
            {comboCount > 1 && (
              <p className="text-xs text-primary font-medium">
                Combo Multiplier: {Math.min(1 + comboCount * 0.1, 3).toFixed(1)}x
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Mining Upgrades</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent"
            onClick={() => {
              const cost = 100 * Math.pow(1.5, gameStats.miningPower - 1);
              if (gameStats.coins >= cost) {
                setGameStatsAction((prev: GameStats) => ({
                  ...prev,
                  coins: prev.coins - cost,
                  miningPower: prev.miningPower + 1,
                }));
              }
            }}
            disabled={gameStats.coins < 100 * Math.pow(1.5, gameStats.miningPower - 1)}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-xs text-center">
              Power Up
              <br />
              <Badge variant="secondary">
                {Math.floor(100 * Math.pow(1.5, gameStats.miningPower - 1))} coins
              </Badge>
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent"
            onClick={() => {
              const cost = 500 * Math.pow(1.3, Math.floor(gameStats.maxEnergy / 50) - 2);
              if (gameStats.coins >= cost) {
                setGameStatsAction((prev: GameStats) => ({
                  ...prev,
                  coins: prev.coins - cost,
                  maxEnergy: prev.maxEnergy + 50,
                }));
              }
            }}
            disabled={
              gameStats.coins < 500 * Math.pow(1.3, Math.floor(gameStats.maxEnergy / 50) - 2)
            }
          >
            <span className="text-2xl">🔋</span>
            <span className="text-xs text-center">
              Max Energy
              <br />
              <Badge variant="secondary">
                {Math.floor(500 * Math.pow(1.3, Math.floor(gameStats.maxEnergy / 50) - 2))} coins
              </Badge>
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent"
            onClick={() => {
              if (gameStats.coins >= 2000 && !gameStats.autoMining) {
                setGameStatsAction((prev: GameStats) => ({
                  ...prev,
                  coins: prev.coins - 2000,
                  autoMining: true,
                }));
              }
            }}
            disabled={gameStats.coins < 2000 || gameStats.autoMining}
          >
            <span className="text-2xl">🤖</span>
            <span className="text-xs text-center">
              Auto Mining
              <br />
              <Badge variant={gameStats.autoMining ? 'default' : 'secondary'}>
                {gameStats.autoMining ? 'Active' : '2000 coins'}
              </Badge>
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 flex flex-col items-center gap-2 bg-transparent"
            onClick={() => {
              const cost = 1000;
              if (gameStats.coins >= cost && gameStats.energy < gameStats.maxEnergy) {
                setGameStatsAction((prev: GameStats) => ({
                  ...prev,
                  coins: prev.coins - cost,
                  energy: prev.maxEnergy,
                }));
              }
            }}
            disabled={gameStats.coins < 1000 || gameStats.energy >= gameStats.maxEnergy}
          >
            <span className="text-2xl">⚡</span>
            <span className="text-xs text-center">
              Full Energy
              <br />
              <Badge variant="secondary">1000 coins</Badge>
            </span>
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Daily Tasks</h3>
        <div className="space-y-3">
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mine 100 times</span>
              <Badge variant="outline">0/100</Badge>
            </div>
            <Progress value={0} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">Reward: 500 coins + 50 XP</div>
          </div>

          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Reach 10x combo</span>
              <Badge variant="outline">0/1</Badge>
            </div>
            <Progress value={0} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">Reward: 1000 coins + 100 XP</div>
          </div>

          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Complete 1 Adventure</span>
              <Badge variant="outline">0/1</Badge>
            </div>
            <Progress value={0} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">Reward: 2000 coins + 200 XP</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Mining Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {gameStartTime && gameStartTime < Date.now()
                ? ((gameStats.coins / (Date.now() - gameStartTime)) * 60000).toFixed(1)
                : '-'}
            </div>
            <div className="text-xs text-muted-foreground">Coins/min</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{gameStats.level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Ensure setTimeout is globally available
if (typeof globalThis.setTimeout === 'undefined') {
  globalThis.setTimeout = setTimeout;
}
