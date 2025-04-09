import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';
import {relations, sql} from 'drizzle-orm';
import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {z} from 'zod';

export const users = sqliteTable('users', {
  userId: integer('user_id').primaryKey({autoIncrement: true}),
  email: text('email').unique(),
  name: text('name').notNull(),
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
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
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

export const clientSelectSchema = createSelectSchema(clients).omit({
  userId: true,
  updatedAt: true,
  createdAt: true,
});

export const clientInsertSchema = createInsertSchema(clients).omit({
  clientId: true,
  userId: true,
  updatedAt: true,
  createdAt: true,
});

export const clientUpdateSchema = createInsertSchema(clients).omit({
  userId: true,
  updatedAt: true,
  createdAt: true,
});

export const clientDeleteSchema = createSelectSchema(clients).pick({
  clientId: true,
});

export const transactions = sqliteTable('transactions', {
  transactionId: integer('transaction_id').primaryKey({autoIncrement: true}),
  clientId: integer('client_id')
    .references(() => clients.clientId, {onDelete: 'cascade'})
    .notNull(),
  item: text('item', {
    enum: ['balloon', 'popper', 'confetti', 'present'],
  }).notNull(),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
  type: text('type', {
    enum: ['loan', 'purchase', 'gift', 'burn', 'airdrop'],
  }).notNull(),
  updatedAt: integer('updated_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
  createdAt: integer('created_at', {mode: 'number'})
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const transactionSelectSchema = createSelectSchema(transactions)
  .omit({
    updatedAt: true,
    createdAt: true,
  })
  .extend({
    email: z.string(),
  });

export const transactionInsertSchema = createInsertSchema(transactions).omit({
  transactionId: true,
  updatedAt: true,
  createdAt: true,
});

export const transactionUpdateSchema = createInsertSchema(transactions).omit({
  updatedAt: true,
  createdAt: true,
});

export const transactionDeleteSchema = createSelectSchema(transactions).pick({
  transactionId: true,
});
