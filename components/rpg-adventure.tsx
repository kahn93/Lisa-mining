'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sword,
  Shield,
  Heart,
  Zap,
  Star,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Crown,
  Flame,
} from 'lucide-react';

interface Character {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  experience: number;
  experienceToNext: number;
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  weapon: string;
  skills: string[];
  inventory: string[];
}

interface Enemy {
  id: string;
  name: string;
  type: 'demon' | 'witch' | 'wizard' | 'zombie' | 'devil';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  position: { x: number; y: number };
  reward: { coins: number; experience: number };
  isAlive: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'rescue' | 'defeat' | 'collect' | 'explore';
  target: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: { coins: number; experience: number; item?: string };
}

interface GameMap {
  width: number;
  height: number;
  tiles: ('grass' | 'stone' | 'water' | 'portal' | 'enemy' | 'soul')[][];
  enemies: Enemy[];
  souls: { x: number; y: number; rescued: boolean }[];
}

export default function RPGAdventure() {
  const [character, setCharacter] = useState<Character>({
    name: 'Guardian Angel Lisa',
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 15,
    defense: 10,
    speed: 12,
    experience: 0,
    experienceToNext: 100,
    position: { x: 5, y: 5 },
    direction: 'down',
    weapon: 'Divine Sword',
    skills: ['Healing Light', 'Divine Strike', 'Angel Wings'],
    inventory: ['Health Potion', 'Mana Potion'],
  });

  const [gameMap, setGameMap] = useState<GameMap>({
    width: 12,
    height: 8,
    tiles: Array(8)
      .fill(null)
      .map(() => Array(12).fill('grass')),
    enemies: [
      {
        id: 'demon1',
        name: 'Shadow Demon',
        type: 'demon',
        hp: 60,
        maxHp: 60,
        attack: 12,
        defense: 5,
        position: { x: 8, y: 3 },
        reward: { coins: 25, experience: 30 },
        isAlive: true,
      },
      {
        id: 'witch1',
        name: 'Dark Witch',
        type: 'witch',
        hp: 45,
        maxHp: 45,
        attack: 18,
        defense: 3,
        position: { x: 3, y: 6 },
        reward: { coins: 20, experience: 25 },
        isAlive: true,
      },
      {
        id: 'zombie1',
        name: 'Lost Zombie',
        type: 'zombie',
        hp: 80,
        maxHp: 80,
        attack: 8,
        defense: 8,
        position: { x: 10, y: 2 },
        reward: { coins: 15, experience: 20 },
        isAlive: true,
      },
    ],
    souls: [
      { x: 2, y: 2, rescued: false },
      { x: 9, y: 6, rescued: false },
      { x: 7, y: 1, rescued: false },
      { x: 1, y: 7, rescued: false },
    ],
  });

  const [activeQuests, setActiveQuests] = useState<Quest[]>([
    {
      id: 'rescue_souls',
      title: 'Save the Lost Souls',
      description: 'Find and rescue 4 lost souls trapped in this realm',
      type: 'rescue',
      target: 'souls',
      progress: 0,
      maxProgress: 4,
      completed: false,
      reward: { coins: 100, experience: 150, item: 'Angel Halo' },
    },
    {
      id: 'defeat_demons',
      title: 'Cleanse the Darkness',
      description: 'Defeat all demons and dark creatures',
      type: 'defeat',
      target: 'enemies',
      progress: 0,
      maxProgress: 3,
      completed: false,
      reward: { coins: 75, experience: 100, item: 'Divine Shield' },
    },
  ]);

  const [battleState, setBattleState] = useState<{
    inBattle: boolean;
    enemy: Enemy | null;
    playerTurn: boolean;
    battleLog: string[];
  }>({
    inBattle: false,
    enemy: null,
    playerTurn: true,
    battleLog: [],
  });

  const [gameMessage, setGameMessage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (battleState.inBattle) return;

      let newX = character.position.x;
      let newY = character.position.y;
      let newDirection = character.direction;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newY = Math.max(0, newY - 1);
          newDirection = 'up';
          break;
        case 's':
        case 'arrowdown':
          newY = Math.min(gameMap.height - 1, newY + 1);
          newDirection = 'down';
          break;
        case 'a':
        case 'arrowleft':
          newX = Math.max(0, newX - 1);
          newDirection = 'left';
          break;
        case 'd':
        case 'arrowright':
          newX = Math.min(gameMap.width - 1, newX + 1);
          newDirection = 'right';
          break;
      }

      if (newX !== character.position.x || newY !== character.position.y) {
        moveCharacter(newX, newY, newDirection);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
    return undefined;
  }, [character.position, battleState.inBattle, gameMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = 40;
    canvas.width = gameMap.width * tileSize;
    canvas.height = gameMap.height * tileSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tiles with anime-style colors
    for (let y = 0; y < gameMap.height; y++) {
      for (let x = 0; x < gameMap.width; x++) {
        const tileX = x * tileSize;
        const tileY = y * tileSize;

        // Grass tiles with gradient
        const gradient = ctx.createLinearGradient(tileX, tileY, tileX, tileY + tileSize);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#22c55e');
        ctx.fillStyle = gradient;
        ctx.fillRect(tileX, tileY, tileSize, tileSize);

        // Tile border
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1;
        ctx.strokeRect(tileX, tileY, tileSize, tileSize);
      }
    }

    // Draw souls with glowing effect
    gameMap.souls.forEach((soul) => {
      if (!soul.rescued) {
        const soulX = soul.x * tileSize + tileSize / 2;
        const soulY = soul.y * tileSize + tileSize / 2;

        // Glow effect
        const glowGradient = ctx.createRadialGradient(soulX, soulY, 5, soulX, soulY, 20);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(soul.x * tileSize, soul.y * tileSize, tileSize, tileSize);

        // Soul orb
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(soulX, soulY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw enemies with anime-style sprites
    gameMap.enemies.forEach((enemy) => {
      if (enemy.isAlive) {
        const enemyX = enemy.position.x * tileSize + tileSize / 2;
        const enemyY = enemy.position.y * tileSize + tileSize / 2;

        // Enemy shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemyX, enemyY + 15, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Enemy body based on type
        let enemyColor = '#ef4444';
        if (enemy.type === 'witch') enemyColor = '#8b5cf6';
        if (enemy.type === 'wizard') enemyColor = '#3b82f6';
        if (enemy.type === 'zombie') enemyColor = '#22c55e';
        if (enemy.type === 'devil') enemyColor = '#dc2626';

        ctx.fillStyle = enemyColor;
        ctx.beginPath();
        ctx.arc(enemyX, enemyY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Enemy eyes
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(enemyX - 4, enemyY - 3, 2, 0, Math.PI * 2);
        ctx.arc(enemyX + 4, enemyY - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Lisa with anime-style character
    const lisaX = character.position.x * tileSize + tileSize / 2;
    const lisaY = character.position.y * tileSize + tileSize / 2;

    // Lisa's shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(lisaX, lisaY + 18, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lisa's body (angel dress)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(lisaX, lisaY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Lisa's hair (burgundy)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(lisaX, lisaY - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Lisa's halo
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lisaX, lisaY - 15, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Lisa's wings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(lisaX - 12, lisaY, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.ellipse(lisaX + 12, lisaY, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }, [character.position, gameMap, battleState]);

  const moveCharacter = (newX: number, newY: number, direction: string) => {
    // Check for enemy collision
    const enemy = gameMap.enemies.find(
      (e) => e.isAlive && e.position.x === newX && e.position.y === newY,
    );

    if (enemy) {
      startBattle(enemy);
      return;
    }

    // Check for soul rescue
    const soul = gameMap.souls.find((s) => !s.rescued && s.x === newX && s.y === newY);

    if (soul) {
      rescueSoul(soul);
    }

    setCharacter((prev) => ({
      ...prev,
      position: { x: newX, y: newY },
      direction: direction as any,
    }));
  };

  const rescueSoul = (soul: { x: number; y: number; rescued: boolean }) => {
    setGameMap((prev) => ({
      ...prev,
      souls: prev.souls.map((s) =>
        s.x === soul.x && s.y === soul.y ? { ...s, rescued: true } : s,
      ),
    }));

    setActiveQuests((prev) =>
      prev.map((quest) => {
        if (quest.id === 'rescue_souls') {
          const newProgress = quest.progress + 1;
          return {
            ...quest,
            progress: newProgress,
            completed: newProgress >= quest.maxProgress,
          };
        }
        return quest;
      }),
    );

    setCharacter((prev) => ({
      ...prev,
      experience: prev.experience + 20,
      mp: Math.min(prev.maxMp, prev.mp + 10),
    }));

    setGameMessage('✨ Soul rescued! The light guides them home.');
    setTimeout(() => setGameMessage(''), 3000);
  };

  const startBattle = (enemy: Enemy) => {
    setBattleState({
      inBattle: true,
      enemy: enemy,
      playerTurn: true,
      battleLog: [`A wild ${enemy.name} appears!`],
    });
  };

  const performAttack = (skillName?: string) => {
    if (!battleState.enemy || !battleState.playerTurn) return;

    let damage = character.attack;
    let mpCost = 0;
    let attackName = 'Basic Attack';

    if (skillName) {
      switch (skillName) {
        case 'Divine Strike':
          damage = Math.floor(character.attack * 1.5);
          mpCost = 15;
          attackName = 'Divine Strike';
          break;
        case 'Healing Light':
          const healAmount = Math.floor(character.maxHp * 0.3);
          setCharacter((prev) => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + healAmount),
            mp: prev.mp - 20,
          }));
          setBattleState((prev) => ({
            ...prev,
            battleLog: [...prev.battleLog, `Lisa heals for ${healAmount} HP!`],
            playerTurn: false,
          }));
          setTimeout(enemyTurn, 1500);
          return;
      }
    }

    if (character.mp < mpCost) {
      setGameMessage('Not enough MP!');
      return;
    }

    const finalDamage = Math.max(1, damage - battleState.enemy.defense);
    const newEnemyHp = Math.max(0, battleState.enemy.hp - finalDamage);

    setCharacter((prev) => ({ ...prev, mp: prev.mp - mpCost }));

    setBattleState((prev) => ({
      ...prev,
      enemy: prev.enemy ? { ...prev.enemy, hp: newEnemyHp } : null,
      battleLog: [...prev.battleLog, `Lisa uses ${attackName} for ${finalDamage} damage!`],
      playerTurn: false,
    }));

    if (newEnemyHp <= 0) {
      setTimeout(() => {
        defeatEnemy();
      }, 1500);
    } else {
      setTimeout(enemyTurn, 1500);
    }
  };

  const enemyTurn = () => {
    if (!battleState.enemy || battleState.enemy.hp <= 0) return;

    const damage = Math.max(1, battleState.enemy.attack - character.defense);
    const newPlayerHp = Math.max(0, character.hp - damage);

    setCharacter((prev) => ({ ...prev, hp: newPlayerHp }));

    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, `${prev.enemy?.name} attacks for ${damage} damage!`],
      playerTurn: true,
    }));

    if (newPlayerHp <= 0) {
      setTimeout(() => {
        setBattleState({
          inBattle: false,
          enemy: null,
          playerTurn: true,
          battleLog: [],
        });
        setGameMessage('💀 Defeated! Lisa respawns at the starting point.');
        setCharacter((prev) => ({
          ...prev,
          hp: prev.maxHp,
          position: { x: 5, y: 5 },
        }));
      }, 2000);
    }
  };

  const defeatEnemy = () => {
    if (!battleState.enemy) return;

    const enemy = battleState.enemy;

    setGameMap((prev) => ({
      ...prev,
      enemies: prev.enemies.map((e) => (e.id === enemy.id ? { ...e, isAlive: false } : e)),
    }));

    setCharacter((prev) => ({
      ...prev,
      experience: prev.experience + enemy.reward.experience,
    }));

    setActiveQuests((prev) =>
      prev.map((quest) => {
        if (quest.id === 'defeat_demons') {
          const newProgress = quest.progress + 1;
          return {
            ...quest,
            progress: newProgress,
            completed: newProgress >= quest.maxProgress,
          };
        }
        return quest;
      }),
    );

    setBattleState({
      inBattle: false,
      enemy: null,
      playerTurn: true,
      battleLog: [],
    });

    setGameMessage(`⚔️ ${enemy.name} defeated! Gained ${enemy.reward.experience} XP!`);
    setTimeout(() => setGameMessage(''), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Character Status - Anime Style */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Crown className="h-5 w-5" />
            {character.name}
            <Badge variant="secondary" className="bg-pink-200 text-pink-800">
              Lv.{character.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">HP</span>
              </div>
              <Progress value={(character.hp / character.maxHp) * 100} className="h-2 bg-red-100" />
              <p className="text-xs text-muted-foreground mt-1">
                {character.hp}/{character.maxHp}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">MP</span>
              </div>
              <Progress
                value={(character.mp / character.maxMp) * 100}
                className="h-2 bg-blue-100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {character.mp}/{character.maxMp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <Progress
              value={(character.experience / character.experienceToNext) * 100}
              className="flex-1 h-2 bg-yellow-100"
            />
            <span className="text-xs text-muted-foreground">
              {character.experience}/{character.experienceToNext} XP
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Game Map */}
      <Card className="bg-gradient-to-b from-sky-50 to-green-50 border-2 border-sky-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sky-800">
            <Target className="h-5 w-5" />
            Sacred Realm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border-2 border-sky-300 rounded-lg bg-gradient-to-br from-green-100 to-green-200"
            />

            {/* Movement Controls */}
            <div className="mt-4 flex justify-center">
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    moveCharacter(character.position.x, Math.max(0, character.position.y - 1), 'up')
                  }
                  disabled={battleState.inBattle}
                  className="bg-white/80 hover:bg-white"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    moveCharacter(
                      Math.max(0, character.position.x - 1),
                      character.position.y,
                      'left',
                    )
                  }
                  disabled={battleState.inBattle}
                  className="bg-white/80 hover:bg-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-pink-600" />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    moveCharacter(
                      Math.min(gameMap.width - 1, character.position.x + 1),
                      character.position.y,
                      'right',
                    )
                  }
                  disabled={battleState.inBattle}
                  className="bg-white/80 hover:bg-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    moveCharacter(
                      character.position.x,
                      Math.min(gameMap.height - 1, character.position.y + 1),
                      'down',
                    )
                  }
                  disabled={battleState.inBattle}
                  className="bg-white/80 hover:bg-white"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <div></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle System */}
      {battleState.inBattle && battleState.enemy && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Sword className="h-5 w-5" />
              Battle: {battleState.enemy.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <Progress
                value={(battleState.enemy.hp / battleState.enemy.maxHp) * 100}
                className="flex-1 h-3 bg-red-100"
              />
              <span className="text-sm font-medium">
                {battleState.enemy.hp}/{battleState.enemy.maxHp}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => performAttack()}
                disabled={!battleState.playerTurn}
                className="bg-red-500 hover:bg-red-600"
              >
                <Sword className="h-4 w-4 mr-1" />
                Attack
              </Button>
              <Button
                onClick={() => performAttack('Divine Strike')}
                disabled={!battleState.playerTurn || character.mp < 15}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <Flame className="h-4 w-4 mr-1" />
                Divine Strike
              </Button>
              <Button
                onClick={() => performAttack('Healing Light')}
                disabled={!battleState.playerTurn || character.mp < 20}
                className="bg-green-500 hover:bg-green-600"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Heal
              </Button>
              <Button
                variant="outline"
                disabled={!battleState.playerTurn}
                className="bg-blue-100 hover:bg-blue-200"
              >
                <Shield className="h-4 w-4 mr-1" />
                Defend
              </Button>
            </div>

            <div className="bg-white/50 p-3 rounded-lg max-h-32 overflow-y-auto">
              {battleState.battleLog.map((log, index) => (
                <p key={index} className="text-sm text-gray-700 mb-1">
                  {log}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Quests */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Star className="h-5 w-5" />
            Sacred Missions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeQuests.map((quest) => (
            <div key={quest.id} className="bg-white/60 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-800">{quest.title}</h4>
                {quest.completed && <Badge className="bg-green-500">Complete!</Badge>}
              </div>
              <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
              <Progress
                value={(quest.progress / quest.maxProgress) * 100}
                className="h-2 bg-purple-100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {quest.progress}/{quest.maxProgress}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Game Message */}
      {gameMessage && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-amber-800 font-medium">{gameMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Controls Help */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 text-center">
            Use WASD or Arrow Keys to move • Walk into enemies to battle • Rescue glowing souls •
            Complete quests to progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
