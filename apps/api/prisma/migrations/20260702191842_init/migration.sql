-- CreateEnum
CREATE TYPE "IslandSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "AbilityType" AS ENUM ('WRITING', 'CODE', 'ANALYSIS', 'TRANSLATION', 'SUMMARIZATION', 'IMAGE_DESCRIPTION', 'MATH', 'DEBATE', 'STORYTELLING', 'MUSIC_DESCRIPTION', 'TUTORING', 'COACHING');

-- CreateEnum
CREATE TYPE "RarityTier" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('DUEL', 'WEEKLY', 'MONTHLY', 'EVENT');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'EVALUATING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ISLAND_PURCHASE', 'CYBEING_MINT', 'MARKETPLACE_SALE', 'RENTAL_PAYMENT', 'TOURNAMENT_ENTRY', 'TOURNAMENT_REWARD', 'FLAG_MINT');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Island" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "coordX" DOUBLE PRECISION NOT NULL,
    "coordY" DOUBLE PRECISION NOT NULL,
    "sizeType" "IslandSize" NOT NULL,
    "shapeData" JSONB NOT NULL,
    "maxCybeings" INTEGER NOT NULL,
    "coverImageUrl" TEXT,
    "coverImageCid" TEXT,
    "flagImageUrl" TEXT,
    "flagImageCid" TEXT,
    "flagTokenId" TEXT,
    "purchasePrice" DECIMAL(65,30) NOT NULL,
    "purchaseTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Island_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlagHistory" (
    "id" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "flagUrl" TEXT NOT NULL,
    "flagCid" TEXT NOT NULL,
    "setAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousOwner" TEXT,

    CONSTRAINT "FlagHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cybeing" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "islandId" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageCid" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "abilityType" "AbilityType" NOT NULL,
    "abilityName" TEXT NOT NULL,
    "abilityConfig" JSONB NOT NULL,
    "personalityTraits" JSONB NOT NULL,
    "lore" TEXT,
    "speechStyle" TEXT,
    "rarityScore" DOUBLE PRECISION NOT NULL,
    "rarityTier" "RarityTier" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xpToNextLevel" INTEGER NOT NULL DEFAULT 100,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "isForRent" BOOLEAN NOT NULL DEFAULT false,
    "rentPriceHour" DECIMAL(65,30),
    "mintTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cybeing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "cybeingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "priceUsdc" DECIMAL(65,30) NOT NULL,
    "rentDurationH" INTEGER,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "buyerId" TEXT,
    "soldAt" TIMESTAMP(3),
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amountUsdc" DECIMAL(65,30) NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abilityType" "AbilityType" NOT NULL,
    "tournamentType" "TournamentType" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'OPEN',
    "challengerId" TEXT,
    "opponentId" TEXT,
    "challenge" TEXT NOT NULL,
    "prizePoolUsdc" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "winnerId" TEXT,
    "result" JSONB,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentEntry" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "cybeingId" TEXT NOT NULL,
    "stakeUsdc" DECIMAL(65,30) NOT NULL,
    "output" TEXT,
    "aiScore" DOUBLE PRECISION,
    "communityVotes" INTEGER NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION,
    "placement" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "cybeingId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "priceUsdc" DECIMAL(65,30) NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT,
    "type" "TransactionType" NOT NULL,
    "amountUsdc" DECIMAL(65,30),
    "txHash" TEXT NOT NULL,
    "blockNumber" BIGINT,
    "status" "TxStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "Island_coordX_coordY_idx" ON "Island"("coordX", "coordY");

-- CreateIndex
CREATE INDEX "Island_ownerId_idx" ON "Island"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Cybeing_tokenId_key" ON "Cybeing"("tokenId");

-- CreateIndex
CREATE INDEX "Cybeing_ownerId_idx" ON "Cybeing"("ownerId");

-- CreateIndex
CREATE INDEX "Cybeing_abilityType_idx" ON "Cybeing"("abilityType");

-- CreateIndex
CREATE INDEX "Cybeing_rarityTier_idx" ON "Cybeing"("rarityTier");

-- CreateIndex
CREATE INDEX "Cybeing_islandId_idx" ON "Cybeing"("islandId");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_cybeingId_idx" ON "Listing"("cybeingId");

-- CreateIndex
CREATE INDEX "Listing_listingType_idx" ON "Listing"("listingType");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "Tournament_abilityType_idx" ON "Tournament"("abilityType");

-- CreateIndex
CREATE INDEX "Rental_cybeingId_idx" ON "Rental"("cybeingId");

-- CreateIndex
CREATE INDEX "Rental_renterId_idx" ON "Rental"("renterId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_fromAddress_idx" ON "Transaction"("fromAddress");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- AddForeignKey
ALTER TABLE "Island" ADD CONSTRAINT "Island_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagHistory" ADD CONSTRAINT "FlagHistory_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "Island"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cybeing" ADD CONSTRAINT "Cybeing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cybeing" ADD CONSTRAINT "Cybeing_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "Island"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cybeingId_fkey" FOREIGN KEY ("cybeingId") REFERENCES "Cybeing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_cybeingId_fkey" FOREIGN KEY ("cybeingId") REFERENCES "Cybeing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_cybeingId_fkey" FOREIGN KEY ("cybeingId") REFERENCES "Cybeing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
