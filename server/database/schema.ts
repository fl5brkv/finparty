import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';

export const users = sqliteTable('users', {
  userId: integer('user_id').primaryKey({autoIncrement: true}),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  provider: text('provider').notNull(),
  providerUserId: text('provider_user_id').notNull(),
  updatedAt: integer('updated_at', {mode: 'timestamp'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const clients = sqliteTable('clients', {
  clientId: integer('client_id').primaryKey({autoIncrement: true}),
  userId: integer('user_id')
    .references(() => users.userId, {onDelete: 'cascade'})
    .notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  dateOfBirth: integer('date_of_birth', {mode: 'timestamp'}),
  updatedAt: integer('updated_at', {mode: 'timestamp'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const finfetties = sqliteTable('finfetties', {
  finfettiId: integer('finfetti_id').primaryKey({autoIncrement: true}),
  clientId: integer('client_id')
    .references(() => clients.clientId, {onDelete: 'cascade'})
    .notNull(),
  amount: integer('amount').notNull(),
  type: text('type', {
    enum: ['deposit', 'withdrawal'],
  }).notNull(),
  description: text('description'),
  updatedAt: integer('updated_at', {mode: 'timestamp'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'timestamp'})
    .default(sql`(unixepoch())`)
    .notNull(),
});
