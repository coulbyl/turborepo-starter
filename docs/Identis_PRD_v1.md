**IDENTIS**

_Plateforme de verification d'identite et de validation de dossiers_

_pour l'Afrique francophone_

Version

**1.0 — MVP**

Date

**Mai 2026**

Statut

**Document produit**

# **1. Vision produit**
## **1.1 Probleme resolu**
En Afrique francophone, toute organisation qui doit faire confiance a un inconnu — avant d'ouvrir un compte, accorder un credit, ou remettre des cles — fait face au meme probleme :

« Je dois savoir a qui j'ai affaire avant de lui faire confiance. »

Aujourd'hui ce probleme est gere de facon manuelle, fragmentee et non auditee : photos de CNI sur WhatsApp, tableurs Excel, dossiers papier. Il n'existe pas de solution locale, abordable et adaptee aux realites du terrain.

## **1.2 La solution**
Identis est une plateforme RegTech qui permet a n'importe quelle organisation de :

- Verifier l'identite d'une personne en quelques secondes (CNI + selfie)
- Scorer automatiquement le risque selon des regles configurables
- Valider les dossiers via un workflow multi-etapes adapte a son equipe
- Collecter les informations complementaires via un formulaire sur mesure
- Generer un audit trail complet pour les besoins reglementaires

## **1.3 Positionnement**
« La plateforme de verification d'identite et de validation de dossiers pour les equipes financieres et immobilieres en Afrique francophone. »

## **1.4 Segments cibles**
**Segment**

**Probleme specifique**

**Priorite**

Fintechs agreees BCEAO

Obligation reglementaire recente, stack KYC incomplet

Priorite 1

IMF / Microfinance

Fraude dossiers, processus manuels, doublons emprunts

Priorite 2

Agences immobilieres

Faux locataires, arnaque documents, pas de tracabilite

Prevoyance

# **2. Stack technique**
## **2.1 Fournisseur de verification — Smile ID**
Identis s'appuie sur Smile ID comme moteur de verification biometrique et documentaire. Ce choix repose sur :

- Couverture de 8 types de documents ivoiriens (CNI, passeport, permis, carte de sante...)
- Precision biometrique de 99,8% sur les visages africains
- Integration ONECI pour la verification directe contre les registres gouvernementaux
- SDK mobile optimise pour Android 5.0+ et basse bande passante
- Pricing Pay-As-You-Go avec sandbox gratuite illimitee
- Certifications ISO 27001 et SOC 2 Type 1 & 2

## **2.2 Produits Smile ID utilises**
**Produit API**

**Fonction**

**Usage Identis**

Basic KYC

Verification numero CNI contre registre

Verification rapide sans selfie

Biometric KYC

CNI + selfie + base gouvernementale

Onboarding complet standard

Document Verification

OCR document + selfie match

Backup si pas d'acces registre

Enhanced DocV

DocV + cross-check base gov

Verification premium renforcee

Smile Secure

Detection doublons par visage

Anti multi-comptes / double emprunt

AML Check

Screening 1100+ listes sanctions/PEP

Compliance BCEAO obligatoire

## **2.3 Stack applicatif**
**Couche**

**Technologie**

Backend API

NestJS + TypeScript

Base de donnees

PostgreSQL + Prisma ORM

Frontend dashboard

Next.js + TypeScript

Stockage fichiers

Cloudflare R2 (documents, rapports PDF)

Notifications

WhatsApp Business API + SMS

Paiement

Wave CI + Orange Money (pay-per-use)

Infrastructure

Docker / Podman + VPS

# **3. Architecture produit**
Identis est structure en six modules fonctionnels qui s'articulent autour d'un concept central : le Dossier.

01

**Verification d'identite**

Couche Smile ID : CNI, selfie, document, AML check. Le moteur de verification brut, sous-jacent a tout le reste.

02

**Rule Engine — Scoring configurable**

Chaque workspace definit ses propres regles metier. Le score (0-100) est calcule automatiquement a chaque verification.

03

**Form Builder — Formulaire sur mesure**

Le workspace configure les champs additionnels a collecter (revenus, employeur, references...) avec des templates par secteur.

04

**Workflow Engine — Validation multi-etapes**

Le processus interne de validation est digitalise : etapes nommees, roles assignes, delais, escalades automatiques.

05

**Points d'entree du dossier**

