import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';
import {relations, sql} from 'drizzle-orm';
import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {z} from 'zod';

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

export const clientInsertSchema = createInsertSchema(clients).omit({
  clientId: true,
  userId: true,
  updatedAt: true,
  createdAt: true,
});

export const clientUpdateSchema = createSelectSchema(clients).omit({
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

export const clientSelectSchema = createSelectSchema(clients).extend({
  transactions: z.array(createSelectSchema(transactions)).optional(),
});

export const transactionInsertSchema = createInsertSchema(transactions)
  .omit({
    transactionId: true,
    clientId: true,
    updatedAt: true,
    createdAt: true,
  })
  .extend({
    clientId: z.number(),
  });

export const transactionUpdateSchema = createSelectSchema(transactions).omit({
  clientId: true,
  updatedAt: true,
  createdAt: true,
});

export const transactionDeleteSchema = createSelectSchema(transactions).pick({
  transactionId: true,
});

export const clientsRelations = relations(clients, ({one, many}) => ({
  user: one(users, {
    // Many clients → one user
    fields: [clients.userId],
    references: [users.userId],
  }),
  transactions: many(transactions), // One client → many transactions
}));

// Transactions relations
export const transactionsRelations = relations(transactions, ({one}) => ({
  client: one(clients, {
    // Many transactions → one client
    fields: [transactions.clientId],
    references: [clients.clientId],
  }),
}));
