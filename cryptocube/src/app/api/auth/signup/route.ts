import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma'; 
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
    
    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }
    
    // Validation username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur doit contenir entre 3 et 20 caractères" },
        { status: 400 }
      );
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores" },
        { status: 400 }
      );
    }
    
    // Validation mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial" },
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
    const existingEmail = await prisma.utilisateur.findUnique({ 
      where: { email: email }
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: "Cette adresse email est déjà utilisée" },
        { status: 409 }
      );
    }
    
    const existingUsername = await prisma.utilisateur.findUnique({ 
      where: { username: username }
    });
    
    if (existingUsername) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
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