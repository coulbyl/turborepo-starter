# Identis — Roadmap Produit

_De zéro au premier client Dedicated — Plan sur 18 mois_

**Départ :** Juin 2026 · **Horizon :** Décembre 2027

> Principe directeur : chaque phase se déclenche sur des **métriques atteintes**, pas sur un calendrier. Si P1 prend 5 mois au lieu de 4, P2 démarre quand même sur les critères — pas sur la date.

---

## Vue d'ensemble

| Phase | Période | Focus | Métrique de sortie |
|---|---|---|---|
| **P1 — MVP** | Juin – Sept 2026 | Construire et valider | 3 clients actifs · CA > 150k FCFA/mois |
| **P2 — Growth** | Oct 2026 – Jan 2027 | Acquérir et fidéliser | 15 clients · 1 Dedicated signé |
| **P3 — Scale** | Fév – Juil 2027 | Industrialiser et diversifier | 30 clients · rentabilité atteinte |
| **P4 — Expansion UEMOA** | Août – Déc 2027 | Internationaliser | 50 clients · 3 pays · API publique |

---

## Phase 1 — MVP (Juin – Septembre 2026)

**Objectif** : produit fonctionnel en production, utilisé par 3 clients payants réels.

### Critères de sortie
- 3 clients Cloud actifs avec au moins 50 vérifications chacun
- CA mois 4 > 150 000 FCFA
- NPS > 40
- Zéro incident critique en production pendant 2 semaines consécutives
- API testée par au moins 1 développeur externe

### Sprint 1 — Fondations vérification (3 semaines)
- [ ] Intégration Smile ID — Basic KYC + Document Verification + Selfie liveness
- [ ] Workspace création, membres, rôles (Admin + Agent)
- [ ] Dashboard minimal : liste dossiers + statuts vert/orange/rouge
- [ ] Flow agent-initié : scan CNI + selfie + résultat immédiat
- [ ] Wallet prépayé : inscription 15 000 FCFA + 10 vérifications offertes
- [ ] Rapport PDF basique par dossier
- [ ] Sandbox Smile ID configurée et testable
- [ ] Interface `IVerificationProvider` abstraite
- [ ] `WorkspaceScopeGuard` sur tous les endpoints métier
- [ ] Endpoint `DELETE /cases/:id` avec suppression cascade R2 + formData
- [ ] Job cron nettoyage photos biométriques R2 (90 jours)
- [ ] `Promise.race` timeout Smile ID + Bull retry queue (5min → 15min → 1h → 4h → 24h)

### Sprint 2 — API et self-service (3 semaines)
- [ ] API REST publique v1 avec authentification par clé API
- [ ] Webhooks : `case.completed`, `case.approved`, `case.rejected`
- [ ] Génération lien unique self-service (expiration configurable)
- [ ] Flow candidat complet : 8 étapes, consentement ARDP, `lastCompletedStep` (résilience)
- [ ] Smile Secure — détection doublons par visage
- [ ] Espace développeur : clés API, logs, documentation inline
- [ ] Recharge wallet Wave CI + Orange Money
- [ ] WebSocket (Socket.io) pour résultats asynchrones Smile ID
- [ ] Circuit breaker Smile ID — mode DÉGRADÉ par défaut
- [ ] Pipeline sanitisation fichiers uploads (ClamAV + MIME + UUID rename + R2 chiffré)
- [ ] Cache Redis Rule Engine (TTL 5min + invalidation immédiate)
- [ ] Lien unique à usage unique strict (statut COMPLETED)
- [ ] Pré-remplissage formulaire depuis données Smile ID

### Sprint 3 — Workflow et équipe (3 semaines)
- [ ] Workflow Engine : étapes configurables, rôles, délais, escalade auto
- [ ] Job cron horaire de vérification des délais workflow
- [ ] Notifications WhatsApp sur chaque transition de dossier
- [ ] Vue Kanban pipeline dans le dashboard
- [ ] Audit trail complet avec timeline et commentaires
- [ ] Export PDF rapport final avec audit trail inclus
- [ ] Gestion équipe : invitation membres, assignation rôles
- [ ] AML Check — screening sanctions BCEAO
- [ ] Override rouge : commentaire obligatoire 50 caractères + modal de confirmation

