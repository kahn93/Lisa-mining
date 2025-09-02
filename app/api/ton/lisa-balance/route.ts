import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const tonCenterApiKey = process.env.TON_CENTER_API_KEY;
    const jettonMasterAddress = process.env.JETTON_MASTER_ADDRESS;

    if (!tonCenterApiKey || !jettonMasterAddress) {
      return NextResponse.json({ error: 'API configuration missing' }, { status: 500 });
    }

    // Get LISA token balance for the wallet
    const response = await fetch(
      `https://toncenter.com/api/v2/getTokenData?address=${jettonMasterAddress}&api_key=${tonCenterApiKey}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch LISA token data');
    }

    const tokenData = await response.json();

    // Get wallet's LISA token balance
    const balanceResponse = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}&api_key=${tonCenterApiKey}`,
    );

    const balanceData = await balanceResponse.json();

    return NextResponse.json({
      success: true,
      jettonMasterAddress,
      tokenData: tokenData.result,
      walletBalance: balanceData.result,
      lisaBalance: '0', // This would need proper jetton balance calculation
    });
  } catch (error) {
    console.error('Error fetching LISA token balance:', error);
    return NextResponse.json({ error: 'Failed to fetch LISA token balance' }, { status: 500 });
  }
}