Deux modes : initiation directe par l'agent (client present) ou lien unique envoye au client pour qu'il se verifie lui-meme.

06

**Audit Trail & Reporting**

Chaque action est horodatee et tracee. Rapports PDF exportables, conformes aux exigences BCEAO et ARDP.

# **4. Fonctionnalites detaillees**
## **4.1 Rule Engine — Scoring de risque**
Le Rule Engine est le coeur differentiant d'Identis. Il permet a chaque workspace de definir ses criteres de risque sans ecrire de code.

### **Fonctionnement**
- Chaque regle associe une condition a un impact sur le score (malus ou blocage direct)
- Le score final est calcule sur 100 apres application de toutes les regles actives
- Trois seuils configurables : Approuve / Revision manuelle / Rejete

### **Exemples de regles disponibles**
**Condition**

**Impact**

**Exemple d'usage**

Document expire depuis > N mois

Malus configurable

IMF : malus 30 pts si CNI > 6 mois

Meme visage detecte dans un autre dossier

Malus ou blocage

IMF : blocage si double emprunt detecte

Score liveness < seuil

Malus configurable

Fintech : malus 40 pts si liveness < 0.8

CNI emise depuis < N mois

Malus configurable

Tous : malus 10 pts si CNI < 3 mois

Pays de naissance liste GAFI

Alerte compliance

Fintech : alerte sans blocage automatique

Champ formulaire manquant (obligatoire)

Blocage soumission

IMF : fiche de paie absente

### **Templates de scoring par secteur**
- Fintech — Onboarding compte : focus documents valides + liveness
- IMF — Dossier credit : focus doublons + stabilite professionnelle
- Immobilier — Candidat locataire : focus situation pro + references
- Custom — Regles entierement libres

## **4.2 Form Builder — Formulaire configurable**
Chaque workspace configure son formulaire d'entree de dossier. Deux blocs fixes (CNI + selfie) sont toujours presents et non modifiables. Le reste est libre.

### **Types de champs disponibles**
**Type**

**Description**

**Exemple**

Texte

Saisie libre

Nom de l'employeur, poste occupe

Nombre

Valeur numerique

Revenu mensuel net en FCFA

Selection

Liste d'options predefinies

Type de contrat : CDI / CDD / Freelance

Upload document

Fichier PDF ou image

Fiche de paie, contrat de bail

Conditionnel

Affiche selon une reponse precedente

Nom employeur si Salarie selectionne

Consentement

Texte libre + case a cocher

Consentement ARDP personalise

### **Templates disponibles**
**IMF — Dossier credit**

_+ CNI + Selfie (fixes)_

- Nom employeur (oblig.)
- Revenu mensuel (oblig.)
- Anciennete (oblig.)
- Fiche de paie (optionnel)

**Immobilier — Locataire**

_+ CNI + Selfie (fixes)_

- Situation pro (oblig.)
- Revenu mensuel (oblig.)
- Type contrat (oblig.)
- Reference bailleur (opt.)

**Fintech — Onboarding minimal**

_+ CNI + Selfie (fixes)_

_Aucun champ additionnel._

_L'app fintech collecte_

_le reste dans son propre_

_onboarding._

## **4.3 Workflow Engine — Validation multi-etapes**
Chaque workspace configure son propre pipeline de validation. Le workflow reflete exactement le processus interne existant de l'organisation.

### **Structure d'un workflow**
- Nombre d'etapes libre (de 1 a N)
- Chaque etape a un nom, un role responsable, et un delai maximum
- Si le delai est depasse : escalade automatique a l'etape suivante ou alerte
- Actions possibles a chaque etape : Approuver / Rejeter / Escalader / Commenter

### **Exemple : Workflow IMF — Dossier credit**
**Etape**

**Acteur**

**Action**

**Declencheur**

1. Soumission

Agent terrain

Soumet CNI + formulaire

Manuel ou lien client

2. Scoring auto

Systeme

Calcul score Rule Engine

Automatique

3. Revision N1

Responsable agence

Examine les dossiers jaunes

Score 40-69

4. Validation credit

Directeur credit

Valide les dossiers escalades

Score < 40 ou escalade

5. Compliance sign-off

Compliance officer

Signature finale + archivage

Tous les dossiers approuves

### **Gestion des scores dans le workflow**
**Score**

