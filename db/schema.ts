import { serial, varchar, pgTable, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table: stores user credentials and basic info.
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(), // hashed password
    created_at: timestamp("created_at").defaultNow()
})

// Jobs table: stores job postings.
export const jobs = pgTable("jobs", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    isOpen: boolean("is_open").default(true),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow()
})

// Applications table: links users to jobs along with application details.
export const applications = pgTable("applications", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    jobId: integer("job_id")
        .notNull()
        .references(() => jobs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    reason: text("reason").notNull(), // why the user applied
    status: varchar("status", { length: 50 }).notNull().default("applied"),
    applied_at: timestamp("applied_at").defaultNow()
})

// Define relationships for drizzle ORM

// A user can have many applications.
export const userRelations = relations(users, ({ many }) => ({
    applications: many(applications)
}))

// A job can have many applications.
export const jobRelations = relations(jobs, ({ many }) => ({
    applications: many(applications)
}))

// An application belongs to one user and one job.
export const applicationRelations = relations(applications, ({ one }) => ({
    user: one(users, {
        fields: [applications.userId],
        references: [users.id]
    }),
    job: one(jobs, {
        fields: [applications.jobId],
        references: [jobs.id]
    })
}))
