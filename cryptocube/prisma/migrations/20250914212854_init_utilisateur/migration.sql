-- CreateTable
CREATE TABLE "public"."utilisateur" (
    "id_utilisateur" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "username" VARCHAR(50) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "public"."utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_username_key" ON "public"."utilisateur"("username");
