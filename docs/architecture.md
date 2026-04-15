# Property Management Application — Architecture Reference

> Last updated: 2026-04-11

---

## 1. Project Overview

An internal property management platform for managing a personal real estate portfolio.
Covers tenant management, charge creation, contractor coordination, late fee automation, and tenant payment collection.

**Frontend is fully scaffolded with stub data.** Backend (Spring Boot) is not yet built.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript + React 18 + Vite |
| Backend | Java 21 + Spring Boot 3 (not yet built) |
| Database | PostgreSQL 16 |
| ORM | Spring Data JPA + Hibernate |
| DB Migrations | Flyway |
| Auth | Spring Security + JWT (access + refresh tokens) |
| Payments | Stripe (PaymentIntents + Webhooks) |
| Scheduling | Spring `@Scheduled` (late fee cron) |
| State Management | Zustand (persisted to `propmanager-auth` in localStorage) |
| Data Fetching | TanStack Query v5 |
| Styling | Tailwind CSS (no shadcn/ui — pure Tailwind) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Local Dev DB | Docker Compose (Postgres + pgAdmin) |

**Intentionally excluded (future phases):**
- File storage (lease PDFs, inspection photos)
- Background checks
- E-signatures
- Email notifications (stubbed, not wired)

---

## 3. Account Hierarchy

```
Super Admin
  └── Property Owner
        ├── Properties
        │     └── Units
        ├── Tenants  (linked to Units via Tenancy)
        └── Contractors (scoped to specific Properties)
```

### Roles
| Role | Description |
|---|---|
| `SUPER ADMIN` | Full access; can impersonate any account |
| `OWNER` | Manages their own properties, tenants, contractors, finances |
| `TENANT` | Views their charges and pays them; payment history |
| `CONTRACTOR` | Access to assigned work orders on scoped properties (future) |

---

## 4. Authentication

### Strategy
- Spring Security with stateless JWT
- **Access token**: 15-minute expiry
- **Refresh token**: 7-day expiry, stored in HttpOnly cookie
- Roles enforced via `@PreAuthorize` annotations on controllers

### Endpoints
```
POST /api/auth/login           → { accessToken, refreshToken }
POST /api/auth/refresh         → { accessToken }
POST /api/auth/logout          → invalidate refresh token
POST /api/admin/impersonate/{userId}  → short-lived impersonation token (SUPER ADMIN only)
```

### Impersonation
- Super Admin only
- Issues a separate short-lived token carrying both the original actor ID and target user ID
- Frontend shows a persistent **ImpersonationBanner** (yellow bar) while active
- Clicking "Exit Impersonation" calls `stopImpersonating()` and navigates back to `/admin`
- All actions taken during impersonation are audit-logged with `actorId` = Super Admin's ID

### Invite Flow (Tenant)
- Owner invites tenant via the "+ Invite Tenant" modal on the Tenants page
- Owner selects property and vacant unit at invite time
- A `Tenancy` record is created immediately, linking tenant → unit
- Unit is marked occupied
- `RegistrationStatus` lifecycle: `INVITED` → `PENDING` → `REGISTERED`
- Invite email would contain a time-limited signed token (72hr expiry) — not yet wired

---

## 5. Database Schema

### Core Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| role | ENUM | SUPER ADMIN, OWNER, TENANT, CONTRACTOR |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### `owners`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| company_name | VARCHAR | optional |
| phone | VARCHAR | |
| stripe_customer_id | VARCHAR | |

#### `properties`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| owner_id | UUID FK → owners | |
| name | VARCHAR | |
| address_line1 | VARCHAR | |
| address_line2 | VARCHAR | nullable |
| city | VARCHAR | |
| state | VARCHAR | |
| zip | VARCHAR | |
| created_at | TIMESTAMP | |

#### `units`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK → properties | |
| unit_number | VARCHAR | e.g. "1A", "101" |
| bedrooms | INT | |
| bathrooms | DECIMAL | |
| rent_amount | DECIMAL(10,2) | base/market rent for the unit |
| is_occupied | BOOLEAN | maintained on tenancy create/end |

> `rent_amount` on `units` is the unit's market rate. The contracted rent for a specific tenancy is stored separately in `tenancies.monthly_rent`.