**Statut**

**Comportement workflow**

**70 - 100**

Approuve automatiquement

Passe directement a l'etape compliance

**40 - 69**

Revision manuelle requise

Route vers responsable d'agence

**0 - 39**

Bloque — validation directeur requise

Ne peut pas avancer sans validation explicite

## **4.4 Points d'entree d'un dossier**
Un dossier peut etre initie de deux facons. Le resultat dans le workflow est identique ; seul le mode d'initiation differe.

**Mode 1 — Agent initie**

**Mode 2 — Self-service (lien unique)**

- Client present physiquement
- Agent scanne la CNI
- Client fait le selfie sur le telephone de l'agent
- Agent remplit le formulaire additionnel
- Soumission directe dans le workflow

- Client a distance (WhatsApp, SMS)
- Agent genere un lien unique depuis le dashboard
- Lien expire apres delai configurable
- Client complete sur son propre telephone
- Agent notifie des la completion

Pas de page publique permanente dans le MVP. Le lien unique lie a un dossier specifique est le seul mode self-service. Cela evite le spam, protege les donnees biometriques, et garantit la conformite ARDP.

# **5. User Stories**
## **5.1 Persona : Developpeur / CTO Fintech**
**US-F1  **_Developpeur fintech_

En tant que developpeur integrant l'API, je veux envoyer un numero CNI + selfie et recevoir un resultat de verification en moins de 5 secondes, pour automatiser mon onboarding client.

**US-F2  **_Developpeur fintech_

En tant que dev, je veux une sandbox avec donnees de test ivoiriennes, pour developper sans consommer de credits reels.

**US-F3  **_Developpeur fintech_

En tant que dev, je veux recevoir un webhook quand une verification est terminee, pour ne pas avoir a poller l'API.

**US-F4  **_Developpeur fintech_

En tant que dev, je veux des SDKs JavaScript/TypeScript documentes avec exemples NestJS, pour integrer en quelques heures pas en quelques jours.

**US-F5  **_Responsable conformite fintech_

En tant que responsable conformite, je veux un rapport PDF horodate pour chaque verification, pour pouvoir le presenter a la BCEAO ou un auditeur.

## **5.2 Persona : Agent de credit IMF**
**US-I1  **_Agent de credit IMF_

En tant qu'agent de credit, je veux lancer une verification depuis mon telephone en envoyant juste la photo CNI d'un client, pour eviter de rentrer manuellement les donnees.

**US-I2  **_Agent de credit IMF_

En tant qu'agent, je veux voir un resultat clair — vert/orange/rouge — en moins de 30 secondes, pour prendre une decision rapide en face du client.

**US-I3  **_Responsable agence IMF_

En tant que responsable d'agence IMF, je veux voir l'historique de toutes les verifications de mon equipe avec les scores, pour detecter les dossiers suspects avant decaissement.

**US-I4  **_Responsable agence IMF_

En tant que responsable, je veux etre alerte quand un meme visage ou une meme CNI est soumis plusieurs fois dans des dossiers differents, pour detecter les doubles emprunts.

**US-I5  **_Agent de credit IMF_

En tant qu'agent, je veux que l'interface soit en francais simple et fonctionne sur une connexion 3G, pour l'utiliser partout en Cote d'Ivoire.

## **5.3 Persona : Agent immobilier**
**US-R1  **_Agent immobilier_

En tant qu'agent immobilier, je veux envoyer un lien de verification a un candidat locataire par WhatsApp, pour qu'il fasse sa verification lui-meme depuis son telephone.

**US-R2  **_Agent immobilier_

En tant qu'agent, je veux recevoir une notification quand la verification du candidat est terminee, avec son score de confiance.

**US-R3  **_Proprietaire / Notaire_

En tant que proprietaire, je veux partager le rapport 'locataire verifie' avec mon notaire ou gestionnaire, pour securiser la signature du bail.

**US-R4  **_Agent immobilier_

En tant qu'agent, je veux voir si le candidat a deja ete verifie sur la plateforme auparavant, pour detecter les profils a risque.

**US-R5  **_Agent immobilier_

En tant qu'agent, je veux que la verification soit payee par le candidat lui-meme (500-1000 FCFA), pour ne rien debourser et proposer ca comme service premium.

## **5.4 Persona : Responsable conformite (Rule Engine)**
**US-S1  **_Responsable conformite fintech_

