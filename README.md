# UGS Unified Healthcare Platform

A comprehensive healthcare platform connecting doctors, pharmacies, patients, and pharmaceutical companies.

## Overview

The UGS Unified Healthcare Platform provides the following core services:

- Certified e-prescriptions
- Real-time pharmacy inventory
- Ordering & local delivery
- Appointment booking
- Doctor-pharma communications
- Payments
- Analytics

## Project Structure

```
├── backend/                # Backend services
│   ├── api/                # API endpoints
│   ├── auth/               # Authentication services
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── frontend/              
│   ├── admin/              # Admin console
│   ├── doctor-portal/      # Doctor web portal
│   ├── pharmacy-portal/    # Pharmacy web portal
│   ├── hospital-portal/    # Hospital/Clinic web portal
│   └── pharma-portal/      # Pharmaceutical company portal
├── mobile/
│   ├── patient-app/        # Patient mobile app (Android/iOS)
│   └── doctor-app/         # Doctor mobile app (Android/iOS)
└── shared/                 # Shared components and utilities
    ├── components/         # UI components
    ├── constants/          # Constants and enums
    ├── types/              # TypeScript types/interfaces
    └── utils/              # Shared utility functions
```

## Features

### Authentication & Onboarding
- Email/phone OTP login for all roles
- OAuth option for enterprises
- Role-based access control (RBAC)
- KYC and license verification

### e-Prescription (eRx)
- Create, edit, and digitally sign prescriptions
- Drug interaction and allergy alerts
- QR code + unique eRx ID

### Pharmacy Inventory & Order Fulfillment
- Real-time stock sync
- Order allocation to nearest pharmacy
- Pick/Pack/Dispatch workflow

### Patient Ordering & Subscriptions
- Place orders from eRx
- Monthly refill subscriptions
- Order tracking

### Appointments
- Doctor schedule management
- Patient booking with payment options
- Reminders and waitlist management

### Doctor-Pharma Communications
- Compliant communication platform
- Audit logs and content moderation

### Payments & Invoicing
- Multiple payment methods
- GST-compliant invoices
- Wallet/credits for refunds and promotions
- Promo codes and memberships

### Analytics & Reporting
- Role-specific dashboards (doctor prescription trends, pharmacy fill rates/expiry risk, hospital utilization, patient adherence)
- Export CSV/PDF; scheduled email reports
- KPI alerts (SLA breaches, stockouts)
- Pharma insights from anonymized aggregates with privacy budget controls

### Admin & Compliance
- User management, role policies, feature flags
- Regulatory artifacts (licenses, audits), takedown requests, incident response
- Content moderation, dispute resolution, refunds, chargebacks
- Data retention policies, right-to-erasure (subject to medical record laws)

## Non-Functional Requirements

### Security
- OAuth2/OIDC, TLS 1.2+, HSTS
- AES-256 encryption at rest
- Field-level encryption for PHI

### Privacy
- Consent logging
- Data minimization
- Audit trails
- Breach notification policy

### Performance
- p95 API latency < 300 ms for core reads
- Order placement < 2 s

### Availability
- 99.9% monthly for core APIs
- RPO ≤ 15 min, RTO ≤ 60 min

### Scalability
- Horizontal auto-scaling for stateless services
- Read replicas for database

### Observability
- Structured logs
- APM traces
- Metrics
- Alerting SLOs

### Accessibility
- WCAG 2.1 AA for web
- Large-text modes on mobile

### Localization
- Multi-language strings
- Currency/units by locale

### Compatibility
- Android 8.0+
- iOS 14+
- Modern evergreen browsers

## System Architecture

- API Gateway → Auth Service → Domain Microservices (eRx, Inventory, Orders, Appointments, Payments, Messaging, Analytics)
- Datastores: PostgreSQL (OLTP), Redis (cache/queues), S3-compatible object store (files/eRx PDFs)
- Event bus (e.g., Kafka) for async workflows: order allocation, notifications, analytics sinks
- CDC/ETL to analytics warehouse (e.g., BigQuery/Snowflake) for BI dashboards

## Data Model (High-level)

