**IDENTIS**

**Architecture Technique**

_Schema de donnees, securite, API, deploiement Cloud et Dedicated_

NestJS  |  PostgreSQL  |  Prisma  |  Next.js  |  Docker

Version

**1.0 — MVP**

Backend

**NestJS + TypeScript**

Base de donnees

**PostgreSQL + Prisma**

Deploiement

**Docker / Podman**

# **1. Stack technique complet**
**Frontend**

Next.js 14 (App Router)   |   TypeScript   |   Tailwind CSS v4   |   shadcn/ui   |   Recharts

**Backend**

NestJS   |   TypeScript   |   Prisma ORM   |   Passport.js (auth)   |   Bull (queues)

**Base de donnees**

PostgreSQL 16   |   Prisma Migrations   |   Redis (cache + sessions)

**Stockage**

Cloudflare R2 (documents, rapports PDF, photos CNI)

**Provider KYC**

Smile ID API (Basic KYC, DocV, Biometric, AML, Smile Secure)

**Notifications**

WhatsApp Business API   |   SMS (Twilio ou Africa's Talking)   |   Email (Resend)

**Paiement**

Wave CI API   |   Orange Money API   |   Virement (manuel M1)

**Infra Cloud**

VPS (Hetzner ou OVH)   |   Nginx reverse proxy   |   Docker Compose   |   Certbot SSL

**Infra Dedicated**

Docker Compose packaged   |   PostgreSQL embarque   |   R2 ou MinIO local

**CI/CD**

GitHub Actions   |   Docker Hub registry   |   Deploiement auto sur merge main

**Monitoring**

Sentry (erreurs)   |   Uptime Robot (disponibilite)   |   Logs structurees JSON

# **2. Architecture globale**
## **2.1 Vue en couches**
┌──────────────────────────────────────────────────────────────┐

│                    CLIENTS (3 surfaces)                      │

│  Next.js Web App    |   PWA Mobile Agent   |  Flow Candidat  │

└────────────────────────────┬─────────────────────────────────┘

                             │ HTTPS

┌────────────────────────────▼─────────────────────────────────┐

│                   NGINX Reverse Proxy                        │

│              SSL termination + rate limiting                 │

└────────────────────────────┬─────────────────────────────────┘

                             │

┌────────────────────────────▼─────────────────────────────────┐

│                  NestJS API (port 3001)                      │

│  AuthModule | WorkspaceModule | CaseModule | VerifModule     │

│  RuleEngineModule | WorkflowModule | FormModule | ApiModule  │

│  WalletModule | NotificationModule | AdminModule             │

└──────┬──────────────┬──────────────┬──────────────┬──────────┘

       │              │              │              │

  PostgreSQL       Redis          Smile ID      Cloudflare R2

  (donnees)       (cache)         (KYC API)     (fichiers)

## **2.2 Modules NestJS**
**Module**

**Responsabilite**

**Endpoints principaux**

AuthModule

JWT, refresh tokens, 2FA, API keys

POST /auth/login, /auth/refresh, /auth/apikey

WorkspaceModule

CRUD workspace, membres, roles, branding

GET/POST /workspace, /workspace/members

CaseModule

Creation, suivi, recherche des dossiers

GET/POST /cases, /cases/:id, /cases/:id/status

VerifModule

Integration Smile ID, stockage resultats

POST /verify/basic, /verify/document, /verify/aml

RuleEngineModule

CRUD regles, calcul score, simulation

GET/POST /rules, POST /rules/simulate

WorkflowModule

Configuration pipeline, transitions etapes

GET/POST /workflow, POST /cases/:id/action

FormModule

CRUD champs formulaire, templates secteur

GET/POST /forms, /forms/templates

EntryPointModule

Generation liens uniques, expiration, flow candidat

POST /entrypoints, GET /entrypoints/:token

WalletModule

Solde, recharges, deductions, historique

GET /wallet, POST /wallet/recharge, /wallet/deduct

NotificationModule

WhatsApp, SMS, email — files d'attente Bull

Interne — pas d'endpoints publics

ApiModule

Cles API externes, logs, webhooks, usage

GET/POST /api/keys, /api/logs, /api/webhooks

AdminModule

Super-admin : tous les workspaces, licences

GET /admin/workspaces, /admin/licenses

LicenseModule

Validation licences Dedicated, heartbeat

POST /license/validate, /license/heartbeat

# **3. Schema de donnees — Modele Prisma**
Le schema est organise autour de l'entite centrale Workspace. Toutes les donnees sont isolees par workspace (multi-tenant). La cle d'isolation est workspaceId presente sur chaque entite metier.

## **3.1 Entites principales**
**Workspace**

_Compte client Identis_

id               String   @id @default(cuid())

name             String

slug             String   @unique

deploymentType   DeploymentType  // CLOUD | DEDICATED

logoUrl          String?

primaryColor     String?

welcomeMessage   String?

licenseKey       String?  @unique

licenseExpiresAt DateTime?

lastHeartbeatAt  DateTime?

dedicatedUrl     String?

walletBalance    Int      @default(0)  // en FCFA

createdAt        DateTime @default(now())

members          Member[]

cases            Case[]

rules            Rule[]

formTemplates    FormTemplate[]

workflowSteps    WorkflowStep[]

apiKeys          ApiKey[]

walletTx         WalletTransaction[]

**Member**

_Membre d'un workspace_

id           String  @id @default(cuid())

workspaceId  String

userId       String

role         MemberRole  // ADMIN | AGENT | REVIEWER | COMPLIANCE

createdAt    DateTime @default(now())

workspace    Workspace @relation(...)

user         User      @relation(...)

**Case**

_Dossier de verification_

id              String  @id @default(cuid())

workspaceId     String

reference       String  // ex: CASE-2026-0042

initiatedBy     InitiationMode  // AGENT | SELF_SERVICE

initiatorId     String?  // membre agent si AGENT

entryPointId    String?  // lien si SELF_SERVICE

status          CaseStatus  // PENDING|IN_REVIEW|APPROVED|REJECTED|EXPIRED

currentStepId   String?

formData        Json?   // reponses formulaire additionnel

verificationId  String? // ref vers Verification

scoreResult     Json?   // { score, rules_triggered, threshold }

createdAt       DateTime @default(now())

updatedAt       DateTime @updatedAt

stepHistory     StepHistory[]

verification    Verification?

**Verification**

_Resultat Smile ID_

id              String  @id @default(cuid())

caseId          String  @unique

smileJobId      String  // ID retourne par Smile ID

product         VerifProduct  // BASIC_KYC|DOC_VERIFY|DOC_VERIFY_AML|SMILE_SECURE

status          VerifStatus   // PENDING|APPROVED|REJECTED|UNKNOWN

livenessScore   Float?

documentValid   Boolean?

amlMatch        Boolean?

duplicateFound  Boolean?

rawResult       Json    // reponse complete Smile ID

cniPhotoUrl     String? // stocke sur R2

selfiePhotoUrl  String? // stocke sur R2

createdAt       DateTime @default(now())

**Rule**

_Regle du Rule Engine_

id           String  @id @default(cuid())

workspaceId  String

name         String

condition    String  // ex: 'document_expired_months > 6'

operator     String  // GT | LT | EQ | CONTAINS | IN

value        String

consequence  RuleConsequence  // MALUS | BLOCK | ALERT

malus        Int?    // points de penalite si MALUS

active       Boolean @default(true)

order        Int

createdAt    DateTime @default(now())

**WorkflowStep**

_Etape de validation_

id              String  @id @default(cuid())

workspaceId     String

name            String

order           Int

requiredRole    MemberRole

maxDelayHours   Int     @default(48)

onExpiry        StepExpiry  // ESCALATE | ALERT | AUTO_APPROVE

scoreMin        Int?    // score minimum pour passer cette etape

scoreMax        Int?    // score maximum pour cette etape

createdAt       DateTime @default(now())

**StepHistory**

_Audit trail d'un dossier_

id          String  @id @default(cuid())

caseId      String

stepId      String

actorId     String?  // null si action automatique systeme

action      StepAction  // APPROVED|REJECTED|ESCALATED|COMMENTED|AUTO

comment     String?

createdAt   DateTime @default(now())

**FormTemplate**

_Formulaire configurable_

id           String  @id @default(cuid())

workspaceId  String

name         String

sector       FormSector?  // IMF | IMMO | FINTECH | CUSTOM

active       Boolean @default(true)

fields       FormField[]

createdAt    DateTime @default(now())

**FormField**

_Champ du formulaire_

id              String  @id @default(cuid())

formTemplateId  String

type            FieldType  // TEXT|NUMBER|SELECT|UPLOAD|CONSENT

label           String

placeholder     String?

required        Boolean @default(false)

options         Json?   // pour SELECT : ['CDI','CDD','Freelance']

conditionalOn   String? // fieldId de reference

conditionalVal  String? // valeur qui declenche l'affichage

order           Int

**EntryPoint**

_Lien unique self-service_

id           String  @id @default(cuid())

workspaceId  String

caseId       String  @unique

token        String  @unique  // dans l'URL

expiresAt    DateTime

completedAt  DateTime?

status       EntryStatus  // PENDING|COMPLETED|EXPIRED

createdAt    DateTime @default(now())

**WalletTransaction**

_Mouvement du wallet_

id           String  @id @default(cuid())

workspaceId  String

type         TxType  // INSCRIPTION|RECHARGE|DEDUCTION|REFUND

amount       Int     // en FCFA (positif ou negatif)

balanceBefore Int

balanceAfter  Int

reference    String?  // ref paiement Wave/Orange

caseId       String?  // si DEDUCTION liee a un dossier

product      VerifProduct?

createdAt    DateTime @default(now())

**ApiKey**

_Cle d'acces API externe_

id           String  @id @default(cuid())

workspaceId  String

name         String  // label donne par le dev

keyHash      String  @unique  // bcrypt hash — jamais en clair

prefix       String  // ex: 'id_live_' pour identifier

environment  ApiEnv  // SANDBOX | PRODUCTION

lastUsedAt   DateTime?

revokedAt    DateTime?

createdAt    DateTime @default(now())

## **3.2 Enumerations Prisma**
enum DeploymentType  { CLOUD  DEDICATED }

enum MemberRole      { ADMIN  AGENT  REVIEWER  COMPLIANCE  DEVELOPER }

enum CaseStatus      { PENDING  IN_REVIEW  APPROVED  REJECTED  EXPIRED }

enum InitiationMode  { AGENT  SELF_SERVICE }

enum VerifProduct    { BASIC_KYC  DOC_VERIFY  DOC_VERIFY_AML  SMILE_SECURE }

enum VerifStatus     { PENDING  APPROVED  REJECTED  UNKNOWN }

enum RuleConsequence { MALUS  BLOCK  ALERT }

enum StepExpiry      { ESCALATE  ALERT  AUTO_APPROVE }

enum StepAction      { APPROVED  REJECTED  ESCALATED  COMMENTED  AUTO_EXPIRED }

enum FormSector      { IMF  IMMO  FINTECH  CUSTOM }

enum FieldType       { TEXT  NUMBER  SELECT  UPLOAD  CONSENT }

enum EntryStatus     { PENDING  COMPLETED  EXPIRED }

enum TxType          { INSCRIPTION  RECHARGE  DEDUCTION  REFUND }

enum ApiEnv          { SANDBOX  PRODUCTION }

# **4. Securite**
## **4.1 Authentification et autorisation**
**Mecanisme**

**Detail**

**Implementation**

JWT Access Token

Duree de vie 15 minutes

Passport.js JWT Strategy

JWT Refresh Token

Duree de vie 7 jours, rotation automatique

Stocke en DB, invalide apres usage

API Key externe

Pour les fintechs integrant l'API

Hash bcrypt, prefix type 'id_live_xxxx'

2FA (post-MVP)

TOTP optionnel pour comptes admin

otplib

RBAC

5 roles : Admin, Agent, Reviewer, Compliance, Developer

NestJS Guards + Decorators

Session candidat

Token one-time lie au lien unique

Pas de JWT — validation par token EntryPoint

## **4.2 Isolation multi-tenant**
Chaque requete est validee contre le workspaceId du token JWT. Un membre ne peut jamais acceder aux donnees d'un autre workspace.

// Guard applique sur tous les endpoints metier

@Injectable()

export class WorkspaceScopeGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest();

    const user = request.user;  // injecte par JWT Guard

    const workspaceId = request.params.workspaceId

                     || request.body.workspaceId;

    // Verifie que l'utilisateur appartient bien a ce workspace

    return user.workspaceId === workspaceId;

  }

}

