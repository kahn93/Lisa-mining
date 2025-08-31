"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ExternalLink, Users, MessageCircle, Heart, Share2 } from "lucide-react"

interface TelegramTask {
  id: string
  title: string
  description: string
  reward: number
  type: "join" | "share" | "invite" | "follow"
  url?: string
  completed: boolean
  icon: React.ReactNode
}

export function TelegramTasks() {
  const [tasks, setTasks] = useState<TelegramTask[]>([
    {
      id: "join-channel",
      title: "Join LISA Official Channel",
      description: "Join our official Telegram channel for updates",
      reward: 1000,
      type: "join",
      url: "https://t.me/guardianangellisa",
      completed: false,
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      id: "join-community",
      title: "Join LISA Community",
      description: "Join our community chat and say hello",
      reward: 500,
      type: "join",
      url: "https://t.me/lisacommunity",
      completed: false,
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "follow-twitter",
      title: "Follow on Twitter",
      description: "Follow @GuardianAngelLISA on Twitter",
      reward: 750,
      type: "follow",
      url: "https://twitter.com/GuardianAngelLISA",
      completed: false,
      icon: <Heart className="h-5 w-5" />,
    },
    {
      id: "share-game",
      title: "Share with 3 Friends",
      description: "Share the game with at least 3 friends",
      reward: 2000,
      type: "share",
      completed: false,
      icon: <Share2 className="h-5 w-5" />,
    },
    {
      id: "invite-friends",
      title: "Invite 5 Friends",
      description: "Invite 5 friends to play the game",
      reward: 5000,
      type: "invite",
      completed: false,
      icon: <Users className="h-5 w-5" />,
    },
  ])

  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalRewards, setTotalRewards] = useState(0)

  useEffect(() => {
    const completed = tasks.filter((task) => task.completed).length
    const rewards = tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.reward, 0)
    setCompletedTasks(completed)
    setTotalRewards(rewards)
  }, [tasks])

  const handleTaskAction = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (task.url && (task.type === "join" || task.type === "follow")) {
      // Open external link
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(task.url)
      } else if (typeof window !== "undefined") {
        window.open(task.url, "_blank")
      }

      // Mark as completed after a delay (simulate verification)
      setTimeout(() => {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)))
      }, 3000)
    } else if (task.type === "share") {
      // Handle sharing
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("🪽 Join me in Guardian Angel LISA! Tap to earn LISA tokens! 🌟")}`
        window.Telegram.WebApp.openLink(shareUrl)
      }

      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)))
    } else if (task.type === "invite") {
      // Handle inviting
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const inviteUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href + "?ref=invite")}&text=${encodeURIComponent("🪽 Guardian Angel LISA needs your help! Join this epic adventure! 💎")}`
        window.Telegram.WebApp.openLink(inviteUrl)
      }

      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t)))
    }
  }

  const claimAllRewards = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(`🎉 Claimed ${totalRewards} LISA tokens from completed tasks!`)
    }
    // Reset rewards counter
    setTotalRewards(0)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-center text-purple-300">Telegram Tasks Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {completedTasks}/{tasks.length}
            </div>
            <Progress value={(completedTasks / tasks.length) * 100} className="h-3 bg-slate-700" />
            <p className="text-slate-300 mt-2">Tasks Completed</p>
          </div>

          {totalRewards > 0 && (
            <div className="text-center">
              <Button
                onClick={claimAllRewards}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                Claim {totalRewards} LISA Tokens
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`transition-all duration-300 ${
              task.completed
                ? "bg-emerald-900/30 border-emerald-500/50"
                : "bg-slate-800/50 border-slate-600/50 hover:border-purple-500/50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      task.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {task.completed ? <CheckCircle className="h-5 w-5" /> : task.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{task.title}</h3>
                    <p className="text-sm text-slate-400">{task.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-emerald-500/20 text-emerald-400">+{task.reward} LISA</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">Completed</Badge>
                  ) : (
                    <Button
                      onClick={() => handleTaskAction(task.id)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {task.type === "join" || task.type === "follow" ? (
                        <>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {task.type === "join" ? "Join" : "Follow"}
                        </>
                      ) : task.type === "share" ? (
                        <>
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-1" />
                          Invite
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
