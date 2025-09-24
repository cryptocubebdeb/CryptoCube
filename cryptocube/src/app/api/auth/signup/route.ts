import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SignupData = {
  nom: string;
  prenom: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: SignupData = await request.json();
    
    const { nom, prenom, email, username, password, confirmPassword } = body;
    
    // Validation côté serveur
    if (!nom || !prenom || !email || !username || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }
    
    // Vérifier si l'email ou le username existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "L'email ou le nom d'utilisateur existe déjà" },
        { status: 409 }
      );
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Créer l'utilisateur en base de données
    const newUser = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        username,
        motDePasse: hashedPassword,
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        username: true,
      }
    });
    
    return NextResponse.json(
      { 
        message: "Utilisateur créé avec succès", 
        user: newUser 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}