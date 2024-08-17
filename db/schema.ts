import { User } from '@supabase/supabase-js';
import { boolean, integer, json, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  authData: jsonb('authData').notNull(),
  supaAdmin: boolean('supaAdmin').default(false),
  picture: text('picture'),
  verified: boolean('verified').default(false),
  provider: text('provider').notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
