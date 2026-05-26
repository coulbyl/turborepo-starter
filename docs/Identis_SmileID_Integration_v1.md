# Smile Identity — Référence d'intégration Identis

## Installation

```bash
pnpm add smile-identity-core
# v3.1.0 — Node.js >= 14.x
# Dépendances: axios ^1.4.0, jszip ^3.10.1
```

## Classes exportées

```ts
import {
  WebApi,      // produits biométriques (images requises)
  IDApi,       // Enhanced KYC texte seul (sans images)
  Signature,   // HMAC-SHA256 — vérification des webhooks
  Utilities,   // polling job_status
  JOB_TYPE,    // constantes numérotées des produits
  IMAGE_TYPE,  // constantes pour le type de chaque image
} from 'smile-identity-core';
```

## Environnements

| `sid_server` | URL de base |
|---|---|
| `'0'` | `testapi.smileidentity.com/v1` (sandbox) |
| `'1'` | `api.smileidentity.com/v1` (production) |

Variables d'env requises : `SMILE_ID_PARTNER_ID`, `SMILE_ID_API_KEY`, `SMILE_ID_ENV` (`0` = sandbox, `1` = prod).

---

## `JOB_TYPE` — constantes produits

| Constante | Valeur | Produit Identis |
|---|---|---|
| `BIOMETRIC_KYC` | 1 | Selfie + CNI + lookup autorité — Verification Sprint 1 |
| `SMART_SELFIE_AUTHENTICATION` | 2 | Auth selfie contre profil enrôlé |
| `SMART_SELFIE_REGISTRATION` | 4 | Enrôlement selfie |
| `ENHANCED_KYC` | 5 | Vérification texte seul (N° CNI sans image) |
| `DOCUMENT_VERIFICATION` | 6 | Scan document + selfie, pas d'autorité |
| `ENHANCED_DOCUMENT_VERIFICATION` | 11 | DocV + cross-check autorité — recommandé CI |

## `IMAGE_TYPE` — constantes images

| Constante | Valeur | Usage |
|---|---|---|
| `SELFIE_IMAGE_FILE` | 0 | Selfie — chemin fichier |
| `ID_CARD_IMAGE_FILE` | 1 | Recto CNI — chemin fichier |
| `SELFIE_IMAGE_BASE64` | 2 | Selfie — base64 |
| `ID_CARD_IMAGE_BASE64` | 3 | Recto CNI — base64 |
| `LIVENESS_IMAGE_FILE` | 4 | Image liveness — chemin fichier |
| `ID_CARD_BACK_IMAGE_FILE` | 5 | Verso CNI — chemin fichier |
| `LIVENESS_IMAGE_BASE64` | 6 | Image liveness — base64 |
| `ID_CARD_BACK_IMAGE_BASE64` | 7 | Verso CNI — base64 |

---

## Initialisation `WebApi`

```ts
const webApi = new WebApi(
  partner_id,        // string — depuis le portail Smile ID
  default_callback,  // string | null — URL webhook par défaut
  api_key,           // string — depuis le portail Smile ID
  sid_server         // '0' | '1'
);
```

## Initialisation `IDApi` (Enhanced KYC)

```ts
const idApi = new IDApi(partner_id, api_key, sid_server);
```

---

## Produit 1 — Enhanced Document Verification (`job_type: 11`) ✅ Recommandé pour CI

Scan document (OCR + face match) **et** cross-check avec l'autorité d'état civil.
Combine DocV + Enhanced KYC en un seul appel. **Toujours asynchrone — résultat via webhook.**

```ts
await webApi.submit_job(
  {
    user_id: 'identis_case_id',     // ID interne Identis du dossier
    job_id: 'smile_job_ref',        // UUID unique par soumission
    job_type: JOB_TYPE.ENHANCED_DOCUMENT_VERIFICATION, // 11
  },
  [
    { image_type_id: IMAGE_TYPE.SELFIE_IMAGE_BASE64, image: '<base64>' },
    { image_type_id: IMAGE_TYPE.ID_CARD_IMAGE_BASE64, image: '<recto-base64>' },
    { image_type_id: IMAGE_TYPE.ID_CARD_BACK_IMAGE_BASE64, image: '<verso-base64>' }, // recommandé
  ],
  {
    country: 'CI',
    id_type: 'NATIONAL_ID',  // OBLIGATOIRE pour JT11 (contrairement à JT6)
  },
  {
    optional_callback: 'https://api.identis.ci/webhooks/smile-id',
  }
);
// Retourne immédiatement: { success: true, smile_job_id: '...' }
// Stocker smile_job_id dans Verification.smileJobId, puis attendre le webhook
```

