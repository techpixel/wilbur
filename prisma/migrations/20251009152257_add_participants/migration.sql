-- CreateTable
CREATE TABLE "Participant" (
    "participantId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "ysws" TEXT NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("participantId")
);