En tant que responsable conformite, je veux creer mes propres regles de scoring sans ecrire de code, pour adapter les criteres de risque a mon contexte BCEAO.

**US-S2  **_Responsable agence IMF_

En tant qu'agent IMF, je veux definir un seuil automatique de blocage, pour qu'aucun dossier rouge ne passe en decaissement sans validation manuelle.

**US-S3  **_Admin workspace_

En tant qu'admin client, je veux voir l'impact de chaque regle sur mes verifications passees (simulation), pour calibrer mes seuils avant de les activer en production.

**US-S4  **_Developpeur fintech_

En tant que developpeur fintech, je veux que le score et les regles declenchees soient retournes dans la reponse API, pour les logguer dans mon systeme interne.

**US-S5  **_Agent immobilier debutant_

En tant qu'agent immobilier, je veux utiliser un template de scoring predefini 'locataire' sans configurer quoi que ce soit, pour demarrer immediatement.

## **5.5 Persona : Equipe de validation (Workflow)**
**US-W1  **_Administrateur workspace_

En tant qu'administrateur client, je veux creer un workflow avec des etapes nommees et assigner des roles a chaque etape, pour refleter exactement mon processus interne.

**US-W2  **_Agent terrain_

En tant qu'agent terrain, je veux soumettre un dossier et voir son statut en temps reel dans le pipeline, pour savoir ou il en est sans relancer mon responsable.

**US-W3  **_Responsable agence_

En tant que responsable d'agence, je veux recevoir une notification (WhatsApp ou email) quand un dossier arrive dans ma file d'attente, pour ne rien laisser trainer.

**US-W4  **_Responsable agence_

En tant que responsable, je veux voir tous les dossiers en attente tries par score de risque, pour traiter les plus urgents en premier.

**US-W5  **_Validateur_

En tant que validateur, je veux ajouter un commentaire motivant ma decision sur chaque dossier, pour laisser une trace auditee.

**US-W6  **_Directeur credit_

En tant que directeur, je veux qu'un dossier rouge soit automatiquement bloque et ne puisse pas avancer sans ma validation explicite, pour eviter les contournements.

**US-W7  **_Compliance officer_

En tant que compliance officer, je veux exporter tous les dossiers valides d'un mois avec leurs trails de decision en PDF, pour mes obligations BCEAO.

**US-W8  **_Administrateur workspace_

En tant qu'admin, je veux configurer un delai maximum par etape avec escalade automatique, pour qu'aucun dossier ne reste bloque silencieusement.

## **5.6 Persona : Points d'entree du dossier**
**US-AG1  **_Agent terrain_

En tant qu'agent terrain, je veux initier directement le screening d'un client present devant moi en saisissant ses informations et prenant les photos moi-meme, pour ne pas avoir a lui envoyer un lien.

**US-AG2  **_Agent terrain_

En tant qu'agent, je veux pouvoir utiliser la camera de mon telephone pour scanner la CNI du client automatiquement sans tout ressaisir manuellement, pour gagner du temps.

**US-AG3  **_Agent terrain_

En tant qu'agent, je veux que le selfie liveness soit fait par le client directement sur mon telephone que je lui tends, pour garder la preuve biometrique meme en mode agent-initie.

**US-P1  **_Agent immobilier_

En tant qu'agent immobilier, je veux generer un lien de verification en un clic depuis le dashboard et l'envoyer par WhatsApp, pour ne pas manipuler les documents du candidat moi-meme.

**US-P2  **_Candidat locataire_

En tant que candidat locataire, je veux ouvrir le lien sur mon telephone, prendre une photo de ma CNI et un selfie, sans creer de compte, pour completer ma verification en moins de 3 minutes.

**US-P3  **_Agent_

En tant qu'agent, je veux etre notifie immediatement quand mon candidat a termine son screening, pour relancer le processus sans delai.

**US-P4  **_Candidat_

En tant que candidat, je veux voir clairement qui demande ma verification et pourquoi, pour avoir confiance avant de soumettre mes documents.

**US-P5  **_Compliance officer_

En tant que compliance officer, je veux que le consentement ARDP soit capture explicitement pendant le flow candidat, pour etre couvert legalement sur la collecte biometrique.

## **5.7 Persona : Administrateur workspace (Form Builder)**
**US-FB1  **_Admin workspace_