## Produit 2 — Document Verification (`job_type: 6`)

Même chose mais **sans** cross-check autorité. `id_type` non requis. Utiliser si JT11 échoue pour un pays donné.

```ts
await webApi.submit_job(
  { user_id, job_id, job_type: JOB_TYPE.DOCUMENT_VERIFICATION },
  [
    { image_type_id: 2, image: '<selfie-base64>' },
    { image_type_id: 3, image: '<recto-base64>' },
  ],
  { country: 'CI' },  // id_type non requis
  { optional_callback: 'https://api.identis.ci/webhooks/smile-id' }
);
```

## Produit 3 — Enhanced KYC (`job_type: 5`) — texte seul

Vérification du N° de CNI contre l'autorité, **sans images**. Synchrone — retourne le résultat immédiatement.
Utiliser pour pré-vérifier le N° CNI saisi par le candidat avant d'envoyer les photos.

```ts
const result = await idApi.submit_job(
  { user_id, job_id, job_type: 5 },
  {
    country: 'CI',
    id_type: 'NATIONAL_ID_NO_PHOTO',  // seul type Enhanced KYC disponible pour CI
    id_number: '12345',
    first_name: 'Konan',
    last_name: 'Kouassi',
    dob: '1990-05-15',  // 'yyyy-mm-dd'
  }
);
// Synchrone — résultat direct dans result
```

## Produit 4 — Biometric KYC (`job_type: 1`)

Selfie matché contre une photo retournée par l'autorité d'état civil.
⚠️ Pour la CI : l'autorité ne retourne **pas de photo** (`NATIONAL_ID_NO_PHOTO`) — utiliser JT11 à la place.

---

## Vérification des webhooks — `Signature`

**Toujours valider la signature sur chaque payload webhook avant traitement.**

```ts
const sig = new Signature(partner_id, api_key);

// Dans le contrôleur webhook:
const isValid = sig.confirm_signature(payload.timestamp, payload.signature);
if (!isValid) throw new UnauthorizedException('Signature Smile ID invalide');
```

---

## Polling `job_status` — `Utilities`

Pour les jobs asynchrones : stocker `smile_job_id` puis poller via BullMQ (backoff 5min → 15min → 1h → 4h → 24h).

```ts
const utils = new Utilities(partner_id, api_key, sid_server);

const status = await utils.get_job_status(user_id, job_id, {
  return_history: false,
  return_images: false,
});
```

**Si `return_job_status: true`** passé à `submit_job`, le SDK WebApi poll automatiquement jusqu'à 60s. Déconseillé pour CI (réseau 3G) — préférer webhook + BullMQ.

---

## Shape de réponse `JobStatusResponse`

```ts
{
  job_complete: boolean,   // false = encore en cours, repoller
  job_success: boolean,    // true = validé, false = refusé/erreur
  smile_job_id: string,
  timestamp: string,
  signature: string,       // toujours vérifier avec confirm_signature()

  result: {
    ResultCode: string,    // voir tableau ci-dessous
    ResultText: string,    // description lisible
    SmileJobID: string,
    PartnerParams: object,

    // Champs identity (si disponibles via l'autorité)
    FullName?: string,
    DOB?: string,
    ExpirationDate?: string,
    IDNumber?: string,
    Country?: string,
    IDType?: string,
    Photo?: string,        // base64 ou 'Not Available'

    Actions: {
      Liveness_Check?: 'Passed' | 'Failed' | 'Not Applicable',
      Selfie_To_ID_Card_Compare?: 'Passed' | 'Failed',
      Verify_ID_Number?: 'Verified' | 'Not Verified',
      Return_Personal_Info?: 'Returned' | 'Not Returned',
      AML_CHECK?: 'Found' | 'Not Found',  // si AML activé sur le compte
      Human_Review_Compare?: string,
    }
  },

  // Si return_history: true
  history?: object[],

  // Si return_images: true
  image_links?: {
    selfie_link?: string,
    liveness_link?: string,
    id_card_link?: string,
  }
}
```

### Result codes

| Code | Signification |
|---|---|
| `0810` | ✅ Validé (Smile result: pass) |
| `0811` | 🟡 Provisoire (revue manuelle nécessaire) |
| `0812` | ❌ Refusé (Smile result: fail) |
| `1012` | ✅ N° CNI vérifié (Enhanced KYC) |
| `1013` | ❌ N° CNI introuvable |

