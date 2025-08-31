"use client"

import { useState, useCallback } from "react"
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react"
import { toNano, beginCell } from "@ton/core"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface PaymentItem {
  id: string
  name: string
  description: string
  price: number // in TON
  type: "multiplier" | "subscription" | "energy" | "weapon" | "skin" | "nft" | "power"
  icon: string
  benefits: string[]
  duration?: number // for subscriptions (in days)
}

interface TonPaymentSystemProps {
  onPaymentSuccess: (item: PaymentItem, transactionHash: string) => void
  onPaymentError: (error: string) => void
}

export function TonPaymentSystem({ onPaymentSuccess, onPaymentError }: TonPaymentSystemProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null)

  const wallet = useTonWallet()
  const [tonConnectUI] = useTonConnectUI()
  const { toast } = useToast()

  const premiumItems: PaymentItem[] = [
    {
      id: "mining_multiplier_2x",
      name: "2x Mining Multiplier",
      description: "Double your mining rewards permanently",
      price: 0.5,
      type: "multiplier",
      icon: "⚡",
      benefits: ["2x mining rewards", "Permanent upgrade", "Stacks with other bonuses"],
    },
    {
      id: "auto_mining_pro",
      name: "Auto Mining Pro",
      description: "Premium auto-mining with 100% efficiency",
      price: 1.0,
      type: "subscription",
      icon: "🤖",
      benefits: ["100% offline efficiency", "No time limit", "Priority support"],
      duration: 30,
    },
    {
      id: "energy_refill_pack",
      name: "Energy Refill Pack",
      description: "Instant full energy + 50% max energy boost",
      price: 0.2,
      type: "energy",
      icon: "🔋",
      benefits: ["Instant full energy", "+50% max energy for 24h", "Faster regeneration"],
    },
    {
      id: "divine_sword_legendary",
      name: "Divine Sword of Light",
      description: "Legendary weapon for Guardian Angel Lisa",
      price: 2.0,
      type: "weapon",
      icon: "⚔️",
      benefits: ["+50% attack power", "Holy damage bonus", "Unique visual effects"],
    },
    {
      id: "celestial_wings_skin",
      name: "Celestial Wings Skin",
      description: "Exclusive cosmetic skin for Lisa",
      price: 1.5,
      type: "skin",
      icon: "👼",
      benefits: ["Unique appearance", "Particle effects", "Exclusive to TON holders"],
    },
    {
      id: "guardian_angel_nft",
      name: "Guardian Angel NFT",
      description: "Limited edition NFT with special powers",
      price: 5.0,
      type: "nft",
      icon: "🎨",
      benefits: ["Tradeable NFT", "+100% all rewards", "VIP status", "Exclusive content"],
    },
  ]

  const createPaymentTransaction = useCallback(
    async (item: PaymentItem) => {
      if (!wallet) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your TON wallet to make purchases",
          variant: "destructive",
        })
        return
      }

      setIsProcessing(true)
      setTransactionStatus("pending")

      try {
        // Create payment transaction
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
          messages: [
            {
              address: "EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t", // Game treasury address
              amount: toNano(item.price).toString(),
              payload: beginCell()
                .storeUint(0, 32) // op code
                .storeStringTail(`purchase:${item.id}:${Date.now()}`)
                .endCell()
                .toBoc()
                .toString("base64"),
            },
          ],
        }

        // Send transaction
        const result = await tonConnectUI.sendTransaction(transaction)
        setCurrentTransaction(result.boc)

        // Simulate transaction confirmation (in real app, you'd verify on-chain)
        setTimeout(() => {
          setTransactionStatus("success")
          setIsProcessing(false)
          onPaymentSuccess(item, result.boc)

          toast({
            title: "Payment Successful!",
            description: `You've successfully purchased ${item.name}`,
          })
        }, 3000)
      } catch (error: any) {
        setTransactionStatus("error")
        setIsProcessing(false)
        const errorMessage = error.message || "Transaction failed"
        onPaymentError(errorMessage)

        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    },
    [wallet, tonConnectUI, onPaymentSuccess, onPaymentError, toast],
  )

  const resetTransaction = () => {
    setTransactionStatus("idle")
    setCurrentTransaction(null)
    setIsProcessing(false)
  }

  if (transactionStatus === "pending") {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
          <h3 className="text-lg font-semibold">Processing Payment</h3>
          <p className="text-sm text-muted-foreground">Please confirm the transaction in your TON wallet</p>
          <Progress value={66} className="w-full" />
          <Button variant="outline" onClick={resetTransaction}>
            Cancel
          </Button>
        </div>
      </Card>
    )
  }

  if (transactionStatus === "success") {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
            ✅
          </div>
          <h3 className="text-lg font-semibold text-green-500">Payment Successful!</h3>
          <p className="text-sm text-muted-foreground">Your purchase has been confirmed on the TON blockchain</p>
          <Button onClick={resetTransaction} className="glow-effect">
            Continue Shopping
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Premium Store</h2>
        <p className="text-sm text-muted-foreground">Purchase premium items with TON cryptocurrency</p>
        {wallet && (
          <Badge variant="outline" className="mt-2">
            Connected: {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {premiumItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
                {item.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.price} TON</Badge>
                    {item.duration && <Badge variant="outline">{item.duration} days</Badge>}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

                <div className="space-y-1 mb-3">
                  {item.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="text-green-500">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => createPaymentTransaction(item)}
                  disabled={!wallet || isProcessing}
                  className="w-full glow-effect"
                >
                  {!wallet ? "Connect Wallet" : `Purchase for ${item.price} TON`}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!wallet && (
        <Card className="p-4 text-center bg-muted/10">
          <p className="text-sm text-muted-foreground mb-3">Connect your TON wallet to purchase premium items</p>
          <Button variant="outline" onClick={() => tonConnectUI.openModal()}>
            Connect TON Wallet
          </Button>
        </Card>
      )}
    </div>
  )
}