#### `tenants`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| owner_id | UUID FK → owners | scoped to this owner |
| phone | VARCHAR | |
| stripe_customer_id | VARCHAR | for payment methods |
| registration_status | ENUM | INVITED, PENDING, REGISTERED |
| invited_at | TIMESTAMP | |

#### `tenancies`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK → tenants | |
| unit_id | UUID FK → units | |
| start_date | DATE | |
| end_date | DATE | nullable = current; set on move-out |
| monthly_rent | DECIMAL(10,2) | contracted rent, locked at signing |
| status | ENUM | ACTIVE, ENDED, EVICTED |
| lease_type | ENUM | FIXED, MONTH TO MONTH |

> Tenancies are never deleted — end-dated on move-out. Full history preserved.

#### `contractors`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| owner_id | UUID FK → owners | |
| company_name | VARCHAR | |
| trade | VARCHAR | e.g. "Plumbing", "HVAC" |
| phone | VARCHAR | |

#### `contractor_properties`
| Column | Type | Notes |
|---|---|---|
| contractor_id | UUID FK | |
| property_id | UUID FK | |
| PRIMARY KEY | (contractor_id, property_id) | |

#### `charges`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenancy_id | UUID FK → tenancies | |
| charge_type | ENUM | RENT, LATE FEE, UTILITY, DAMAGE, OTHER |
| description | VARCHAR | |
| amount | DECIMAL(10,2) | |
| due_date | DATE | |
| status | ENUM | PENDING, PAID, WAIVED, DISPUTED |
| parent_charge_id | UUID FK → charges | nullable; links late fee to original |
| stripe_invoice_id | VARCHAR | nullable |
| created_at | TIMESTAMP | |

> Charges are linked to a **tenancy**, not directly to a unit or tenant. The tenant responsible is derived from the active tenancy for that unit.

#### `payments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| charge_id | UUID FK → charges | |
| amount_paid | DECIMAL(10,2) | supports partial payments |
| paid_at | TIMESTAMP | |
| stripe_payment_intent_id | VARCHAR | nullable |
| method | ENUM | ACH, CARD, MANUAL |

#### `late_fee_rules`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| property_id | UUID FK → properties | per-property config |
| grace_period_days | INT | days after due_date before fee fires |
| fee_type | ENUM | FLAT, PERCENTAGE |
| flat_amount | DECIMAL(10,2) | used when FLAT |
| percentage | DECIMAL(5,2) | used when PERCENTAGE |
| max_fee_amount | DECIMAL(10,2) | cap; required by many jurisdictions |

#### `audit_logs`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| actor_id | UUID FK → users | who performed the action |
| impersonating_user_id | UUID | nullable; set during impersonation |
| action | VARCHAR | e.g. "CHARGE_CREATED", "TENANT_LINKED" |
| entity_type | VARCHAR | e.g. "Charge", "Tenancy" |
| entity_id | UUID | |
| metadata | JSONB | extra context |
| created_at | TIMESTAMP | |

---

## 6. Backend Package Structure

```
com.yourapp/
├── config/          SecurityConfig, JwtConfig, StripeConfig
├── controller/      REST controllers per domain
├── service/         Business logic
├── repository/      Spring Data JPA interfaces
├── model/           JPA entities + enums
├── dto/
│   ├── request/     Inbound DTOs (validated with @Valid)
│   └── response/    Outbound DTOs (mapped via MapStruct)
├── security/        JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
├── scheduler/       LateFeeScheduler (@Scheduled)
├── exception/       GlobalExceptionHandler, custom exceptions
└── util/            SecurityUtils (get current user from context)
```

---

## 7. Late Fee Logic

### Scheduler
- Runs daily at 8:00 AM via `@Scheduled(cron = "0 0 8 * * *")`
- Queries: all `PENDING` charges of type `RENT` where `due_date + grace_period_days < today`
- Skips charges that already have a `LATE FEE` child charge
- Looks up `LateFeeRule` for the charge's property
- Inserts a new `Charge` row:
  - `charge_type = LATE FEE`
  - `parent_charge_id` = original rent charge
  - `amount` = flat OR (percentage × overdue amount), capped at `max_fee_amount`
  - `due_date` = today
  - `status = PENDING`