Toutes les requetes Prisma incluent systematiquement un filtre WHERE workspaceId = X. Meme en cas de bug dans les guards, la couche donnees reste isolee.

## **4.3 Securite des donnees biometriques**
**Donnee**

**Stockage**

**Acces**

**Retention**

Photo CNI

Cloudflare R2 — chiffre AES-256

URL signee temporaire (15 min)

90 jours puis suppression auto

Selfie liveness

Cloudflare R2 — chiffre AES-256

URL signee temporaire (15 min)

90 jours puis suppression auto

Resultat Smile ID

PostgreSQL — champ rawResult Json

Workspace uniquement

Indefini (audit trail)

Donnees formulaire

PostgreSQL — champ formData Json

Workspace + membres autorises

Indefini

AML screening

PostgreSQL — champ amlMatch Boolean

Compliance role uniquement

Indefini (exigence BCEAO)

Les photos biometriques ne sont jamais stockees en base de donnees. Seule l'URL R2 est enregistree. L'acces direct au fichier necessite une URL signee generee a la demande avec expiration courte.

## **4.4 Securite des cles API**
// Generation d'une cle API

// 1. Generer une cle aleatoire

const rawKey = 'id_live_' + crypto.randomBytes(32).toString('hex');

// 2. Stocker uniquement le hash en base

