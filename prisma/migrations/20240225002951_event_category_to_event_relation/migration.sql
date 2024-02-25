-- CreateTable
CREATE TABLE "EventCategoryRelation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventCategoryId" TEXT NOT NULL,

    CONSTRAINT "EventCategoryRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventCategoryRelation" ADD CONSTRAINT "EventCategoryRelation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategoryRelation" ADD CONSTRAINT "EventCategoryRelation_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