- User(id, role, phone, email, status, created_at)
- Doctor(id, user_id, license_no, specialty, clinic_id, kyc_status)
- Pharmacy(id, name, license_no, gstin, geo, service_radius_km, status)
- Product(id, gtin, brand, generic_name, strength, form, hsn, rx_required)
- Inventory(id, pharmacy_id, product_id, batch_no, expiry, mrp, price, qty)
- eRx(id, doctor_id, patient_id, pdf_url, status, signed_at, version, hash)
- eRxItem(id, erx_id, product_id/generic, dosage, frequency, duration, substitutions_allowed)
- Order(id, patient_id, erx_id, pharmacy_id, status, amount, payment_id, timeline)
- Appointment(id, doctor_id, patient_id, type, slot_at, status, payment_id)
- PharmaMessage(id, company_id, audience_spec, content_ref, sent_at)
- AuditLog(id, actor_id, action, resource, before, after, at)

## API Overview

- Auth: /auth/otp, /auth/token, /users/me
- Doctors: /doctors, /erx, /erx/{id}, /erx/{id}/sign
- Pharmacies: /pharmacies, /inventory, /orders, /orders/{id}/status
- Patients: /patients, /orders, /subscriptions, /appointments
- Appointments: /doctors/{id}/slots, /appointments/{id}
- Pharma: /pharma/messages, /pharma/audience
- Admin: /admin/users, /admin/audit, /admin/reports

## Integrations

- Identity & License verification (e.g., DigiLocker/registry API)
- Payments (UPI/cards) via PSP gateway; webhooks for success/failure
- SMS/WhatsApp/email providers for notifications
- Optional POS/ERP connectors for pharmacy stock sync (CSV/API)

## Key Workflows

### eRx → Order → Delivery
1. Doctor creates and signs eRx
2. Patient receives eRx token and places an order
3. System allocates nearest in-stock pharmacy; pharmacy picks/packs
4. Dispatch with OTP; delivery confirmed; invoice issued

### Appointment & Telemedicine → eRx
1. Patient books slot, pays via UPI, receives reminders
2. Doctor consults (in-clinic or tele) and issues eRx
3. Patient optionally converts eRx to order

### Pharma → Doctor Campaign
1. Pharma uploads content; selects audience (specialty/location)
2. Compliance review; send with audit trail
3. Doctors view and interact; analytics aggregated

## Privacy, Security, Compliance

- Consent capture and revocation; purpose limitation; DPIA before launch
- Encryption at rest (AES-256) and in transit (TLS 1.2+)
- PHI segregation and row-level RBAC; least-privilege service accounts
- Regular VA/PT, SOC2-aligned controls; logging & anomaly detection
- Data retention: eRx ≥ statutory minimum; backups encrypted with key rotation

## Deployment & DevOps

- Containers (Docker) orchestrated by Kubernetes; IaC via Terraform
- Environments: dev, staging, prod with separate credentials and data
- Blue/green or canary releases; feature flags; rollbacks
- CI/CD with unit/integration/e2e tests and security scans

## Monitoring & Alerting

- APM traces for every request; dashboards for latency, error rate, saturation
- Business KPIs: order fill rate, delivery SLA, eRx sign success, payment success
- On-call runbooks; incident severity matrix; post-mortems

## Testing Strategy & Acceptance

- Unit tests ≥ 80% critical services; contract tests between services
- Test data factories; sandbox for payment and license verification
- Security tests: SAST, DAST, dependency scanning
- UAT scripts per persona; acceptance criteria per epic; performance baselines

## Release Plan

- P1: Auth & RBAC; Doctor eRx; Pharmacy inventory; Patient ordering
- P2: Payments; Appointments; Notifications; Delivery workflow
- P3: Analytics; Pharma communications; Subscriptions
- P4: AI recommendations; Stock forecasting; Enterprise SSO

## Risks & Mitigations

- Regulatory approvals: engage early with councils; maintain auditability
- Adoption by pharmacies: incentives, zero-cost onboarding, POS connectors
- Data breaches: defense-in-depth, red-team exercises, insurance
- Counterfeit risk: verified suppliers, batch/expiry scans, recall process

## Getting Started

*Instructions for setting up the development environment will be added soon.*

## License

Proprietary - UGS © 2025