const keyHash = await bcrypt.hash(rawKey, 12);

await prisma.apiKey.create({

  data: { workspaceId, name, keyHash,

          prefix: rawKey.substring(0, 12),  // 'id_live_xxxx'

          environment: 'PRODUCTION' }

});

// 3. Retourner la cle en clair UNE SEULE FOIS au client

// Elle n'est plus jamais recuperable apres ca

return { key: rawKey, message: 'Copiez cette cle maintenant' };

## **4.5 Rate limiting et protection API**
- **Rate limit global : **100 requetes / minute par IP (Nginx)
- **Rate limit par cle API : **1 000 requetes / heure configurable par workspace
- **Rate limit flow candidat : **3 tentatives / token, puis expiration forcee
- **Validation des inputs : **class-validator sur tous les DTOs NestJS
- **CORS : **liste blanche des domaines autorises par workspace
- **Helmet.js : **headers de securite HTTP sur toutes les reponses

## **4.6 Conformite ARDP (protection donnees CI)**
- Consentement explicite capture et horodate dans EntryPoint avant toute collecte
- Droit a l'effacement : endpoint DELETE /cases/:id supprime photos R2 + formData
- Pas de transfert de donnees biometriques hors du territoire sans consentement
- Logs d'acces aux donnees sensibles (qui a consulte quoi et quand)
- Politique de retention documentee et appliquee automatiquement

