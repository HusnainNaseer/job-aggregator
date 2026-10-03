# Supabase feature data contract

The frontend expects these tables to exist in Supabase. For an existing
`saved_jobs` table with numeric `job_id`, run
[`supabase/migrations/20261003000000_saved_jobs_snapshot_columns.sql`](./supabase/migrations/20261003000000_saved_jobs_snapshot_columns.sql)
in the Supabase SQL editor to add and backfill the columns needed by the save
and saved-jobs features. The migration preserves the existing `job_id` type.
If `public.applications` does not exist, run
[`supabase/migrations/20261003001000_create_applications.sql`](./supabase/migrations/20261003001000_create_applications.sql)
in the Supabase SQL editor to create it with per-user Row Level Security.
If `public.user_preferences` does not exist, run
[`supabase/migrations/20261003002000_create_user_preferences.sql`](./supabase/migrations/20261003002000_create_user_preferences.sql)
in the Supabase SQL editor to create it with per-user Row Level Security.
Apply RLS and per-user policies to any other tables before enabling those
features in a deployed app.

All `user_id` values are obtained from the active Supabase Auth user. The
frontend never accepts a user ID from a form or URL. Queries include the
authenticated user ID for scoping, while RLS remains the database security
boundary.

## `saved_jobs`

Expected fields:

| Field | Suggested type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | Auth user ID; required |
| `job_id` | `bigint` | Numeric external job ID for the current Dev Global Jobs source; required |
| `source` | `text` | Source key, currently `dev-global-jobs` or `partner` |
| `source_job_id` | `text` | ID assigned by the external source |
| `title` | `text` | Snapshot |
| `organization` | `text` | Snapshot |
| `location` | `text` | Snapshot |
| `country` | `text`, nullable | Snapshot |
| `category` | `text` | Snapshot |
| `skill_category` | `text` | Snapshot |
| `job_type` | `text` | Snapshot |
| `salary` | `text`, nullable | Snapshot |
| `description_excerpt` | `text` | Snapshot |
| `posted_at` | `timestamptz`, nullable | Snapshot |
| `closing_date` | `timestamptz`, nullable | Snapshot |
| `url` | `text` | Original listing URL |
| `saved_at` | `timestamptz` | Default to current time |

Use a unique constraint on (`user_id`, `job_id`) to prevent duplicate saves.

## `applications`

Expected fields:

| Field | Suggested type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | Auth user ID; required |
| `job_id` | `text` | Normalized job ID; required |
| `source` | `text` | Source key |
| `source_job_id` | `text` | ID assigned by the external source |
| `title` | `text` | Job snapshot |
| `organization` | `text` | Job snapshot |
| `location` | `text` | Job snapshot |
| `url` | `text` | Original listing URL |
| `status` | `text` | `Saved`, `Applied`, `Interview`, `Rejected`, or `Offer` |
| `applied_at` | `timestamptz`, nullable | Set on first transition to `Applied` |
| `updated_at` | `timestamptz` | Updated when tracker details change |
| `notes` | `text` | User's private notes |

Use a unique constraint on (`user_id`, `job_id`) so one tracker record represents
each job for a user. The applications migration creates this constraint and
restricts reads and writes to the authenticated user's own rows.

## `user_preferences`

Expected fields:

| Field | Suggested type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | Auth user ID; unique, required |
| `preferred_country` | `text` | Empty string means unset |
| `preferred_city` | `text` | Empty string means unset |
| `preferred_category` | `text` | Empty string means unset |
| `preferred_skill_category` | `text` | Empty string means unset |
| `preferred_job_type` | `text` | Empty string means unset |
| `remote_preference` | `boolean` | Defaults to `false` |

The profile name is stored in Supabase Auth user metadata (`name`); the app does
not require a separate profile table or expose authentication secrets.
The user preferences migration creates this table with one row per user and
restricts reads and writes to the authenticated user's own row.
