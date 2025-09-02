
'use client';
/* eslint-env browser */

import React from 'react';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Gift, Star } from 'lucide-react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        setHeaderColor(arg0: string): unknown;
        setBackgroundColor(arg0: string): unknown;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
          start_param?: string;
        };
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        openLink: (url: string) => void;
        shareToStory: (mediaUrl: string, params?: Record<string, unknown>) => void;
        openTelegramLink: (url: string) => void;
      };
    };
  }
}

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

const telegramConfig = {
  botToken: typeof window !== 'undefined' && typeof (window as { __NEXT_PUBLIC_TELEGRAM_BOT_TOKEN?: string }).__NEXT_PUBLIC_TELEGRAM_BOT_TOKEN !== 'undefined' ? (window as { __NEXT_PUBLIC_TELEGRAM_BOT_TOKEN: string }).__NEXT_PUBLIC_TELEGRAM_BOT_TOKEN : '',
  botUsername: typeof window !== 'undefined' && '__NEXT_PUBLIC_TELEGRAM_BOT_USERNAME' in window ? (window as unknown as { __NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?: string }).__NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'LisaToken_Bot' : 'LisaToken_Bot',
  botUrl: typeof window !== 'undefined' && '__NEXT_PUBLIC_TELEGRAM_BOT_URL' in window ? (window as { __NEXT_PUBLIC_TELEGRAM_BOT_URL?: string }).__NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/LisaToken_Bot' : 'https://t.me/LisaToken_Bot',
};

export function TelegramIntegration() {
  const [hydrated, setHydrated] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Initialize Telegram WebApp
      tg.ready();
      tg.expand();
      setIsReady(true);

      // Get user data
      if (tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        setTelegramUser({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: user.photo_url,
        });
      }

      // Apply Telegram theme
      if (tg.themeParams) {
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
          document.documentElement.style.setProperty('--tg-text-color', tg.themeParams.text_color);
          document.documentElement.style.setProperty(
            '--tg-button-color',
            tg.themeParams.button_color,
          );
        }
      }
    }
  }, []);

  const shareGame = () => {
    const shareText = `🌟 Join me in Guardian Angel LISA! Help Lisa save lost souls and earn LISA tokens! 💎`;
    const shareUrl = `${telegramConfig.botUrl}?start=${telegramUser?.id || 'invite'}`;

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      );
    }
  };

  const inviteFriends = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const inviteUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href + '?ref=' + telegramUser?.id)}&text=${encodeURIComponent('🪽 Guardian Angel LISA needs your help! Join me in this epic tap-to-earn adventure and get bonus rewards! 💎')}`;
      window.Telegram.WebApp.openLink(inviteUrl);
    }
  };

  if (!hydrated || !isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {telegramUser && (
        <Card className="bg-slate-800/50 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <Users className="h-5 w-5" />
              Welcome, {telegramUser.firstName}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {telegramUser.photoUrl && (
                <img
                  src={telegramUser.photoUrl || '/placeholder.svg'}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-emerald-400/50"
                />
              )}
              <div>
                <p className="text-white font-medium">
                  {telegramUser.firstName} {telegramUser.lastName}
                </p>
                {telegramUser.username && (
                  <p className="text-slate-400 text-sm">@{telegramUser.username}</p>
                )}
                <Badge variant="secondary" className="mt-1 bg-emerald-500/20 text-emerald-400">
                  Guardian Angel
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={shareGame}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Game
        </Button>

        <Button
          onClick={inviteFriends}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Gift className="h-4 w-4 mr-2" />
          Invite Friends
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Star className="h-5 w-5" />
            Telegram Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">WebApp Integration</span>
            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">User Authentication</span>
            <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Theme Sync</span>
            <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Sharing Features</span>
            <Badge className="bg-green-500/20 text-green-400">Available</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