### Sprint 4 — Configuration et branding (3 semaines)
- [ ] Rule Engine : création règles, simulation, templates IMF/Immo/Fintech
- [ ] Form Builder drag-and-drop avec preview live
- [ ] Templates formulaire par secteur (3 templates pré-configurés)
- [ ] Branding workspace : logo, couleur principale, message accueil candidat
- [ ] Tarification dégressive automatique sur le wallet
- [ ] Mobile PWA : interface agent optimisée 3G Android 5 pouces
- [ ] KYB workspace à l'inscription (vérification RCCM)
- [ ] Tests end-to-end sur tous les flows critiques (TC-01 à TC-10)

**Actions légales avant lancement :** DPA + CGU (avocat CI), déclaration ARTCI, consultation juriste UEMOA (statut wallet prépayé BCEAO).

---

## Phase 2 — Growth (Octobre 2026 – Janvier 2027)

**Objectif** : 15 clients Cloud actifs, 1 contrat Dedicated signé.

### Critères de sortie
- 15 clients Cloud actifs avec ≥ 100 vérifications/mois chacun
- 1 contrat Dedicated signé et déployé
- Revenu mensuel récurrent > 800 000 FCFA
- Onboarding autonome sans intervention manuelle Identis
- Taux de recharge wallet > 70% dans les 30 jours suivant épuisement

### P2-A — Onboarding autonome (4 semaines)
- [ ] Inscription en ligne complète sans intervention Identis
- [ ] Wizard de configuration guidée post-inscription
- [ ] Documentation interactive in-product (tooltips, guides contextuels)
- [ ] Emails transactionnels : bienvenue, recharge, alerte solde bas, rapport mensuel
- [ ] Page de statut publique (status.identis.ci)

### P2-B — Analytics et rétention (3 semaines)
- [ ] Dashboard analytics avancé : volume, scores moyens, temps de traitement, taux approbation
- [ ] Graphiques Recharts : évolution mensuelle, distribution des scores, performance équipe
- [ ] Rapport mensuel automatique email à chaque admin workspace
- [ ] Alertes intelligentes : anomalie de volume, taux de rejet inhabituel
- [ ] Comparaison performance mois vs mois précédent

### P2-C — Package Dedicated (4 semaines)
- [ ] `docker-compose.dedicated.yml` finalisé et documenté
- [ ] Scripts `setup.sh`, `update.sh`, `backup.sh` testés sur VPS client
- [ ] `LicenseModule` avec heartbeat toutes les 24h et mode dégradé 30 jours
- [ ] `INSTALL.md` complet pour équipe technique client
- [ ] Déploiement et accompagnement du premier client Dedicated
- [ ] SLA 48h formalisé pour clients Dedicated

### P2-D — Go-to-market accéléré (continu P2)
- [ ] Prospection active : PAYMETRUST, SYCA, TOUCHPOINT, IMF agréées BCEAO
- [ ] Programme referral : 5 000 FCFA de crédit par workspace référé
- [ ] Landing page avec démo sandbox publique
- [ ] Présence LinkedIn : posts conformité BCEAO et liste grise GAFI
- [ ] Participation événements fintech Abidjan (CIFA, Impact Hub)

---

## Phase 3 — Scale (Février – Juillet 2027)

**Objectif** : 30 clients Cloud, 3 Dedicated, rentabilité opérationnelle, app native.

### Critères de sortie
- 30 clients Cloud actifs, volume moyen 150 vérifications/mois
- 3 contrats Dedicated actifs dont ≥ 1 institution financière
- Revenus mensuels > coûts opérationnels depuis au moins 2 mois
- App React Native sur Google Play Store
- 5 templates sectoriels dans la marketplace

### P3-A — React Native app agent (6 semaines)
- [ ] Migration PWA → React Native (Expo)
- [ ] Scan CNI via caméra native avec auto-détection et recadrage
- [ ] Mode offline : file locale si perte réseau, sync automatique
- [ ] Notifications push natives Android
- [ ] Publication Google Play Store

### P3-B — Marketplace templates (4 semaines)
- [ ] Marketplace templates Rule Engine partageables entre workspaces
- [ ] Templates sectoriels v2 : crypto OTC, assurance digitale, RH/recrutement
- [ ] Import/export configuration workflow
- [ ] Multi-formulaires par workspace
- [ ] Champs conditionnels avancés Form Builder

