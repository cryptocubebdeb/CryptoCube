-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "userId" INTEGER NOT NULL,
    "resetToken" VARCHAR(255) NOT NULL,
    "tokenValidFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenValidUntil" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '1 hour',

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;
