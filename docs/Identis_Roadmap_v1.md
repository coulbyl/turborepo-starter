**IDENTIS**

**Roadmap Produit**

_De zero au premier client Dedicated — Plan sur 18 mois_

MVP  |  Growth  |  Scale  |  Expansion UEMOA

Horizon

**18 mois**

Phases

**4 phases distinctes**

Depart

**Juin 2026**

# **1. Vue d'ensemble — 4 phases sur 18 mois**
**P1  MVP**_   Juin — Septembre 2026 (4 mois)_

Construire et valider le produit avec les 3 premiers clients payants

**P2  Growth**_   Octobre 2026 — Janvier 2027 (4 mois)_

Atteindre 15 clients Cloud actifs et signer le premier contrat Dedicated

**P3  Scale**_   Fevrier — Juillet 2027 (6 mois)_

Automatiser l'acquisition, lancer React Native, atteindre la rentabilite

**P4  Expansion UEMOA**_   Aout — Decembre 2027 (5 mois)_

Ouvrir le Senegal et le Benin, API publique documentee, marketplace de templates

Principe directeur : chaque phase se declenche sur des metriques, pas sur un calendrier. Si P1 prend 5 mois au lieu de 4, P2 demarre quand meme sur les criteres atteints — pas sur la date.

# **2. Phase 1 — MVP (Juin — Septembre 2026)**
## **Objectif**
Avoir un produit fonctionnel, deploye en production, utilise par 3 clients payants reels. Valider que la douleur est reelle et que le produit resout le bon probleme.

## **Criteres de sortie de P1**
- **3 clients Cloud actifs **ayant effectue au moins 50 verifications chacun
- **Chiffre d'affaires M4 **> 150 000 FCFA (hors inscriptions)
- **NPS initial **> 40 sur les 3 premiers clients
- **Zero incident critique **en production pendant 2 semaines consecutives
- **API documentee **et testee par au moins 1 developpeur externe

## **2.1 Sprint 1 — Fondations verification**
**S1**

3 semaines

**Fondations verification et dashboard minimal**

- Integration Smile ID — Basic KYC + Document Verification + Selfie liveness
- Workspace creation, membres, roles (Admin + Agent)
- Dashboard web minimal : liste des dossiers + statuts vert/orange/rouge
- Flow agent-initie : scan CNI + selfie + resultat immediat
- Wallet prepaye : inscription 15 000 FCFA + credit de depart 10 verifications
- Rapport PDF basique pour chaque dossier
- Sandbox Smile ID configuree et testable

## **2.2 Sprint 2 — API et self-service**
**S2**

3 semaines

**API externe, webhooks et lien self-service**

- API REST publique v1 avec authentification par cle API
- Webhook : events case.completed, case.approved, case.rejected
- Generation de lien unique self-service (expiration configurable)
- Flow candidat complet : 8 etapes, consentement ARDP, confirmation SMS
- Integration Smile Secure — detection doublons par visage
- Espace developpeur : cles API, logs, documentation inline
- Recharge wallet : Wave CI + Orange Money

## **2.3 Sprint 3 — Workflow et equipe**
**S3**

3 semaines

**Workflow multi-etapes et gestion d'equipe**

- Workflow Engine : etapes configurables, roles, delais, escalade auto
- Notifications WhatsApp sur chaque transition de dossier
- Vue Kanban du pipeline dans le dashboard
- Audit trail complet avec timeline et commentaires
- Export PDF rapport final avec audit trail inclus
- Gestion equipe : invitation membres, assignation roles
- AML Check integration — screening sanctions BCEAO

## **2.4 Sprint 4 — Configuration et branding**
**S4**

3 semaines

**Rule Engine, Form Builder et branding workspace**

- Rule Engine : creation regles, simulation, templates IMF/Immo/Fintech
- Form Builder drag-and-drop avec preview live
- Templates de formulaire par secteur (3 templates pre-configures)
- Branding workspace : logo, couleur principale, message accueil candidat
- Tarification degressive automatique sur le wallet
- Mobile PWA : interface agent optimisee 3G Android 5 pouces
- Tests end-to-end sur tous les flows critiques

# **3. Phase 2 — Growth (Octobre 2026 — Janvier 2027)**
## **Objectif**
Passer de 3 a 15 clients Cloud actifs. Signer le premier contrat Dedicated. Automatiser ce qui peut l'etre pour reduire le temps passe par client.