# **5. API REST — Reference**
## **5.1 Conventions**
- **Base URL Cloud : **https://api.identis.ci/v1
- **Base URL Dedicated : **https://votre-domaine/api/v1
- **Authentification : **Header Authorization: Bearer {apiKey} ou Bearer {jwtToken}
- **Format : **JSON exclusivement, UTF-8
- **Versioning : **URL versioning — /v1, /v2 en parallele lors des migrations
- **Erreurs : **RFC 7807 — { type, title, status, detail, instance }

## **5.2 Endpoints de verification**
// Basic KYC — verification par numero CNI seul

POST /v1/verify/basic

{

  "id_number": "CI1234567890",

  "first_name": "Kouame",

  "last_name": "Yao",

  "date_of_birth": "1990-05-15"

}

// Document Verification — CNI + selfie

POST /v1/verify/document

{

  "document_front": "base64...",

  "document_back": "base64...",

  "selfie": "base64...",

  "country": "CI",

  "id_type": "NATIONAL_ID"

}

// Verification complete — DocV + AML

POST /v1/verify/full

{

  "document_front": "base64...",

  "document_back": "base64...",

  "selfie": "base64...",

  "aml_check": true

}

## **5.3 Format de reponse standard**
// Reponse verification complete

{

  "case_id": "case_abc123",

  "status": "APPROVED",

  "score": 82,

  "score_label": "LOW_RISK",

  "verification": {

    "document_valid": true,

    "liveness_score": 0.97,

    "face_match": true,

    "aml_match": false

  },

  "rules_triggered": [

    { "rule": "document_age", "malus": 0 },

    { "rule": "liveness_threshold", "malus": 0 }

  ],

  "wallet_deducted": 1200,

  "wallet_balance": 48800,

  "created_at": "2026-05-22T14:32:00Z"

}

