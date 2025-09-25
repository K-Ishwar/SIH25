# Civic Issue Reporting System - Database Schema

This document outlines the initial database schema for the project. We will use PostgreSQL with the PostGIS extension for handling geospatial data.

---

## Table: `users`

Stores information about all users, including citizens and municipal staff.

| Column          | Data Type     | Constraints                     | Description                                      |
|-----------------|---------------|---------------------------------|--------------------------------------------------|
| `id`            | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the user.                  |
| `full_name`     | `VARCHAR(255)`| `NOT NULL`                      | User's full name.                                |
| `email`         | `VARCHAR(255)`| `UNIQUE`, `NOT NULL`            | User's email address, used for login.            |
| `password_hash` | `VARCHAR(255)`| `NOT NULL`                      | Hashed password for authentication.              |
| `role`          | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'citizen'` | User's role (e.g., 'citizen', 'admin', 'staff'). |
| `created_at`    | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of when the user was created.          |
| `updated_at`    | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of the last update to the user record. |

---

## Table: `departments`

Stores information about municipal departments.

| Column       | Data Type     | Constraints                     | Description                                         |
|--------------|---------------|---------------------------------|-----------------------------------------------------|
| `id`         | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the department.               |
| `name`       | `VARCHAR(255)`| `UNIQUE`, `NOT NULL`            | Name of the department (e.g., "Public Works").      |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of when the department was created.       |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of the last update to the department.     |

---

## Table: `reports`

Stores the details of each civic issue report submitted by citizens.

| Column                   | Data Type             | Constraints                     | Description                                                           |
|--------------------------|-----------------------|---------------------------------|-----------------------------------------------------------------------|
| `id`                     | `UUID`                | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the report.                                     |
| `user_id`                | `UUID`                | `NOT NULL`, `REFERENCES users(id)` | The user who submitted the report.                                    |
| `title`                  | `VARCHAR(255)`        | `NOT NULL`                      | A brief title for the issue.                                          |
| `description`            | `TEXT`                |                                 | A detailed description of the issue.                                  |
| `location`               | `GEOGRAPHY(Point, 4326)` | `NOT NULL`                      | The geographic location (lat/long) of the issue.                      |
| `photo_url`              | `VARCHAR(255)`        |                                 | URL of the uploaded photo stored in Cloudinary.                       |
| `voice_note_url`         | `VARCHAR(255)`        |                                 | URL of the uploaded voice note stored in Cloudinary.                  |
| `status`                 | `VARCHAR(50)`         | `NOT NULL`, `DEFAULT 'submitted'`| Current status of the report (e.g., 'submitted', 'resolved').         |
| `priority`               | `VARCHAR(50)`         | `DEFAULT 'medium'`              | Priority level of the report (e.g., 'low', 'medium', 'high').         |
| `assigned_department_id` | `UUID`                | `REFERENCES departments(id)`    | The department assigned to resolve the issue.                         |
| `created_at`             | `TIMESTAMPTZ`         | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of when the report was submitted.                           |
| `updated_at`             | `TIMESTAMPTZ`         | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of the last update to the report.                           |

---

## Table: `report_updates`

Stores a historical log of all changes and comments related to a report.

| Column          | Data Type     | Constraints                     | Description                                          |
|-----------------|---------------|---------------------------------|------------------------------------------------------|
| `id`            | `UUID`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the update entry.              |
| `report_id`     | `UUID`        | `NOT NULL`, `REFERENCES reports(id)` | The report that this update belongs to.              |
| `user_id`       | `UUID`        | `NOT NULL`, `REFERENCES users(id)` | The user (staff or admin) who made the update.       |
| `status_change` | `VARCHAR(50)` |                                 | The new status of the report (if changed).           |
| `comment`       | `TEXT`        |                                 | A comment associated with the update.                |
| `created_at`    | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()`     | Timestamp of when the update was made.               |