## **Criteres de sortie de P2**
- **15 clients Cloud actifs **avec au moins 100 verifications/mois chacun
- **1 contrat Dedicated signe **et deploye chez le client
- **Revenu mensuel recurrent **> 800 000 FCFA
- **Onboarding autonome : **un nouveau client s'inscrit et configure son workspace sans aide
- **Taux de recharge wallet **> 70% dans les 30 jours suivant epuisement

## **Features Phase 2**
**P2-A**

4 semaines

**Onboarding et self-service client**

- Inscription en ligne complete sans intervention manuelle Identis
- Wizard de configuration guidee apres inscription (workflow, formulaire, regles)
- Documentation interactive dans le produit (tooltips, guides contextuels)
- Email transactionnels : bienvenue, recharge, alerte solde bas, rapport mensuel
- Page de statut publique (status.identis.ci) avec historique incidents

**P2-B**

3 semaines

**Analytics et retention**

- Dashboard analytics avance : volume, scores moyens, temps de traitement, taux approbation
- Graphiques recharts : evolution mensuelle, distribution des scores, performance equipe
- Rapport mensuel automatique envoye par email a chaque admin workspace
- Alertes intelligentes : anomalie de volume, taux de rejet inhabituel
- Comparaison performance : ce mois vs mois precedent

**P2-C**

4 semaines

**Package Dedicated et premier deploiement**

- Docker Compose Dedicated finalise et documente
- Script setup.sh et update.sh testes sur VPS client
- LicenseModule avec heartbeat et mode degrade 30 jours
- Documentation INSTALL.md complete pour equipe technique client
- Deploiement et accompagnement du premier client Dedicated
- Support SLA 48h formalise pour clients Dedicated

**P2-D**

Continu sur P2

**Go-to-market accelere**

- Prospection active : PAYMETRUST, SYCA, TOUCHPOINT, IMF agreees BCEAO
- Programme referral : 5 000 FCFA de credit pour chaque workspace refere
- Page de landing optimisee avec demo en ligne (sandbox publique)
- Presence LinkedIn active : posts sur conformite BCEAO et liste grise GAFI
- Participation evenements fintech Abidjan (CIFA, Impact Hub)

# **4. Phase 3 — Scale (Fevrier — Juillet 2027)**
## **Objectif**
Industrialiser la croissance. Reduire le cout d'acquisition. Lancer React Native. Atteindre la rentabilite operationnelle sans injection de capital.

## **Criteres de sortie de P3**
- **30 clients Cloud actifs **avec volume moyen 150 verifications/mois
- **3 contrats Dedicated actifs **dont au moins 1 institution financiere
- **Rentabilite : **revenus mensuels > couts operationnels depuis au moins 2 mois
- **App React Native **disponible sur Google Play Store
- **Marketplace templates : **5 templates sectoriels disponibles

## **Features Phase 3**
**P3-A**

6 semaines

**React Native — App agent native**

- Migration PWA mobile vers React Native (Expo)
- Scan CNI via camera native avec auto-detection et recadrage
- Mode offline : file locale si perte reseau, sync automatique
- Notifications push natives sur Android
- Publication Google Play Store
- iOS App Store (si adoption iOS detectee)

**P3-B**

4 semaines

**Marketplace templates et personnalisation avancee**

- Marketplace de templates Rule Engine partages entre workspaces (avec accord)
- Templates sectoriels v2 : crypto OTC, assurance digitale, RH/recrutement
- Import/export de configuration workflow entre workspaces du meme client
- Multi-formulaires par workspace (formulaire different par type de dossier)
- Champs conditionnels avances dans le Form Builder

**P3-C**

3 semaines

**Super-admin et gestion multi-workspaces**

- Dashboard super-admin Identis : tous les workspaces, revenus, sante systeme
- Gestion centralisee des licences Dedicated (activation, suspension, renouvellement)
- Metriques globales : NWA, CPV, WRR, DCV en temps reel
- Outils de support : impersonation workspace (avec log), reset wallet, debug dossier
- Facturation automatisee : export comptable mensuel, recus Wave/Orange

**P3-D**

4 semaines

**KYB — Verification entreprises**

- Integration Smile ID KYB : verification registre commerce CI (RCCM)
- Verification actionnaires et beneficiaires effectifs
- Scoring risque entreprise (secteur, anciennete, dirigeants)
- Usage : fintechs B2B, plateformes marchands, credit aux PME
- Nouveau produit wallet : 2 500 FCFA par verification KYB

