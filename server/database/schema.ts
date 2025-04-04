import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';

export const users = sqliteTable('users', {
  userId: integer('user_id').primaryKey({autoIncrement: true}),
  email: text('email').unique(),
  name: text('name').notNull(),
  // provider: text('provider').notNull(),
  // providerUserId: text('provider_user_id').notNull(),
  updatedAt: integer('updated_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'number'})
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
  updatedAt: integer('updated_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const transactions = sqliteTable('transactions', {
  transactionId: integer('transaction_id').primaryKey({autoIncrement: true}),
  clientId: integer('client_id')
    .references(() => clients.clientId, {onDelete: 'cascade'})
    .notNull(),
  item: text('item', {
    enum: ['balloon', 'popper', 'confetti', 'present', 'sparkler'],
  }).notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
  type: text('type', {
    enum: ['loan', 'purchase'],
  }).notNull(),
  updatedAt: integer('updated_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .notNull(),
});
