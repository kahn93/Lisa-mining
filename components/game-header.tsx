"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TonConnectButton, TonConnectUI } from "@tonconnect/ui-react";

interface GameHeaderProps {
  gameStats: {
    coins: number;
    energy: number;
    maxEnergy: number;
    level: number;
    experience: number;
  };
  tonConnectUI: TonConnectUI; // Replace with the correct type from @tonconnect/ui-react
  wallet: { address: string; balance: number }; // Replace with the correct wallet type
}
export function GameHeader({ gameStats }: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xl">👼</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">
                Guardian Angel LISA
              </h1>
              <p className="text-xs text-muted-foreground">
                Level {gameStats.level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="glow-effect">
              💰 {gameStats.coins.toLocaleString()}
            </Badge>
            <TonConnectButton />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Energy</span>
              <span className="text-sm font-medium">
                {gameStats.energy}/{gameStats.maxEnergy}
              </span>
            </div>
            <Progress
              value={(gameStats.energy / gameStats.maxEnergy) * 100}
              className="h-2"
            />
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Experience</span>
              <span className="text-sm font-medium">
                {gameStats.experience}/1000
              </span>
            </div>
            <Progress
              value={(gameStats.experience / 1000) * 100}
              className="h-2"
            />
          </Card>
        </div>
      </div>
    </header>
  );
}
