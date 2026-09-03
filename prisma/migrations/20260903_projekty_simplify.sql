-- Vlna 6 modulu Projekty (spec MODUL_PROJEKTY_ZJEDNODUSENI_SPEC.md §9).
-- Spouštět přes `npm run db:projekty-migrate` (NE přes prisma migrate).

-- D21: cover karty nemá UI a jde proti řídké kartě. Odstranit.
ALTER TABLE `projekty_card` DROP COLUMN `cover`;

-- D9: jedna odpovědná osoba + sledující. UI přijde ve vlně 7.
ALTER TABLE `projekty_card_member`
  ADD COLUMN `role` ENUM('OWNER', 'FOLLOWER') NOT NULL DEFAULT 'FOLLOWER';

-- Backfill: nejstarší přiřazení na kartě = OWNER. Jen pro karty bez OWNERa —
-- neběží nad kartami, které už OWNER mají — chrání ruční změny z vlny 7.
UPDATE `projekty_card_member` `m`
JOIN (
  SELECT `cardId`, MIN(`assignedAt`) AS `firstAt`
  FROM `projekty_card_member`
  GROUP BY `cardId`
  HAVING SUM(`role` = 'OWNER') = 0
) `f` ON `f`.`cardId` = `m`.`cardId` AND `f`.`firstAt` = `m`.`assignedAt`
SET `m`.`role` = 'OWNER';

-- Když má víc členů stejný assignedAt (backfill z vlny 5A nastavil createdAt karty
-- všem), zůstane OWNER jen ten s nejnižším userId.
UPDATE `projekty_card_member` `m`
JOIN (
  SELECT `cardId`, MIN(`userId`) AS `firstUser`
  FROM `projekty_card_member`
  WHERE `role` = 'OWNER'
  GROUP BY `cardId`
  HAVING COUNT(*) > 1
) `d` ON `d`.`cardId` = `m`.`cardId`
SET `m`.`role` = IF(`m`.`userId` = `d`.`firstUser`, 'OWNER', 'FOLLOWER');
