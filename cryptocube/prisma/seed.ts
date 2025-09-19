import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs"

//Code source: https://blog.sethcorker.com/question/how-do-you-seed-a-database-with-prisma/
const prisma = new PrismaClient()

/*So basically here its gonna check if this user already exist in the db, 
  if it does, its gonna do the update which does nothing,`
  else if it doesnt exist its gonna create it */
async function main() {
  const hashedPassword = await bcrypt.hash("Password123!",10)

  const alice = await prisma.utilisateur.upsert({
    where: { email: "alice@outlook.com" }, 
    update: {},
    create: {
      email: "alice@outlook.com",
      motDePasse: hashedPassword,
      nom: "leblanc",
      prenom: "alice",
      username: "aliceleblanc05"
    }
  })

  const john = await prisma.utilisateur.upsert({
    where: { email: "johndoe@outlook.com" }, 
    update: {},
    create: {
      email: "johndoe@outlook.com",
      motDePasse: hashedPassword,
      nom: "Doe",
      prenom: "John",
      username: "johndoe03"
    }
  })

  const jane = await prisma.utilisateur.upsert({
    where: { email: "janedoe@outlook.com" }, 
    update: {},
    create: {
      email: "janedoe@outlook.com",
      motDePasse: hashedPassword,
      nom: "Doe",
      prenom: "Jane",
      username: "janedoe06"
    }
  }) 
  console.log('[SEED] Successfully created users ', { alice, john, jane })
} 

main ()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) =>{
    console.error('[SEED] Failed to create user records', e)
    await prisma.$disconnect()
    process.exit(1)
  })

/*function seedUsers() {
      Promise.all(USERS.map((u) => prisma.utilisateur.create({
            data: {
              email: u.email,
              motDePasse: u.motDePasse, 
              nom: u.nom,
              prenom: u.prenom,
              username: u.username,
            },
          })
        )
      )
    .then(() => console.info('[SEED] Successfully created user records'))
    .catch((e) => console.error('[SEED] Failed to create user records', e))
}

seedUsers()*/ 