# **5. Phase 4 — Expansion UEMOA (Aout — Decembre 2027)**
## **Objectif**
Ouvrir le Senegal et le Benin. Documenter l'API publiquement pour attirer les integrateurs. Devenir la reference RegTech de la zone UEMOA francophone.

## **Criteres de sortie de P4**
- **Presence Senegal : **au moins 5 clients actifs a Dakar
- **Presence Benin : **au moins 3 clients actifs a Cotonou
- **API publique : **documentee sur docs.identis.ci avec SDK NPM publie
- **50 clients Cloud actifs **dont 20% hors Cote d'Ivoire
- **5 contrats Dedicated actifs **dont 1 hors CI

## **Features Phase 4**
**P4-A**

5 semaines

**Multi-pays et documents UEMOA**

- Support documents Senegal : CNI biometrique, passeport, permis conduire
- Support documents Benin : CNI, passeport
- Devises : FCFA unifie UEMOA (pas de conversion necessaire)
- Compliance multi-pays : regles BCEAO + CENTIF-CI + CENTIF-SN
- Workspace multi-pays : un client peut operer en CI et SN depuis le meme compte

**P4-B**

4 semaines

**API publique et ecosystem developpeur**

- Documentation publique sur docs.identis.ci (GitBook ou Mintlify)
- SDK NPM publie : @identis/node-sdk
- SDK Python publie : identis-python
- Postman Collection publique avec tous les endpoints
- Changelog public et versioning API strict
- Programme partenaire integrateur : revenu partage sur les workspaces apportes

**P4-C**

6 semaines

**Produits financiers avances**

- Credit scoring integre : score Identis exportable vers systemes de credit
- API identite portable : un utilisateur verifie sur Identis peut partager son score
- Webhooks enrichis : triggers metier personnalises au-dela des evenements standards
- Integrations natives : Julaya, CinetPay, APAYM (paiement inline dans le flow)
- Reporting BCEAO automatise : generation du rapport reglementaire mensuel

# **6. Milestones cles**
**Date**

**Milestone**

**Type**

**Juin 2026**

Debut du Sprint 1 — premiere ligne de code Identis

**Lancement**

**Juillet 2026**

Premiere verification reelle en production (CNI ivoirienne + selfie)

**Technique**

**Aout 2026**

Premier client payant — inscription 15 000 FCFA encaissee

**Business**

**Sept. 2026**

3 clients actifs — fin Phase MVP validee

**MVP Complete**

**Oct. 2026**

Debut prospection Dedicated — premier RDV qualifie

**Commercial**

**Nov. 2026**

15 clients Cloud actifs

**Growth**

**Dec. 2026**

Premier contrat Dedicated signe

**Business**

**Jan. 2027**

Premier deploiement Dedicated en production chez client

**Technique**

**Fev. 2027**

Debut Phase Scale — React Native en developpement

**Produit**

**Avril 2027**

App React Native publiee sur Google Play Store

**Produit**

**Juin 2027**

Rentabilite operationnelle atteinte

**Finance**

**Aout 2027**

Ouverture Senegal — premier client Dakar

**Expansion**

**Oct. 2027**

SDK NPM @identis/node-sdk publie sur npm

**Technique**

**Dec. 2027**

50 clients actifs, 5 Dedicated, presence 3 pays UEMOA

**Scale**

# **7. Backlog features complet**
Vue exhaustive de toutes les features identifiees, classees par phase et effort estime.

**ID**

**Feature**

**Phase**

**Effort**

**Valeur business**

**F-01**

Verification Basic KYC (CNI numero)

**P1-S1**

2j

Onboarding rapide fintechs

**F-02**

Document Verification + Selfie liveness

**P1-S1**

3j

Coeur du produit

**F-03**

Wallet prepaye + inscription 15 000 FCFA

**P1-S1**

3j

Monetisation directe

**F-04**

Dashboard dossiers minimal

**P1-S1**

2j

Retention client

**F-05**

API REST v1 + cles API

**P1-S2**

4j

Segment developpeurs fintechs

**F-06**

Webhooks (case.completed, etc.)

**P1-S2**

2j

Integration systemes clients

**F-07**

Lien unique self-service

**P1-S2**

