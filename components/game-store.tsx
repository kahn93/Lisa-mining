/* eslint-env browser */
'use client';

import React from 'react';
import { TonPaymentSystem } from '@/components/ton-payment-system';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface GameStoreProps {
  wallet: { address: string; balance: number; };
  tonConnectUI: unknown;
  gameStats: {
    coins: number;
    energy: number;
    maxEnergy: number;
    miningPower: number;
  };
  onGameStatsUpdate: (updates: Partial<GameStoreProps['gameStats']>) => void;
}

interface PurchasedItem {
  id: string;
  name: string;
  purchaseDate: Date;
  transactionHash: string;
  active: boolean;
}

interface Item {
  id: string;
  name: string;
  type: 'multiplier' | 'subscription' | 'energy' | 'weapon' | 'skin' | 'nft' | 'power';
  duration?: number;
}

export function GameStore({ wallet, tonConnectUI, gameStats, onGameStatsUpdate }: GameStoreProps) {
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [activeTab, setActiveTab] = useState('premium');
  const { toast } = useToast();

  // Use wallet and tonConnectUI for future integrations
  globalThis.console.log(wallet, tonConnectUI);

  const handlePaymentSuccess = (item: Item, transactionHash: string) => {
    const purchasedItem: PurchasedItem = {
      id: item.id,
      name: item.name,
      purchaseDate: new Date(),
      transactionHash,
      active: true,
    };

    setPurchasedItems((prev) => [...prev, purchasedItem]);

    // Apply item effects to game (this would integrate with your game state)
    applyItemEffects(item);
  };

  const handlePaymentError = (error: string) => {
    globalThis.console.error('Payment error:', error);
  };

  const buyItem = (item: typeof inGameItems[0]) => {
    if (gameStats.coins < item.price) {
      toast({
        title: 'Insufficient Coins',
        description: `You need ${item.price} coins to purchase ${item.name}`,
        variant: 'destructive',
      });
      return;
    }

    // Deduct coins
    onGameStatsUpdate({ coins: gameStats.coins - item.price });

    // Apply item effects
    switch (item.id) {
      case 'health_potion':
        // This would heal in RPG mode - for now just show message
        toast({
          title: 'Health Potion Used!',
          description: 'Restored 50 HP (RPG mode only)',
        });
        break;
      case 'mana_potion':
        toast({
          title: 'Mana Potion Used!',
          description: 'Restored 30 MP (RPG mode only)',
        });
        break;
      case 'experience_boost':
        // Apply temporary XP boost
        onGameStatsUpdate({ miningPower: gameStats.miningPower * 2 });
        setTimeout(() => {
          onGameStatsUpdate({ miningPower: gameStats.miningPower / 2 });
        }, 3600000); // 1 hour
        toast({
          title: 'Experience Boost Activated!',
          description: '2x mining power for 1 hour',
        });
        break;
      case 'lucky_charm':
        // This would increase critical hit chance - for now just show message
        toast({
          title: 'Lucky Charm Activated!',
          description: 'Critical hit chance increased by 20%',
        });
        break;
        const applyItemEffects = (item: Item) => {
          // Apply item effects to game state
          switch (item.type) {
            case 'multiplier':
              // Apply mining multiplier (temporary boost)
              onGameStatsUpdate({ miningPower: gameStats.miningPower * 2 });
              // Reset after duration (simplified - in real app use setTimeout)
              globalThis.setTimeout(() => {
                onGameStatsUpdate({ miningPower: gameStats.miningPower });
              }, 3600000); // 1 hour
              break;
            case 'energy':
              // Apply energy boost
              onGameStatsUpdate({ energy: gameStats.maxEnergy });
              break;
            case 'power':
              // Permanent mining power increase
              onGameStatsUpdate({ miningPower: gameStats.miningPower + 1 });
              break;
            default:
              // For other items, just log for now
              globalThis.console.log('Item effect applied:', item.type);
          }

          toast({
            title: 'Item Activated!',
            description: `${item.name} has been applied to your game`,
          });
        };

        const inGameItems = [
          {
            id: 'health_potion',
            name: 'Health Potion',
            description: 'Restore 50 HP instantly',
            price: 100,
            currency: 'coins',
            icon: '🧪',
          },
          {
            id: 'mana_potion',
            name: 'Mana Potion',
            description: 'Restore 30 MP instantly',
            price: 80,
            currency: 'coins',
            icon: '💙',
          },
          {
            id: 'experience_boost',
            name: 'Experience Boost',
            description: '2x EXP for 1 hour',
            price: 500,
            currency: 'coins',
            icon: '⭐',
          },
          {
            id: 'lucky_charm',
            name: 'Lucky Charm',
            description: 'Increase critical hit chance by 20%',
            price: 1000,
            currency: 'coins',
            icon: '🍀',
          },
        ];

        return (
          <div className="space-y-6 pb-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary mb-2">Guardian&apos;s Store</h1>
              <p className="text-sm text-muted-foreground">
                Enhance your journey with premium items and upgrades
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="premium">Premium (TON)</TabsTrigger>
                <TabsTrigger value="ingame">In-Game Store</TabsTrigger>
                <TabsTrigger value="owned">My Items</TabsTrigger>
              </TabsList>

              <TabsContent value="premium" className="space-y-4">
                <TonPaymentSystem
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </TabsContent>

              <TabsContent value="ingame" className="space-y-4">
                <div className="grid gap-4">
                  {inGameItems.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-2xl">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="secondary">
                              {item.price} {item.currency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => buyItem(item)}>
                          Buy
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="owned" className="space-y-4">
                {purchasedItems.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="font-semibold mb-2">No Items Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Purchase premium items to see them here
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {purchasedItems.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              Purchased: {item.purchaseDate.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              TX: {item.transactionHash.slice(0, 10)}...
                            </p>
                          </div>
                          <Badge variant={item.active ? 'default' : 'secondary'}>
                            {item.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Transaction History */}
            {purchasedItems.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Recent Transactions</h3>
                <div className="space-y-2">
                  {purchasedItems.slice(-3).map((item) => (
                    <div key={item.transactionHash} className="flex justify-between items-center text-sm">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.purchaseDate.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );
    };