## **5.4 Webhooks**
Les webhooks permettent a une fintech de recevoir les resultats de verification sans polling.

// Configuration d'un webhook

POST /v1/webhooks

{

  "url": "https://votre-app.com/identis/webhook",

  "events": ["case.completed", "case.approved", "case.rejected"],

  "secret": "votre_secret_pour_valider_la_signature"

}

// Payload envoye par Identis sur l'evenement case.completed

{

  "event": "case.completed",

  "case_id": "case_abc123",

  "status": "APPROVED",

  "score": 82,

  "timestamp": "2026-05-22T14:32:00Z",

  "signature": "sha256=abc123..."  // HMAC-SHA256

}

# **6. Deploiement Cloud**
## **6.1 Architecture serveur**
┌─────────────────────────────────────────────────────┐

│               VPS Principal (4 vCPU, 8 GB RAM)      │

│                                                     │

│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │

│  │  Nginx   │  │ NestJS   │  │   Next.js (web)   │ │

│  │ :80/:443 │  │  :3001   │  │      :3000        │ │

│  └──────────┘  └──────────┘  └───────────────────┘ │

│                                                     │

│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │

│  │PostgreSQL│  │  Redis   │  │  Bull (queues)    │ │

│  │  :5432   │  │  :6379   │  │   (notifications) │ │

│  └──────────┘  └──────────┘  └───────────────────┘ │

└─────────────────────────────────────────────────────┘

                        │

              Cloudflare R2 (stockage)

              Smile ID API (KYC)

              WhatsApp API (notifs)

## **6.2 Docker Compose Cloud**
# docker-compose.cloud.yml

services:

  api:

    image: identis/api:latest

    environment:

      DATABASE_URL: postgresql://...

      REDIS_URL: redis://redis:6379

      SMILE_ID_PARTNER_ID: ${SMILE_PARTNER_ID}

      SMILE_ID_API_KEY: ${SMILE_API_KEY}

      R2_BUCKET: ${R2_BUCKET}

      JWT_SECRET: ${JWT_SECRET}

    depends_on: [postgres, redis]

  web:

    image: identis/web:latest

    environment:

      NEXT_PUBLIC_API_URL: https://api.identis.ci

  postgres:

    image: postgres:16-alpine

    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:

    image: redis:7-alpine

  nginx:

    image: nginx:alpine

    ports: ['80:80', '443:443']

    volumes: [./nginx.conf:/etc/nginx/nginx.conf]

## **6.3 CI/CD — GitHub Actions**
# .github/workflows/deploy.yml

on:

  push:

    branches: [main]

jobs:

  deploy:

    steps:

      - uses: actions/checkout@v4

      - name: Build Docker images

        run: docker build -t identis/api:$GITHUB_SHA ./api

      - name: Push to registry

        run: docker push identis/api:$GITHUB_SHA

      - name: Deploy to VPS

        run: |

          ssh deploy@vps 'docker compose pull && docker compose up -d'

      - name: Run migrations

        run: ssh deploy@vps 'docker exec api npx prisma migrate deploy'

# **7. Deploiement Dedicated**
Le package Dedicated est un Docker Compose autonome que le client deploie sur sa propre infrastructure. Il inclut tout le necessaire pour fonctionner independamment du cloud Identis.

Le client Dedicated gere son propre compte Smile ID. Il configure ses credentials Smile ID dans le fichier .env de son instance. Identis ne connait pas ces credentials.

## **7.1 Package livre au client Dedicated**
- docker-compose.dedicated.yml — compose complet autonome
- .env.example — toutes les variables d'environnement a configurer
- setup.sh — script d'installation et de premiere configuration
- update.sh — script de mise a jour vers une nouvelle version
- backup.sh — script de sauvegarde PostgreSQL + R2/MinIO
- INSTALL.md — documentation d'installation pas a pas

## **7.2 Docker Compose Dedicated**
# docker-compose.dedicated.yml