### P3-C — Super-admin et facturation (3 semaines)
- [ ] Dashboard super-admin : tous workspaces, revenus, santé système
- [ ] Gestion centralisée licences Dedicated (activation, suspension, renouvellement)
- [ ] Métriques globales : NWA, CPV, WRR, DCV en temps réel
- [ ] Outils de support : impersonation workspace (loggée), reset wallet
- [ ] Facturation automatisée : export comptable mensuel, reçus Wave/Orange

### P3-D — KYB (4 semaines)
- [ ] Intégration Smile ID KYB : vérification registre commerce CI (RCCM)
- [ ] Vérification actionnaires et bénéficiaires effectifs
- [ ] Scoring risque entreprise
- [ ] Nouveau produit wallet : 2 500 FCFA par vérification KYB

---

## Phase 4 — Expansion UEMOA (Août – Décembre 2027)

**Objectif** : Sénégal + Bénin, API publique documentée, 50 clients actifs.

### Critères de sortie
- ≥ 5 clients actifs à Dakar
- ≥ 3 clients actifs à Cotonou
- API publique sur docs.identis.ci avec SDK NPM publié
- 50 clients Cloud actifs dont 20% hors Côte d'Ivoire
- 5 contrats Dedicated actifs dont 1 hors CI

### P4-A — Multi-pays et documents UEMOA (5 semaines)
- [ ] Support documents Sénégal : CNI biométrique, passeport, permis
- [ ] Support documents Bénin : CNI, passeport
- [ ] Compliance multi-pays : règles BCEAO + CENTIF-CI + CENTIF-SN
- [ ] Workspace multi-pays : opérer en CI et SN depuis le même compte

### P4-B — API publique et ecosystem développeur (4 semaines)
- [ ] Documentation publique sur docs.identis.ci (Mintlify)
- [ ] SDK NPM publié : `@identis/node-sdk`
- [ ] SDK Python publié : `identis-python`
- [ ] Postman Collection publique
- [ ] Changelog public et versioning API strict
- [ ] Programme partenaire intégrateur (revenu partagé)

### P4-C — Produits financiers avancés (6 semaines)
- [ ] Credit scoring intégré : score Identis exportable vers systèmes de crédit
- [ ] API identité portable : utilisateur vérifié peut partager son score
- [ ] Webhooks enrichis : triggers métier personnalisés
- [ ] Intégrations natives : Julaya, CinetPay, APAYM
- [ ] Reporting BCEAO automatisé : génération rapport réglementaire mensuel

---

## Milestones clés

| Date | Milestone |
|---|---|
| **Juin 2026** | Sprint 1 — première ligne de code Identis |
| **Juillet 2026** | Première vérification réelle en production (CNI ivoirienne + selfie) |
| **Août 2026** | Premier client payant — inscription 15 000 FCFA encaissée |
| **Sept 2026** | 3 clients actifs — MVP validé |
| **Oct 2026** | Début prospection Dedicated |
| **Nov 2026** | 15 clients Cloud actifs |
| **Déc 2026** | Premier contrat Dedicated signé |
| **Jan 2027** | Premier déploiement Dedicated en production chez client |
| **Fév 2027** | Début Phase Scale — React Native en développement |
| **Avril 2027** | App React Native publiée sur Google Play Store |
| **Juin 2027** | Rentabilité opérationnelle atteinte |
| **Août 2027** | Ouverture Sénégal — premier client Dakar |
| **Oct 2027** | SDK NPM `@identis/node-sdk` publié sur npm |
| **Déc 2027** | 50 clients actifs · 5 Dedicated · 3 pays UEMOA |

---

## Hors roadmap — décisions futures

| Feature | Condition de réintégration |
|---|---|
| Application iOS native | Si > 20% des agents sur iOS |
| White label complet | Premier client qui le demande explicitement |
| Paiement candidat (self-pay) | Si segment immo le demande fortement |
| Assistant IA compliance | Si marge > 60% sur 6 mois consécutifs |
| Blockchain audit trail | Jamais — PostgreSQL suffit |

---

## Prochaine action immédiate

Créer le compte sandbox Smile ID sur [portal.usesmileid.com](https://portal.usesmileid.com) et tester le premier appel API sur une CNI ivoirienne. C'est le seul bloquant technique avant de démarrer le Sprint 1.

---

_Document confidentiel — Identis Roadmap v1.0 — Mai 2026_
