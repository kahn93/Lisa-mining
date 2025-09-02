import { type NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface PlayerAirdropData {
  username: string;
  walletAddress: string;
  totalPoints: number;
  allocationPercentage: number;
  lastUpdated: number;
}

interface AirdropAllocation {
  totalPlayers: number;
  totalPoints: number;
  allocations: PlayerAirdropData[];
  lastCalculated: number;
}

const AIRDROP_FILE_PATH = path.join(process.cwd(), 'data', 'airdrop-allocations.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load existing airdrop data
async function loadAirdropData(): Promise<AirdropAllocation> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(AIRDROP_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      totalPlayers: 0,
      totalPoints: 0,
      allocations: [],
      lastCalculated: 0,
    };
  }
}

// Save airdrop data
async function saveAirdropData(data: AirdropAllocation) {
  await ensureDataDirectory();
  await fs.writeFile(AIRDROP_FILE_PATH, JSON.stringify(data, null, 2));
}

// Calculate allocation percentages
function calculateAllocations(allocations: PlayerAirdropData[]): PlayerAirdropData[] {
  const totalPoints = allocations.reduce((sum, player) => sum + player.totalPoints, 0);

  if (totalPoints === 0) {
    return allocations.map((player) => ({
      ...player,
      allocationPercentage: 0,
    }));
  }

  return allocations.map((player) => ({
    ...player,
    allocationPercentage: (player.totalPoints / totalPoints) * 100,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const { playerData } = await request.json();

    if (!playerData || !playerData.walletAddress) {
      return NextResponse.json({ error: 'Invalid player data' }, { status: 400 });
    }

    // Load existing data
    const airdropData = await loadAirdropData();

    // Find existing player or add new one
    const existingPlayerIndex = airdropData.allocations.findIndex(
      (p) => p.walletAddress === playerData.walletAddress,
    );

    if (existingPlayerIndex >= 0) {
      // Update existing player
      airdropData.allocations[existingPlayerIndex] = {
        ...playerData,
        lastUpdated: Date.now(),
      };
    } else {
      // Add new player
      airdropData.allocations.push({
        ...playerData,
        lastUpdated: Date.now(),
      });
    }

    // Recalculate allocations
    airdropData.allocations = calculateAllocations(airdropData.allocations);
    airdropData.totalPlayers = airdropData.allocations.length;
    airdropData.totalPoints = airdropData.allocations.reduce((sum, p) => sum + p.totalPoints, 0);
    airdropData.lastCalculated = Date.now();

    // Ensure total percentage never exceeds 100%
    const totalPercentage = airdropData.allocations.reduce(
      (sum, p) => sum + p.allocationPercentage,
      0,
    );
    if (totalPercentage > 100) {
      // Normalize to 100%
      airdropData.allocations = airdropData.allocations.map((player) => ({
        ...player,
        allocationPercentage: (player.allocationPercentage / totalPercentage) * 100,
      }));
    }

    // Save updated data
    await saveAirdropData(airdropData);

    return NextResponse.json(airdropData);
  } catch (error) {
    console.error('Airdrop calculation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const airdropData = await loadAirdropData();
    return NextResponse.json(airdropData);
  } catch (error) {
    console.error('Failed to load airdrop data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