### Manual Charges (Owner-created)
- Owner clicks "+ Add Charge" on a specific occupied unit in Property Detail
- Charge types: `RENT`, `UTILITY`, `DAMAGE`, `OTHER` (not `LATE FEE` — those are system-generated)
- Charge is linked to the unit's active `Tenancy`
- Visible immediately in the tenant portal and owner charge views

---

## 8. Stripe Integration

### Flows
| Trigger | Stripe Action |
|---|---|
| Tenant pays a charge | Create `PaymentIntent` → frontend confirms via Stripe.js |
| Additional charge added | Create `InvoiceItem` + `Invoice`, send to tenant |
| Late fee added | Attach to next invoice or standalone invoice |
| `payment_intent.succeeded` webhook | Mark charge(s) `PAID`, insert `Payment` record |
| `payment_intent.payment_failed` webhook | Notify tenant (future), keep charge `PENDING` |

### Payment Methods
- **ACH bank transfer** — preferred for rent (~0.8% fee)
- **Card** — available for one-off charges
- **Manual** — cash/check recorded by owner

### Webhook Security
- Stripe-Signature header verified with `Stripe.constructEvent()`
- Idempotency: check if `stripe_payment_intent_id` already recorded before inserting

---

## 9. Frontend Structure

```
src/
├── components/
│   ├── ui/          Button, Card, Badge, Table, Modal, StatCard
│   └── layout/      AppLayout, Sidebar, Navbar, ImpersonationBanner
├── data/
│   └── stubs.ts     All stub data; merged with runtime dataStore in useOwnerData
├── hooks/
│   └── useOwnerData.ts  Merges stubs + dataStore, filters by owner/role
├── pages/
│   ├── auth/        Login (stub account picker)
│   ├── dashboard/   OwnerDashboard, TenantDashboard, AdminDashboard
│   ├── properties/  PropertiesList, PropertyDetail
│   ├── tenants/     TenantsList, TenantDetail
│   ├── contractors/ ContractorsList
│   ├── charges/     ChargesList
│   ├── payments/    PaymentsList
│   └── tenant/      MyCharges (tenant-only)
├── router/
│   ├── index.tsx    Route definitions + role guards
│   └── PrivateRoute.tsx
├── store/
│   ├── authStore.ts    Zustand auth (persisted to localStorage)
│   └── dataStore.ts    Zustand runtime data (in-memory, not persisted)
└── types/
    └── index.ts     All shared TypeScript types
```

### Role-Based Routing
| Role | Route | Page |
|---|---|---|
| `SUPER ADMIN` | `/admin` | Admin Panel (all accounts, impersonation) |
| `OWNER` | `/dashboard` | Owner Dashboard |
| `OWNER` | `/properties`, `/properties/:id` | Properties + Unit management |
| `OWNER` | `/tenants`, `/tenants/:id` | Tenant management |
| `OWNER` | `/contractors` | Contractor list |
| `OWNER` | `/charges` | All charges |
| `OWNER` | `/payments` | All payments |
| `TENANT` | `/my-dashboard` | Balance, outstanding charges, pay button |
| `TENANT` | `/payment-history` | My Charges / payment history |

### Key Frontend Behaviors

**Stub data + runtime store merge:**  
`useOwnerData` hook merges `src/data/stubs.ts` with runtime-added records from `dataStore`. Filters results by the effective user's owner ID (or shows all for SUPER ADMIN).

**Charge status overrides:**  
When a tenant pays a charge in the frontend, `chargeStatusOverrides` in `dataStore` marks it `PAID` in-memory. This is reflected everywhere charges appear (dashboard, owner views, tenant views).

**Owner Dashboard:**
- 8 stat cards: Properties, Total Units, Occupied, Tenants, Pending Charges, Overdue, Expiring (90d), Month-to-Month
- Bar chart: payments collected over last 12 months (recharts)
- Half-pie chart: paid vs outstanding for current month, collection % in center
- Recent Charges table: clicking a row navigates to that tenant's page
- Properties overview cards with occupancy bar and monthly revenue

