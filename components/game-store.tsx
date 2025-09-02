/* eslint-env browser */
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TonPaymentSystem } from '@/components/ton-payment-system';
import { useToast } from '@/hooks/use-toast';

interface GameStoreProps {
  wallet: any;
  tonConnectUI: any;
}

interface PurchasedItem {
  id: string;
  name: string;
  purchaseDate: Date;
  transactionHash: string;
  active: boolean;
}

export function GameStore({ wallet, tonConnectUI }: GameStoreProps) {
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [activeTab, setActiveTab] = useState('premium');
  const { toast } = useToast();

  const handlePaymentSuccess = (item: any, transactionHash: string) => {
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
    console.error('Payment error:', error);
  };

  const applyItemEffects = (item: any) => {
    // This would integrate with your game state management
    switch (item.type) {
      case 'multiplier':
        // Apply mining multiplier
        if (typeof window !== 'undefined') {
          localStorage.setItem(`multiplier_${item.id}`, 'true');
        }
        break;
      case 'subscription':
        // Activate subscription
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (item.duration || 30));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`subscription_${item.id}`, expiryDate.toISOString());
        }
        break;
      case 'energy':
        // Apply energy boost
        if (typeof window !== 'undefined') {
          localStorage.setItem(`energy_boost_${item.id}`, Date.now().toString());
        }
        break;
      case 'weapon':
      case 'skin':
      case 'nft':
        // Unlock item in inventory
        if (typeof window !== 'undefined') {
          localStorage.setItem(`owned_${item.id}`, 'true');
        }
        break;
    }

    toast({
      title: 'Item Activated!',
      description: `${item.name} has been added to your account`,
    });
  };

  // Hydration guard for locale formatting and random/now
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const safeNow = () => (typeof window !== 'undefined' ? Date.now() : 0);
  const safeRandom = () => (typeof window !== 'undefined' ? Math.random() : 0.5);

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
        <h1 className="text-2xl font-bold text-primary mb-2">Guardian's Store</h1>
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
                  <Button size="sm" variant="outline">
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
                        Purchased: {hydrated ? item.purchaseDate.toLocaleDateString() : ''}
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
                  {hydrated ? item.purchaseDate.toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
