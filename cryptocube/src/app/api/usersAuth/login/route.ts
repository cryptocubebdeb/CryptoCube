import { PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server"
import bcrypt from "bcryptjs";


const prisma = new PrismaClient()

/*export async function POST(req: Request) {
  const body = await req.json()

  const result = await prisma.utilisateur.create({
    data: {
      email: body.email,
      motDePasse: body.motDePasse,
      nom: body.nom,
      prenom: body.prenom,
      username: body.username,
    },
  })

  if (!result)
    return Response.json({
      message: "error",
      status: 500,
    })

  return Response.json({ message: "ok", status: 200, data: result })
}*/

export async function POST( req: NextRequest ) {
  const { email, motDePasse } = await req.json()

  const user = await prisma.utilisateur.findFirst({
    where: { email },
  })

  if (!user) {
    return new Response(JSON.stringify({ message: "Aucun utilisateur correspond a ce courriel"}), {
        status: 404, 
        headers: { "Content-Type": "application/json" },
    })
  } 

  console.log("User found:", user)
console.log("DB password:", user?.motDePasse)
  const rightPassword = await bcrypt.compare (motDePasse, user.motDePasse)
  if (!rightPassword) {
    return new Response(JSON.stringify({ message: "Mot de passe invalide"}), {
        status: 404, 
        headers: { "Content-Type": "application/json" },
    })
  }
  
  return Response.json({ message: "Connexion réussi!", user })
}

