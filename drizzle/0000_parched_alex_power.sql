CREATE TABLE `scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`score` integer,
	`created_at` integer DEFAULT (unixepoch())
);
