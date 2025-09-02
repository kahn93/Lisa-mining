'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Mission {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'boss';
  difficulty: number;
  rewards: { divineEssence: number; experience: number; items?: string[]; };
  objectives: string[];
  completed: boolean;
  location: string;
  enemyTypes: string[];
  timeLimit?: number;
}

interface TreasureHunt {
  id: string;
  name: string;
  clue: string;
  location: { x: number; y: number; area: string; };
  reward: { divineEssence: number; items: string[]; };
  timeLimit: number;
  discovered: boolean;
  completed: boolean;
}

interface MissionsProps {
  missions: Mission[];
  treasureHunts: TreasureHunt[];
  onCompleteMission?: (missionId: string) => void;
  onCompleteTreasureHunt?: (treasureHuntId: string) => void;
}

export function Missions({ missions, treasureHunts, onCompleteMission, onCompleteTreasureHunt }: MissionsProps) {
  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">Missions & Quests</h1>
        <p className="text-sm text-muted-foreground">
          Complete missions and discover treasures to earn rewards
        </p>
      </div>

      {/* Missions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Missions</h2>
        {missions.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📜</div>
            <h3 className="font-semibold mb-2">No Active Missions</h3>
            <p className="text-sm text-muted-foreground">
              Missions will be available as you progress through the game
            </p>
          </Card>
        ) : (
          missions.map((mission) => (
            <Card key={mission.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{mission.name}</h3>
                    <Badge variant={mission.type === 'main' ? 'default' : 'secondary'}>
                      {mission.type}
                    </Badge>
                    <Badge variant="outline">
                      Difficulty {mission.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Location: {mission.location}
                  </div>
                </div>
                {mission.completed && (
                  <Badge className="bg-green-500">Completed</Badge>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <h4 className="text-sm font-medium">Objectives:</h4>
                {mission.objectives.map((objective, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {objective}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div>Rewards: {mission.rewards.divineEssence} Divine Essence, {mission.rewards.experience} XP</div>
                  {mission.rewards.items && mission.rewards.items.length > 0 && (
                    <div>Items: {mission.rewards.items.join(', ')}</div>
                  )}
                </div>
                {!mission.completed && onCompleteMission && (
                  <Button size="sm" onClick={() => onCompleteMission(mission.id)}>
                    Complete Mission
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Treasure Hunts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Treasure Hunts</h2>
        {treasureHunts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="font-semibold mb-2">No Treasure Hunts</h3>
            <p className="text-sm text-muted-foreground">
              Treasure hunts will appear as you explore the realm
            </p>
          </Card>
        ) : (
          treasureHunts.map((treasureHunt) => (
            <Card key={treasureHunt.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{treasureHunt.name}</h3>
                    <Badge variant={treasureHunt.discovered ? 'default' : 'secondary'}>
                      {treasureHunt.discovered ? 'Discovered' : 'Hidden'}
                    </Badge>
                    {treasureHunt.completed && (
                      <Badge className="bg-green-500">Completed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{treasureHunt.clue}</p>
                  <div className="text-xs text-muted-foreground">
                    Area: {treasureHunt.location.area}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div>Rewards: {treasureHunt.reward.divineEssence} Divine Essence</div>
                  {treasureHunt.reward.items && treasureHunt.reward.items.length > 0 && (
                    <div>Items: {treasureHunt.reward.items.join(', ')}</div>
                  )}
                </div>
                {treasureHunt.discovered && !treasureHunt.completed && onCompleteTreasureHunt && (
                  <Button size="sm" onClick={() => onCompleteTreasureHunt(treasureHunt.id)}>
                    Claim Treasure
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}