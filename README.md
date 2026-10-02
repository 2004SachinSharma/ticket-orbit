<div align="center">

# 🎫 Ticket Orbit

**Support ticket and complaint management platform with role-based access, SLA escalation, event-driven notifications and real-time updates.**

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

</div>

> **Status:** 🚧 In active development. **Day 1 is complete** (project skeleton, PostgreSQL in Docker, Flyway schema). Everything marked *planned* below is not built yet.

## 📖 About

Ticket Orbit is built for small businesses, colleges, coaching institutes and internal support teams.

```text
Customer creates ticket → Admin assigns to Agent → Agent works and replies
   → SLA clock tracks the deadline → warning / breach escalates automatically
   → Agent resolves → Customer confirms → every action is audited
```

It is a **modular monolith** (not microservices), built in small tested slices.

## 🎯 Engineering Highlights (target)

| Area | What it will demonstrate | Status |
|---|---|---|
| Security | JWT authentication, RBAC (customer / agent / admin), ownership checks | Planned |
| Database | PostgreSQL schema versioned with Flyway, indexed queries, optimistic locking | **Schema done** |
| Workflow | Ticket state machine with validated transitions | Planned |
| Redis | Rate limiting and dashboard caching | Planned |
| Kafka | Async ticket events, idempotent consumers, dead-letter topics | Planned |
| WebSocket | Real-time notification push (STOMP) | Planned |
| SLA | Scheduled warning and breach escalation, fired exactly once | Planned |
| Audit | Append-only audit trail of every ticket change | Planned |
| Delivery | Docker Compose, GitHub Actions CI, deployment on AWS EC2 | Partly (Compose) |

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Language / build | Java 21, Maven |
| Backend | Spring Boot 4.1.1, Spring Web MVC, Spring Security, Spring Data JPA, Bean Validation |
| Database | PostgreSQL 18+, Flyway |
| Cache / limits | Redis (planned) |
| Messaging | Apache Kafka, KRaft mode (planned) |
| Real-time | Spring WebSocket + STOMP (planned) |
| Auth | JWT, BCrypt (planned) |
| API docs | springdoc-openapi / Swagger UI (planned) |
| Frontend | React 18 + Vite (planned) |
| Testing | JUnit 5, Mockito, `@WebMvcTest`, Testcontainers (planned) |
| Infra | Docker, Docker Compose, Nginx, GitHub Actions, AWS EC2 |

Redis, Kafka and WebSocket starters are already in `pom.xml` but are **not used yet**.

## ✅ What Works Today

- Spring Boot application skeleton (`com.ticketorbit`)
- PostgreSQL through Docker Compose, with a healthcheck
- Environment-based configuration (`.env`, nothing secret in Git)
- Flyway migration `V1__initial_schema.sql`: 8 tables, foreign keys, CHECK constraints, 7 indexes, seeded categories and SLA rules
- Hibernate set to `validate`, so Flyway owns the schema

## 🚀 Getting Started

### Prerequisites

- JDK 21
- Docker Desktop (running)
- Maven (or the wrapper)

### 1. Clone

```bash
git clone https://github.com/<your-username>/ticket-orbit.git
cd ticket-orbit
```

### 2. Create `.env`

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_NAME` | PostgreSQL database name |
| `DATABASE_USERNAME` | PostgreSQL user |
| `DATABASE_PASSWORD` | PostgreSQL password |
| `DEFAULT_SECURITY_PASSWORD` | Temporary Spring Security password (removed after JWT) |

`.env` is git-ignored. Never commit real credentials.

### 3. Create the Docker volume (one time)

```bash
docker volume create postgres-data
```

### 4. Start PostgreSQL

```bash
docker compose up -d
docker compose ps        # wait for "healthy"
```

PostgreSQL listens on `localhost:5433`.

### 5. Run the application

```bash
./mvnw spring-boot:run
```

API: `http://localhost:8081`. Flyway applies `V1` on startup.

### 6. Verify

```bash
docker exec -it my-postgres psql -U <DATABASE_USERNAME> -d <DATABASE_NAME> -c "\dt"
```

Expected: `audit_logs`, `categories`, `flyway_schema_history`, `notifications`, `processed_events`, `sla_rules`, `ticket_messages`, `tickets`, `users`.

## 🗺 Roadmap

**Phase 1: Foundation (Days 1–10)**
- [x] Project skeleton (Java 21, Spring Boot 4.1.1, Maven)
- [x] PostgreSQL via Docker Compose
- [x] Environment-based configuration
- [x] Flyway V1 schema and seed data
- [ ] User entity, registration, login
- [ ] JWT authentication and RBAC
- [ ] React login / register

**Phase 2: Ticket core (Days 11–30)**
- [ ] Ticket creation, replies, internal notes
- [ ] Assignment, state machine, search / filter / pagination
- [ ] Matching React pages
- [ ] Deploy skeleton to AWS EC2

**Phase 3: Hardening (Days 31–42)**
- [ ] Validation and global error format
- [ ] Unit and slice tests, GitHub Actions CI

**Phase 4: Redis (Days 43–52)**
- [ ] Rate limiting
- [ ] Dashboard cache

**Phase 5: Kafka and real-time (Days 53–68)**
- [ ] Producers and consumers, idempotency, dead-letter topics
- [ ] Notifications and WebSocket push

**Phase 6: SLA and audit (Days 69–78)**
- [ ] SLA scheduler with warning and breach
- [ ] Audit log, API and UI tab

**Phase 7: Polish (Days 79–90)**
- [ ] Swagger, seed data, diagrams, final README

## 📚 Documentation

Full technical documentation is in [docs.md](docs.md): architecture, data model, ticket lifecycle, planned API, security, Redis, Kafka, WebSocket, SLA, testing, deployment, configuration, troubleshooting and the development log.

## 📄 License

MIT. See [LICENSE](LICENSE).
