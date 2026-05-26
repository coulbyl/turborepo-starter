# Identis

**Plateforme de vérification d'identité et de validation de dossiers pour l'Afrique francophone.**

Identis permet à toute organisation — fintech, IMF, agence immobilière — de vérifier une identité en quelques secondes (CNI + selfie), scorer automatiquement le risque selon ses propres règles, et valider les dossiers via un workflow multi-étapes configurable. Le tout en conformité BCEAO et ARDP.

---

## Ce que fait Identis

| Module | Description |
|---|---|
| **Vérification d'identité** | CNI + selfie via Smile ID — Basic KYC, Document Verification, AML screening |
| **Rule Engine** | Règles de scoring configurables (0–100), templates par secteur (IMF, Immo, Fintech) |
| **Form Builder** | Formulaire sur mesure par workspace — champs texte, upload, consentement ARDP |
| **Workflow Engine** | Pipeline de validation multi-étapes, rôles, délais, escalade automatique |
| **Self-service candidat** | Lien unique envoyé par WhatsApp — le candidat se vérifie depuis son téléphone |
| **Audit trail** | Chaque action horodatée, export PDF conforme BCEAO |
| **API publique** | Intégration directe pour fintechs — clés API, webhooks, sandbox |

---

## Modèle de déploiement

**Cloud** — SaaS multi-tenant. Inscription 15 000 FCFA, puis wallet prépayé à la vérification (500–1 800 FCFA/vérification selon le produit). Paiement Wave CI, Orange Money.

**Dedicated** — Docker Compose autonome sur l'infrastructure du client. Setup one-time 150–300k FCFA + licence mensuelle 75 000 FCFA. Le client gère son propre compte Smile ID. Données biométriques jamais transmises à Identis.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend API | NestJS + TypeScript |
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 + shadcn/ui |
| Base de données | PostgreSQL 16 + Prisma ORM |
| Cache / Queues | Redis + BullMQ |
| Stockage fichiers | Cloudflare R2 (chiffré AES-256) |
| Vérification KYC | Smile ID API |
| Notifications | WhatsApp Business API + SMS + Email |
| Paiement | Wave CI + Orange Money |
| Infra | Docker Compose + Nginx + VPS (Hetzner/OVH) |

---

## Démarrage rapide

**Prérequis** : Node ≥ 22, pnpm 10, Docker

```bash
# 1. Variables d'environnement
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# Remplir les valeurs dans apps/api/.env

# 2. Démarrer l'infrastructure
docker-compose up -d

# 3. Initialiser la base de données
pnpm -F db db:migrate
pnpm -F db db:generate

# 4. Lancer les apps
pnpm dev
```

- Dashboard : http://localhost:3000
- API : http://localhost:3001
- API Docs (Scalar) : http://localhost:3001/reference
- Mailpit : http://localhost:8025

---

## Structure du monorepo

```
apps/
  api/          NestJS REST API (port 3001)
  web/          Next.js dashboard (port 3000)
packages/
  db/           Schéma Prisma + client généré
  ui/           Composants UI partagés (shadcn/ui)
  transactional/ Templates d'emails React
docs/           Documentation produit complète
```

---

## Documentation

| Document | Contenu |
|---|---|
| [Architecture](docs/Identis_Architecture_v1.md) | Schéma de données, API, sécurité, déploiement |
| [PRD](docs/Identis_PRD_v1.md) | Vision produit, fonctionnalités détaillées, user stories |
| [Roadmap](docs/Identis_Roadmap_v1.md) | Plan 18 mois — MVP, Growth, Scale, Expansion UEMOA |
| [Modèle économique](docs/Identis_BizModel_v1.md) | Pricing, marges, projections financières |
| [Décisions](docs/Identis_Decisions_v1.md) | 26 décisions produit & légales documentées |
| [Compléments](docs/Identis_Complement_v1.md) | GTM, QA, support, CGU, sécurité |
| [UX/UI](docs/Identis_UXUI_v1.md) | Design system, flows utilisateurs |

---

## Segments cibles

- **Fintechs agréées BCEAO** — obligation réglementaire KYC, liste grise GAFI
- **IMF / Microfinance** — détection doublons, fraude dossiers, process manuels
- **Agences immobilières** — vérification candidats locataires à distance

---

_Document confidentiel — Identis v1.0 — Mai 2026_
