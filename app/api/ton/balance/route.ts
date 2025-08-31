import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${process.env.TON_CENTER_API_URL}/getAddressBalance?address=${address}&api_key=${process.env.TON_CENTER_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`TON Center API error: ${response.status}`)
    }

    const data = await response.json()

    const balanceInTon = data.result ? (Number.parseInt(data.result) / 1000000000).toFixed(4) : "0"

    return NextResponse.json({
      balance: balanceInTon,
      address: address,
    })
  } catch (error) {
    console.error("Error fetching TON balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log(`[v0] Fetching balance for address: ${address}`)
    console.log(`[v0] Payments will be sent to: ${process.env.TON_RECEIVING_WALLET}`)

    const response = await fetch(
      `${process.env.TON_CENTER_API_URL}/getAddressBalance?address=${address}&api_key=${process.env.TON_CENTER_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`TON Center API error: ${response.status}`)
    }

    const data = await response.json()

    const balanceInTon = data.result ? (Number.parseInt(data.result) / 1000000000).toFixed(4) : "0"

    return NextResponse.json({
      balance: balanceInTon,
      address: address,
    })
  } catch (error) {
    console.error("Error fetching TON balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
