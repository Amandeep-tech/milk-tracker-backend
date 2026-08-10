# 🥛 Milk Tracker (Personal Project)

A **single-user personal tracking system** built to automate daily milk entries, track monthly consumption & payments, and practice real-world backend + frontend engineering.

This project focuses on **architecture, automation, and security trade-offs** rather than feature bloat.

---

## 🔑 Key Highlights (Recruiter-Friendly)

* Automated **daily data creation** using GitHub Actions (cron)
* Cost-optimized backend by migrating from AWS RDS → Supabase (PostgreSQL)
* Idempotent backend jobs (safe retries, no duplicates)
* Layered backend security **without full authentication**
* Clean REST APIs with proper HTTP semantics

---

## 🏗 Tech Stack

* **Frontend**: Next.js (App Router)
* **Backend**: Node.js + Express
* **Database**: Supabase (PostgreSQL)
* **Automation**: GitHub Actions (cron jobs)
* **Hosting**:

  * Frontend: Vercel
  * Backend: Render (free tier, sleeping service)

---

## 🤖 Automation (Cron Job)

* GitHub Action runs **daily at 10 AM IST**
* Wakes sleeping backend via `/health` endpoint
* Triggers protected internal endpoint to auto-create milk entry
* Fully idempotent (checks if entry already exists)

**Why GitHub Actions?**

* Render free tier sleeps on inactivity
* GitHub Actions reliably triggers backend without direct DB access

---

## 🔐 Security Design (Intentional & Layered)

This is a **single-user app**, so full login/signup was intentionally skipped.

Instead, security is enforced as:

* **Backend PIN-based authorization** (validated via middleware)
* **CORS restriction** (only frontend origin allowed)
* **Rate limiting** on API routes

> Demonstrates secure system design without unnecessary auth complexity.

---

## 🧩 Data Modeling (Core Tables)

* `milk_entries` – daily quantity & rate
* `payments` – month-wise payment tracking
* `milk_defaults` – default rate, quantity & auto-entry toggle

---

## 🎯 Design Decisions (Interview Focus)

* Skipped full auth because the app is single-user
* Used DB-driven flags to control cron behavior
* Chose GitHub Actions over in-app cron due to sleeping backend
* Separated internal automation routes from public APIs

---

## 🚀 What This Project Demonstrates

* Real-world backend problem solving
* Automation reliability
* Cost-aware architecture
* Security-first thinking
* Clean, maintainable code structure

---

📌 **Note**: Authentication can be added easily if the app becomes multi-user.

---

Built as a personal learning project with a strong focus on **engineering fundamentals**.

## Ignore from here.
