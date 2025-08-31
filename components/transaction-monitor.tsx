"use client"

import { useState, useEffect } from "react"
import { useTonWallet } from "@tonconnect/ui-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Transaction {
  hash: string
  amount: string
  timestamp: Date
  status: "pending" | "confirmed" | "failed"
  item?: string
}

export function TransactionMonitor() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const wallet = useTonWallet()

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (wallet && isMonitoring) {
      // In a real implementation, you would:
      // 1. Subscribe to blockchain events
      // 2. Monitor transaction confirmations
      // 3. Update transaction statuses

      const interval = setInterval(() => {
        // Simulate transaction monitoring
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.status === "pending" && Math.random() > 0.7 ? { ...tx, status: "confirmed" as const } : tx,
          ),
        )
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [wallet, isMonitoring])

  const addTransaction = (hash: string, amount: string, item?: string) => {
    const newTransaction: Transaction = {
      hash,
      amount,
      timestamp: new Date(),
      status: "pending",
      item,
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (!wallet) {
    return null
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Transaction Monitor</h3>
        <Button size="sm" variant="outline" onClick={() => setIsMonitoring(!isMonitoring)}>
          {isMonitoring ? "Stop" : "Start"} Monitoring
        </Button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No transactions to monitor</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {transactions.map((tx) => (
            <div key={tx.hash} className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}
                  </span>
                  <Badge variant={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {tx.amount} TON • {tx.timestamp.toLocaleTimeString()}
                  {tx.item && ` • ${tx.item}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