**Mapping vers Identis `VerifStatus`:**
- `0810` + `Liveness_Check: 'Passed'` → `APPROVED` (score +0)
- `0811` → `PENDING` (revue manuelle, déclenche étape workflow)
- `0812` → `REJECTED`
- `0810` + `Liveness_Check: 'Failed'` → `REJECTED`

---

## Types d'ID supportés — Côte d'Ivoire et zone BCEAO

### Côte d'Ivoire (`CI`)

| Produit | `id_type` | Notes |
|---|---|---|
| Enhanced KYC (IDApi, JT5) | `NATIONAL_ID_NO_PHOTO` | Pas de photo dans la réponse |
| Enhanced KYC (IDApi, JT5) | `RESIDENT_ID_NO_PHOTO` | Carte de résident |
| DocV / Enhanced DocV (JT6/11) | `NATIONAL_ID` | OCR complet |
| DocV / Enhanced DocV | `DRIVERS_LICENSE` | |
| DocV / Enhanced DocV | `PASSPORT` | |
| DocV / Enhanced DocV | `HEALTH_INSURANCE_ID` | Carte CMU |
| DocV / Enhanced DocV | `ATTESTATION_CARD` | CNI provisoire |
| DocV / Enhanced DocV | `RESIDENT_CARD` | |

⚠️ Biometric KYC (JT1) avec `entered: 'true'` en CI : l'autorité ne retourne pas de photo biométrique. Pour le face match, utiliser JT11 (Enhanced DocV) avec une image physique du document.

### Autres pays BCEAO

| Pays | Enhanced KYC | DocV |
|---|---|---|
| Sénégal (`SN`) | `NATIONAL_ID` | `NATIONAL_ID`, `PASSPORT`, `ECOWAS_ID` |
| Burkina Faso (`BF`) | `NATIONAL_ID` | `NATIONAL_ID`, `PASSPORT` |
| Mali (`ML`) | — | `PASSPORT` |
| Togo (`TG`) | — | `RESIDENT_CARD`, `PASSPORT` |
| Bénin (`BJ`) | `NATIONAL_ID` | `NATIONAL_ID`, `RESIDENT_CARD`, `PASSPORT` |

---

## Flux asynchrone — architecture Identis

```
Agent/Candidat soumet CNI + selfie
        │
        ▼
API Identis reçoit les images
        │
        ▼
SmileIdProvider.verifyDocument()
  → webApi.submit_job(JT11, ...) → { smile_job_id }
  → Stocker smile_job_id dans Verification
  → Publier job BullMQ "smile-id-poll" (delay 5min)
        │
        ├── Chemin webhook (préféré):
        │   POST /webhooks/smile-id ← Smile ID
        │     → Vérifier signature
        │     → Mettre à jour Verification + Case
        │     → WebSocket push au dashboard
        │
        └── Chemin polling (fallback):
            BullMQ job_status check (5min → 15min → 1h → 4h → 24h)
              → Si job_complete: true → traiter résultat
              → Sinon → reschedule
```

---

## Variables d'environnement requises

```bash
SMILE_ID_PARTNER_ID=   # depuis portail.usesmileid.com
SMILE_ID_API_KEY=      # depuis portail.usesmileid.com
SMILE_ID_ENV=0         # 0 = sandbox, 1 = production
SMILE_ID_CALLBACK_URL= # https://api.identis.ci/webhooks/smile-id
```

## Sandbox

- Portail sandbox : `testapi.smileidentity.com`
- Inscription gratuite sur [usesmileid.com](https://usesmileid.com)
- Résultats en sandbox : toujours `0810` (pass) ou `0811` selon les images fournies
- Utiliser `SMILE_ID_ENV=0` + credentials sandbox pour dev/test

---

## AML Check

L'AML n'est **pas un `job_type` distinct** dans le SDK v3.1.0. Il est activé sur le compte partenaire et retourne un champ `Actions.AML_CHECK` dans la réponse `get_job_status` des jobs Biometric KYC (JT1). Contacter Smile ID pour activer cette option sur le compte partenaire Identis.

## Smile Secure (déduplication)

La déduplication par visage (Smile Secure) s'active au niveau du compte partenaire. Quand activée, le champ `duplicateFound` est retourné dans la réponse du job. **Non configurable via le SDK directement** — c'est une option de compte.
