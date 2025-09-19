import { PrismaClient } from "@prisma/client"
import { NextRequest } from "next/server"

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
    where: { email, motDePasse },
  })

  if (!user) {
    return new Response(JSON.stringify({ message: "Aucun utilisateur correspond a ce courriel"}), {
        status: 404, 
        headers: { "Content-Type": "application/json" },
    })
  } 
  
  return Response.json({ ssage: "Connexion réussi!", user })
}