**Property Detail:**
- Unit table shows Monthly Rent from the active tenancy (not from the unit itself)
- "+ Add Charge" button appears per occupied unit → modal with type, description, amount, due date
- Charge is linked to the unit's active tenancy

**Tenant Dashboard (`/my-dashboard`):**
- Total balance due banner (red if owed, green if clear)
- Outstanding charges list with a "Pay" button per charge
- Clicking Pay opens a modal: shows charge details, method selector (ACH/Card/Manual), Confirm button
- On confirm: payment recorded, charge marked PAID, balance updates immediately
- Recent Payments list (last 10)
- No tenancy info block (removed)

**Invite Tenant Modal:**
- Fields: First Name, Last Name, Email, Phone
- Optional: Property dropdown → filters to vacant units for that property → Monthly Rent field
- On submit with a unit: creates Tenant + Tenancy + marks unit occupied

---

## 10. Runtime Data Store (`dataStore.ts`)

Zustand in-memory store (not persisted). Resets on full page reload.

| Field | Type | Purpose |
|---|---|---|
| `addedProperties` | `Property[]` | Owner-added properties |
| `addedTenants` | `Tenant[]` | Invited tenants |
| `addedUnits` | `Unit[]` | Owner-added units |
| `addedTenancies` | `Tenancy[]` | Created when tenant is linked to a unit |
| `addedCharges` | `Charge[]` | Owner-created charges via Property Detail |
| `addedPayments` | `Payment[]` | Tenant payments made in session |
| `unitOccupancyOverrides` | `Record<string, boolean>` | Marks units occupied when linked to a tenant |
| `chargeStatusOverrides` | `Record<string, ChargeStatus>` | Marks charges PAID when tenant pays |

---

## 11. Stub Data (`src/data/stubs.ts`)

Used for frontend development before the backend is built.

**Stub accounts (login page picker):**
| Account | Role |
|---|---|
| Admin User | SUPER ADMIN |
| James Miller | OWNER (owner1) — Maplewood Apartments + Riverside Condos |
| Sarah Chen | OWNER (owner2) — Chen Flats |
| Marcus Johnson | TENANT (tenant1) — paid up |
| Priya Patel | TENANT (tenant2) — has outstanding rent + late fee |
| Carlos Rivera | TENANT (tenant3) — owner2's tenant |
| Bob Smith | CONTRACTOR |

**Historical data:** 10 months of rent charges + payments (May 2025 – Feb 2026) generated per tenancy for bar chart.

---

## 12. Suggested Build Order (Backend)

1. Docker Compose + Flyway migrations (schema first)
2. Auth (login, JWT, refresh, role guards)
3. Owner → Property → Unit CRUD
4. Tenant invite flow + registration status
5. Tenancy creation (links tenant to unit)
6. Charge creation (owner creates charges per unit/tenancy)
7. Stripe payment flow (PaymentIntent + webhooks) — tenant pays charges
8. Late fee scheduler (rule config + cron)
9. Contractor accounts + property scoping
10. Super Admin impersonation + audit logging
11. Admin dashboard APIs

---

## 13. Local Development

```bash
# Start Postgres + pgAdmin
docker-compose up -d

# Backend (not yet built)
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm install
node ./node_modules/.bin/vite   # use direct path — npm not always in PATH
```

**Dev server:** http://localhost:5173

### pgAdmin
- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

### Default Super Admin (seeded)
- Email: admin@internal.com
- Password: changeme (force-reset on first login)

---

## 14. Compliance Notes

- **Late fee caps**: Many states limit late fees (e.g., 5% of monthly rent, or $50 flat). The `max_fee_amount` field in `LateFeeRule` must be set per state law.
- **Security deposits**: Tracked separately from rent. Many states require deposits held in a separate account and returned within a specific window. (Future phase.)
- **Data retention**: Tenant records and payment history should be retained for a minimum of 7 years after tenancy ends for legal/tax purposes.
- **PCI compliance**: Raw card data is never stored. All card handling delegated to Stripe.js on the frontend and Stripe's servers.
- **NACHA / ACH**: Stripe manages ACH compliance including micro-deposit verification UX.
