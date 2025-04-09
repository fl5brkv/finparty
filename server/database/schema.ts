import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
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
  product: text('product', {
    enum: [
      'pinata_insurance',
      'confetti_investment',
      'cake_loan',
      'balloon_bond',
    ],
  }).notNull(),
  amount: integer('amount').notNull(),
  status: text('status', {
    enum: ['pending', 'approved', 'completed', 'cancelled'],
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

// product:
// Piñata Insurance 🪅
// Protects against piñata-related accidents, from wild swings to candy chaos!

// Confetti Investment 🎉
// A volatile investment that can explode with rewards, showering you in profits when the timing’s right!

// Cake Loan 🍰
// A loan with manageable payments, like enjoying a slice of cake one bite at a time.

// Balloon Bond 🎈
// A fixed-term investment that rises steadily over time, with a burst of returns when it reaches its peak!

// status
// Pending – Waiting for approval or action.
// Approved – Successfully reviewed and confirmed.
// Completed – Fully processed and finalized.
// Cancelled – Manually stopped before completion.