services:

  api:

    image: identis/api:${IDENTIS_VERSION}

    environment:

      DATABASE_URL: postgresql://postgres:${DB_PASS}@postgres:5432/identis

      IDENTIS_LICENSE_KEY: ${LICENSE_KEY}

      IDENTIS_CLOUD_URL: https://api.identis.ci  # pour validation licence

      # Compte Smile ID propre du client

      SMILE_ID_PARTNER_ID: ${CLIENT_SMILE_PARTNER_ID}

      SMILE_ID_API_KEY: ${CLIENT_SMILE_API_KEY}

      # Stockage local (MinIO) ou R2 propre au client

      STORAGE_TYPE: ${STORAGE_TYPE}  # MINIO | R2

      MINIO_ENDPOINT: http://minio:9000

  web:

    image: identis/web:${IDENTIS_VERSION}

  postgres:

    image: postgres:16-alpine

    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:

    image: redis:7-alpine

  minio:  # stockage local si pas de R2

    image: minio/minio

    volumes: [minio_data:/data]

  nginx:

    image: nginx:alpine

    ports: ['80:80', '443:443']

## **7.3 Validation de licence**
L'instance Dedicated valide sa licence au demarrage et envoie un heartbeat toutes les 24 heures vers api.identis.ci.

// LicenseModule — validation au demarrage

@Injectable()

export class LicenseService implements OnModuleInit {

  async onModuleInit() {

    const valid = await this.validateLicense();

    if (!valid) {

      this.logger.error('Licence Identis invalide ou expiree');

      // Mode degradé — lecture seule pendant 30 jours de grace

    }

  }

  async validateLicense(): Promise<boolean> {

    const response = await fetch('https://api.identis.ci/v1/license/validate', {

      method: 'POST',

      body: JSON.stringify({ key: process.env.IDENTIS_LICENSE_KEY })

    });

    return response.ok;

  }

}

# **8. Monitoring et observabilite**
**Outil**

**Usage**

**Alertes configurees**

Sentry

Erreurs JavaScript et NestJS en temps reel

Toute erreur 500, exceptions non gerees

Uptime Robot

Disponibilite endpoints /health toutes les 5 min

Downtime > 2 min — SMS + email

Logs JSON

Logs structures NestJS (Winston)

Patterns d'erreur, tentatives auth echouees

Prisma logs

Queries lentes > 1 seconde logguees

Query > 5 sec — investigation manuelle

Bull Board

Dashboard files d'attente notifications

File en echec > 10 jobs

## **8.1 Endpoint /health**
// GET /health — verifie tous les services

{

  "status": "ok",

  "timestamp": "2026-05-22T14:32:00Z",

  "services": {

    "database": "ok",

    "redis": "ok",

    "smile_id": "ok",

    "r2_storage": "ok"

  },

  "version": "1.2.0",

  "uptime": 864000

}

# **9. Synthese**
Un seul codebase NestJS sert les deux modes de deploiement. La difference est dans les variables d'environnement et le LicenseModule. Aucune logique metier n'est dupliquee.

## **Points d'attention pour le MVP**
- Negocier le contrat Smile ID avant de commencer le VerifModule — les credentials sandbox sont gratuits
- Configurer Cloudflare R2 en premier — requis pour stocker les photos des les tests
- Implementer WorkspaceScopeGuard des le debut — corriger l'isolation multi-tenant apres coup est couteux
- Ne pas stocker de photos biometriques en base — uniquement les URLs R2 signees
- Tester le flow Dedicated localement avec Docker Compose avant le premier client
- Activer Sentry des le Sprint 1 — les erreurs en production sans monitoring sont dangereuses

## **Variables d'environnement critiques**
# .env.production

DATABASE_URL=postgresql://user:pass@host:5432/identis

REDIS_URL=redis://localhost:6379

JWT_SECRET=<256-bit-random>

JWT_REFRESH_SECRET=<256-bit-random-different>

SMILE_ID_PARTNER_ID=<from smile ID portal>

SMILE_ID_API_KEY=<from smile ID portal>

SMILE_ID_ENV=1  # 0=sandbox, 1=production

R2_ACCOUNT_ID=<cloudflare account id>

R2_ACCESS_KEY_ID=<r2 access key>

R2_SECRET_ACCESS_KEY=<r2 secret>

R2_BUCKET_NAME=identis-files

WHATSAPP_PHONE_ID=<from meta developer portal>

WHATSAPP_TOKEN=<permanent token>

RESEND_API_KEY=<resend.com api key>

ENCRYPTION_KEY=<32-byte-hex-for-AES-256>

_Document confidentiel — Identis Architecture Technique v1.0 — Mai 2026_