3j

Usage immobilier + IMF distance

**F-08**

Flow candidat 8 etapes + ARDP

**P1-S2**

4j

Conformite legale obligatoire

**F-09**

Smile Secure — detection doublons

**P1-S2**

2j

Anti-fraude IMF

**F-10**

Recharge Wave CI + Orange Money

**P1-S2**

3j

Adoption locale

**F-11**

Workflow multi-etapes configurable

**P1-S3**

5j

Adoption IMF et compliance

**F-12**

Notifications WhatsApp Business

**P1-S3**

2j

Engagement terrain

**F-13**

Audit trail + export PDF

**P1-S3**

3j

Conformite BCEAO obligatoire

**F-14**

AML Check integration

**P1-S3**

2j

Exigence reglementaire

**F-15**

Rule Engine + templates scoring

**P1-S4**

5j

Differenciation produit

**F-16**

Form Builder drag-and-drop

**P1-S4**

4j

Adoption multi-secteurs

**F-17**

Branding workspace

**P1-S4**

2j

Retention + fidelisation

**F-18**

Mobile PWA agent

**P1-S4**

4j

Usage terrain IMF

**F-19**

Onboarding autonome wizard

**P2-A**

3j

Scalabilite acquisition

**F-20**

Analytics dashboard avance

**P2-B**

4j

Retention et upsell

**F-21**

Rapport mensuel automatique email

**P2-B**

2j

Valeur percue client

**F-22**

Package Dedicated + deploiement

**P2-C**

8j

Ticket eleve Dedicated

**F-23**

Programme referral workspace

**P2-D**

2j

Croissance virale

**F-24**

React Native app agent (Expo)

**P3-A**

15j

Adoption terrain profonde

**F-25**

Marketplace templates Rule Engine

**P3-B**

5j

Network effect

**F-26**

Super-admin dashboard

**P3-C**

6j

Operations Identis

**F-27**

KYB — verification entreprises

**P3-D**

8j

Nouveau segment B2B

**F-28**

Support documents Senegal + Benin

**P4-A**

6j

Expansion UEMOA

**F-29**

SDK NPM @identis/node-sdk

**P4-B**

5j

Ecosystem developpeur

**F-30**

Credit scoring exportable

**P4-C**

10j

Valeur ajoutee premium

# **8. Hors roadmap — decisions futures**
Ces features ont ete identifiees mais volontairement exclues de la roadmap 18 mois. Elles seront evaluees selon la demande client reelle.

**Feature**

**Pourquoi hors roadmap**

**Condition de reintegration**

Application iOS native

Marche CI majoritairement Android

Si > 20% des agents sur iOS

White label complet (domaine propre)

Complexite ops importante

Premier client qui le demande explicitement

Paiement candidat (self-pay)

Modele plus simple sans ca

Si segment immo le demande fortement

Reconnaissance faciale temps reel

Smile ID couvre le besoin

Si client Dedicated l'exige

Blockchain audit trail

Sur-ingenierie pour le marche CI actuel

Jamais — audit trail PostgreSQL suffit

Marketplace de dossiers (B2B2C)

Modele metier trop complexe

Phase 5 si le marche mature

Assistant IA compliance

LLM couteux, ROI incertain MVP

Si margin > 60% sur 6 mois

# **9. Synthese**
La roadmap est construite sur un principe simple : livrer de la valeur a chaque sprint, valider avec de vrais clients, et ne passer a la phase suivante que sur des metriques atteintes — pas sur un calendrier.

## **Resume par phase**
**Phase**

**Periode**

**Focus**

**Metrique cle de sortie**

P1 — MVP

Juin — Sept 2026

Construire et valider

3 clients actifs + CA > 150k FCFA/mois

P2 — Growth

Oct 2026 — Jan 2027

Acquérir et fideliser

15 clients + 1 Dedicated signe

P3 — Scale

Fev — Juil 2027

Industrialiser et diversifier

30 clients + rentabilite

P4 — Expansion UEMOA

Aout — Dec 2027

Internationaliser

50 clients, 3 pays, API publique

## **La prochaine action immediate**
Creer le compte sandbox Smile ID sur portal.usesmileid.com et tester le premier appel API sur une CNI ivoirienne. C'est le seul blocant technique avant de demarrer Sprint 1.

_Document confidentiel — Identis Roadmap Produit v1.0 — Mai 2026_