En tant qu'admin workspace, je veux construire mon formulaire d'entree en ajoutant, reordonnant et supprimant des champs, sans coder, pour collecter exactement ce dont j'ai besoin.

**US-FB2  **_Admin workspace_

En tant qu'admin, je veux marquer certains champs comme obligatoires et d'autres optionnels, pour ne pas bloquer une soumission sur des informations secondaires.

**US-FB3  **_Admin IMF_

En tant qu'admin IMF, je veux un template de formulaire 'dossier credit' prerempli avec les champs standards, pour demarrer sans tout configurer from scratch.

**US-FB4  **_Admin immobilier_

En tant qu'admin immobilier, je veux un template 'candidat locataire' avec situation pro + revenus + references, pret a l'emploi.

**US-FB5  **_Developpeur fintech_

En tant que developpeur fintech, je veux desactiver completement le formulaire et ne garder que CNI + selfie, car mon app collecte deja le reste via mon propre onboarding.

**US-FB6  **_Admin workspace_

En tant qu'admin, je veux que les donnees du formulaire soient incluses dans le rapport PDF final et visibles dans le dossier du workflow, pour que les validateurs aient tout en un endroit.

# **6. Plan de livraison MVP**
**Sprint**

**Duree**

**Contenu**

**User Stories**

Sprint 1

2-3 sem.

Inscription workspace + dashboard
Integration Smile ID (Basic KYC + DocV)
Interface upload CNI + selfie
Resultat vert/orange/rouge + rapport PDFUS-F1, US-F2, US-I1, US-I2

Sprint 2

2-3 sem.

API REST + cle d'acces
Webhook sur resultat
Detection doublon (Smile Secure)
Rule Engine basique + templates scoringUS-F3, US-F4, US-S1, US-S2, US-S5, US-I4

Sprint 3

2-3 sem.

Workflow multi-etapes configurable
Gestion equipe + roles
Notifications WhatsApp/SMS
Audit trail + export PDFUS-W1 a US-W8, US-F5, US-I3

Sprint 4

2-3 sem.

Form Builder + templates secteur
Lien unique self-service
Initiation agent directe
Consentement ARDP + complianceUS-FB1 a US-FB6, US-AG1 a US-AG3, US-P1 a US-P5

# **7. Modele de pricing (proposition)**
**Plan**

**Cible**

**Prix / mois**

**Inclus**

Starter

Agences immo, petites structures

25 000 FCFA

50 verif/mois, dashboard, rapport PDF

Business

IMF, fintechs en croissance

80 000 FCFA

200 verif/mois, API, webhook, Rule Engine

Pro

Fintechs agreees BCEAO

150 000 FCFA

500 verif/mois + workflow + form builder

Enterprise

Grandes structures, multi-pays

Sur devis

Volume, SLA, support dedie, paiement FCFA

Les verifications supplementaires au-dela du quota sont facturees a l'unite. Paiement accepte en Wave CI, Orange Money, et virement bancaire.

# **8. Synthese**
## **8.1 Ce qu'Identis n'est pas**
- Un simple wrapper Smile ID
- Un outil KYC generique sans adaptation locale
- Une solution qui requiert une equipe technique chez le client

## **8.2 Ce qu'Identis est**
- Une couche decisionnelle au-dessus de la verification biometrique
- Un outil de travail collaboratif pour les equipes financieres africaines
- La seule solution combinant verification, scoring metier, workflow et formulaire configurable en francais pour l'UEMOA

## **8.3 Avantage competitif defensable**
Smile ID verifie le document. Identis decide quoi faire avec le resultat — selon les regles metier du client, son organisation interne, et ses obligations reglementaires locales. C'est cette couche qui est difficile a copier rapidement.

## **8.4 Prochaines etapes**
- Creer le compte sandbox Smile ID et tester l'API sur une CNI ivoirienne reelle
- Construire le service SmileIdService dans NestJS (Sprint 1)
- Approcher 3 contacts identifies : Moussa Haidra (PAYMETRUST), Abdillahi Osman (SYCA), Youssouf Fadiga (TOUCHPOINT)
- Valider le pricing avec 2-3 prospects avant de commencer Sprint 2
- Finaliser le nom : Identis ou alternative UEMOA

_Document confidentiel — Identis MVP v1.0 — Mai 2026_