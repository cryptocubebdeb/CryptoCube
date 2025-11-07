import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAuthenticatedUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}


export async function GET() {
  const userId = await getAuthenticatedUserId();
  //pour verifier si l'utilisateur est authentifié
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: { userId },
      select: { coinId: true }
    });
    
    const coinIds = watchlistItems.map(item => item.coinId);
    return NextResponse.json({ success: true, coinIds });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { coinId } = body;
  if (!coinId) return NextResponse.json({ error: 'coinId required' }, { status: 400 });

  try {

    // Ajouter le coin à la watchlist avec upsert (create or ignore si existe déjà)
    await prisma.watchlistItem.upsert({
      where: {
        userId_coinId: {
          userId,
          coinId
        }
      },
      update: {}, // Ne rien faire si existe déjà
      create: {
        userId,
        coinId
      }
    });

    return NextResponse.json({ success: true, message: 'Coin added to watchlist' });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { coinId } = body;
  if (!coinId) return NextResponse.json({ error: 'coinId required' }, { status: 400 });

  try {

    // Supprimer l'item de la watchlist
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        coinId
      }
    });

    return NextResponse.json({ success: true, message: 'Coin removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
