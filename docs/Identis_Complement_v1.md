**IDENTIS**

**Documents Complementaires**

GTM  |  QA  |  Support  |  CGU  |  Marque  |  Securite

**#**

**Document**

**Priorite**

1

Go-to-Market — scripts, pitch, early adopters

AVANT LANCEMENT

2

Plan de test et QA — cas limites, charge, rollback

AVANT PREMIER CLIENT

3

Politique de support client — canaux, SLA, incidents

AVANT PREMIER CLIENT

4

CGU et mentions legales — clauses minimum

AVANT LANCEMENT

5

Identite de marque — nom, domaine, tagline

MAINTENANT

6

Securite et reponse aux incidents — plan de breach

AVANT LANCEMENT

**01  Go-to-Market**

## **1.1 Positionnement par segment**
**Segment**

**Douleur principale**

**Argument cle Identis**

**Ce qu'on ne dit pas**

Fintech BCEAO

Obligation conformite + liste grise GAFI CI

Soyez conformes en 48h, pas en 6 mois

On ne parle pas de scoring dans le pitch initial

IMF / Microfinance

Fraude dossiers, double emprunt, processus manuel

Detectez les doublons avant le decaissement

On ne parle pas de l'API technique

Agence immobiliere

Faux locataires, arnaque documents, zero tracabilite

Badge locataire verifie en 3 minutes

On ne parle pas de workflow ni de Rule Engine

## **1.2 Script d'approche WhatsApp — Fintech / IMF**
Message initial — premier contact. Court, direct, sans pitch produit.

**Identis →**

_Bonjour [Prenom], je suis [Nom] fondateur d'Identis. On construit une solution de verification d'identite pensee pour les fintechs ivoiriennes sous contrainte BCEAO. En 2 phrases : on permet a une equipe de verifier une CNI + selfie en moins de 30 secondes, avec un audit trail conforme. Est-ce que c'est un sujet sur votre agenda en ce moment ?_

**Si OUI →**

_Parfait. Je peux vous faire une demo de 20 minutes cette semaine sur votre cas concret. Quel est votre principal probleme aujourd'hui : l'onboarding client, la detection de doublons, ou la conformite BCEAO ?_

**Si PAS MAINTENANT →**

_Pas de probleme. Je vous envoie juste notre page de demo sandbox — vous pouvez tester une verification reelle sur votre propre CNI en 3 minutes. Si ca correspond a un besoin futur, revenez vers moi._

**Si PAS INTERESSE →**

_Merci pour votre reponse. Juste une derniere question : est-ce que vous connaissez d'autres fintechs ou IMF qui gèrent encore le KYC manuellement ? Je serais ravi d'un contact._

## **1.3 Script d'approche LinkedIn — Responsable conformite**
Note de connexion LinkedIn — 300 caracteres maximum.

**Note →**

_Bonjour [Prenom], je travaille sur une solution de conformite KYC pour les fintechs CI face aux nouvelles exigences BCEAO 2025. Votre profil m'a semble pertinent. Serait-il possible d'echanger 15 minutes cette semaine ?_

## **1.4 Script d'approche — Agence immobiliere (terrain)**
Approche directe en agence — conversation orale.

**Identis →**

_Bonjour, je travaille sur un outil qui permet aux agences comme la votre de verifier l'identite d'un candidat locataire en 3 minutes avec son telephone. Le locataire recoit un lien WhatsApp, il prend une photo de sa CNI et un selfie, et vous recevez un rapport de confiance. Est-ce que vous avez deja perdu un loyer a cause d'un faux dossier ?_

**Si OUI →**

_C'est exactement ce qu'on resout. Ca vous interesse de tester avec votre prochain candidat, gratuitement ? Je configure votre compte en 10 minutes ici._

## **1.5 Pitch deck — 5 slides**
**Slide**

**Titre**

**Contenu cle**

1

Le probleme

70% des organisations CI verifient encore les identites sur WhatsApp avec une photo de CNI. Fraude, doublons, zero tracabilite.

2

La solution

Identis : verification CNI + selfie en 30 secondes, score de risque configurable, workflow de validation d'equipe, audit trail BCEAO.

3

Comment ca marche

Demo screenshot : flow agent (3 taps) + flow candidat (lien WhatsApp) + dashboard resultat vert/orange/rouge.

4

Pour qui

Fintechs agreees BCEAO, IMF/microfinance, agences immobilieres. Deja utilise par [premiers clients]. 15 000 FCFA d'inscription, puis 500 a 1 800 FCFA par verification.

5

Prochaine etape

Demo gratuite sur votre cas concret. Sandbox disponible maintenant sur identis.ci. Contact : [tel/email].

## **1.6 Politique early adopters — 3 premiers clients**
Les 3 premiers clients Cloud sont des clients strategiques. Ils valident le produit, fournissent des retours, et deviennent des references. On leur accorde des conditions speciales documentees.

**Avantage**

**Condition**

**Duree**

Frais d'inscription offerts (15 000 FCFA)

Signature d'un accord de temoignage ecrit

Permanent

50 verifications gratuites supplementaires

Participation a 2 sessions de feedback produit

Une fois

Acces beta features en avant-premiere

Retour ecrit sous 72h sur chaque feature testee

Pendant 6 mois

Support direct fondateur (WhatsApp)

Pas de conditions

Pendant 3 mois

Remise 30% sur les recharges wallet

Volume minimum 200 verifications par mois

Pendant 6 mois

## **1.7 Processus d'onboarding du premier client**
- Appel de decouverte 30 min — comprendre le cas d'usage exact et le processus interne actuel
- Configuration du workspace — fondateur configure en direct avec le client (screen sharing)
- Test live — verifier une vraie CNI du client en sa presence pour valider le resultat
- Formation equipe — session 1h avec tous les agents et validateurs
- Go-live supervise — les 10 premiers dossiers sont suivis en direct par le fondateur
- Bilan J+7 — appel de suivi pour identifier les frictions et ajuster la configuration

**02  Plan de test et QA**

## **2.1 Cas limites a couvrir obligatoirement**
**TC-01  CNI ivoirienne valide — verification nominale**

- Agent uploade photo CNI recto/verso nette
- Agent fait selfie liveness reussi
- Appel Smile ID Basic KYC

**Resultat attendu : **Score liveness > 0.9, document valide = true, statut APPROVED, score Identis > 70

**TC-02  CNI expiree — regle Rule Engine active**

- Meme flow que TC-01 avec CNI expiree depuis 8 mois
- Rule Engine : malus 30 pts si expire > 6 mois

**Resultat attendu : **Document valide = true (Smile ID accepte), score Identis < 70, badge ORANGE, regle declenchee visible

**TC-03  Photo CNI floue — qualite insuffisante**

- Agent uploade photo intentionnellement floue
- Smile ID tente l'OCR

**Resultat attendu : **Smile ID retourne document_valid = false, statut REJECTED, message explicite a l'agent : 'Photo insuffisante, reprendre'

**TC-04  Liveness echoue — candidat ne bouge pas**

- Candidat presente une photo de photo au lieu de son vrai visage
- Smile ID detecte la tentative

**Resultat attendu : **liveness_score < 0.5, statut REJECTED, dossier rouge, alerte agent : 'Verifiez que le candidat est present physiquement'

**TC-05  AML positif — personne sur liste sanctions**

- Verification DocV + AML sur une identite de test Smile ID marquee AML
- Rule Engine : blocage si AML match

**Resultat attendu : **aml_match = true, score Identis = 0, statut BLOCKED automatique, notification compliance officer immediate

**TC-06  Doublon visage — meme personne deux dossiers**

- Deux dossiers crees avec la meme personne dans le meme workspace
- Smile Secure active

**Resultat attendu : **duplicate_found = true, malus 50 pts sur le second dossier, alerte admin workspace

**TC-07  Smile ID timeout — API indisponible**

- Simuler timeout en coupant la connexion Smile ID apres soumission
- Mode degrade configure

**Resultat attendu : **Dossier passe en PENDING, agent voit 'Verification en cours', notification WhatsApp quand resultat disponible

**TC-08  Connexion perdue a mi-flow candidat**

- Candidat complete etapes 1 a 4 (CNI recto, verso, selfie)
- Fermer et rouvrir le lien

**Resultat attendu : **Candidat reprend a l'etape 5 (formulaire), les photos deja prises sont conservees, pas de recommencement

**TC-09  Upload fichier malveillant**

- Uploader un fichier .exe renomme en .pdf dans un champ formulaire
- ClamAV actif

**Resultat attendu : **Upload rejete avant stockage R2, log Sentry declenche, message generique au candidat, aucune trace sur R2

**TC-10  Override rouge avec commentaire insuffisant**

- Validateur tente d'approuver un dossier score 25/100 sans commentaire

**Resultat attendu : **Systeme bloque l'action, modal de confirmation affiche, champ commentaire obligatoire (min 50 caracteres)

## **2.2 Tests de charge — seuils minimum avant lancement**
**Scenario**

**Charge simulee**

**Seuil acceptable**

**Outil**

Verifications simultanees

10 verifs en parallele

Aucune degradation < 5s de reponse

k6 ou Artillery

Wallet deductions simultanees

50 deductions en 1 seconde

Zero race condition sur le solde

Test unitaire + k6

WebSocket connections

100 connexions simultanees

Pas de deconnexion involontaire

Socket.io test client

Upload fichiers simultanes

20 uploads en parallele

Aucun fichier perdu ou corrompu

k6 multipart

Dashboard 1000 dossiers

Workspace avec 1000 cases

Chargement liste < 2 secondes

Cypress ou Playwright

## **2.3 Politique de rollback**
- **Critere de rollback immediat : **toute erreur 500 sur plus de 5% des requetes pendant 5 minutes consecutives
- **Procedure : **revert automatique vers le tag Docker precedent via script rollback.sh
- **Temps de rollback cible : **moins de 3 minutes entre detection et retour en production
- **Communication : **notification Slack interne + message status.identis.ci dans les 5 minutes
- **Post-mortem : **document ecrit dans les 24h expliquant la cause et les mesures preventives

**03  Politique de support client**

## **3.1 Canaux de support par plan**
**Canal**

**Cloud Pay-as-you-go**

**Dedicated**

WhatsApp Business

Oui — heures ouvrables CI (8h-18h)

Oui — etendu 7h-20h

Email

support@identis.ci — reponse 24h

support@identis.ci — reponse 12h

Telephone

Non dans le MVP

Oui — numero dedie

Appel video

Sur demande pour incidents critiques

Inclus dans SLA

Base de connaissance

docs.identis.ci (Phase 2)

docs.identis.ci + doc privee

## **3.2 Niveaux de severite et SLA**
**Niveau**

**Definition**

**Exemple**

**SLA reponse**

**SLA resolution**

P1 — Critique

Service completement indisponible

API Identis down, aucune verification possible

15 min

2h

P2 — Majeur

Fonctionnalite principale degradee

Smile ID timeout recurrent, wallet ne se recharge pas

1h

8h

P3 — Mineur

Fonctionnalite secondaire impactee

Rapport PDF ne se genere pas, notif WhatsApp echouee

4h

24h

P4 — Question

Demande d'information ou de configuration

Comment configurer une regle Rule Engine ?

24h

72h

## **3.3 Procedure incident wallet — remboursement**
Si une verification echoue a cause d'un bug Identis (pas d'une erreur Smile ID), le workspace est rembourse.

- Client signale via WhatsApp ou email avec le case_id concerne
- Verification dans les logs : erreur technique Identis confirmee vs erreur Smile ID vs erreur utilisateur
- Si bug Identis confirme : credit automatique du wallet du montant de la verification dans les 24h
- Notification au client avec le detail du remboursement et la cause de l'incident
- Ticket interne cree pour correction du bug — priorite P2 minimum

Politique claire : on ne rembourse pas les verifications Smile ID echouees pour raisons biometriques (CNI floue, liveness echoue). On rembourse uniquement les erreurs techniques d'Identis. Cette distinction est documentee dans les CGU.

## **3.4 FAQ support — questions les plus frequentes anticipees**
**Question**

**Reponse type**

Mon candidat ne recoit pas le lien WhatsApp

Verifier que le numero est au format international (+225...). Si le probleme persiste, copier le lien et l'envoyer manuellement.

Le selfie est rejete systematiquement

Verifier l'eclairage (eviter le contre-jour), demander au candidat de retirer lunettes/chapeau, verifier que la camera est debloquee pour le navigateur.

Mon wallet ne se recharge pas avec Wave

La transaction Wave doit etre initiee depuis le numero enregistre sur le compte Identis. Verifier le numero et reessayer.

Un dossier est bloque depuis 48h

Verifier si une etape du workflow a un validateur assigne. Si le validateur est absent, un admin peut reassigner ou escalader manuellement.

Comment exporter mes dossiers pour la BCEAO

Dashboard > Analytics > Export mensuel > Telecharger PDF. Inclut l'audit trail complet de chaque dossier.

**04  CGU et mentions legales**

Ce document liste les clauses minimum que les CGU doivent couvrir. La redaction exacte est confiee a un avocat specialise en droit numerique CI. Budget estime : 150 000 a 300 000 FCFA.

## **4.1 Clauses non-negociables**
**1**

**Limitation de responsabilite — aide a la decision  [NON-NEGOCIABLE]**

Identis est un outil d'aide a la decision. Identis ne garantit pas l'authenticite des informations declarees par le candidat, uniquement la conformite des documents presentes au moment de la verification. La responsabilite de toute decision (attribution de credit, signature de bail, ouverture de compte) appartient exclusivement au workspace client.

**2**

**Sous-traitance des donnees personnelles  [NON-NEGOCIABLE]**

Identis agit en qualite de sous-traitant au sens de la loi CI n°2013-450 sur la protection des donnees personnelles. Le workspace client est le responsable de traitement. Le DPA (Data Processing Agreement) annexe aux presentes constitue l'encadrement contractuel du traitement des donnees personnelles.

**3**

**Usages interdits  [NON-NEGOCIABLE]**

Il est strictement interdit d'utiliser Identis pour : verifier des personnes a leur insu, constituer des bases de donnees biometriques a des fins commerciales ou politiques, discriminer des personnes sur la base de leurs resultats de verification, contourner des obligations reglementaires en manipulant les resultats. Toute violation entraine la resiliation immediate sans remboursement.

**4**

**Conservation et suppression des donnees  [NON-NEGOCIABLE]**

Les photos biometriques (CNI, selfie) sont conservees 90 jours puis supprimees automatiquement. Les donnees de formulaire suivent la meme politique. Les metadonnees non-personnelles (scores anonymises, statistiques) peuvent etre conservees indefiniment a des fins d'amelioration du service. Le workspace peut demander la suppression anticipee via le dashboard.

**5**

**Disponibilite du service  [NON-NEGOCIABLE]**

Identis s'engage sur un objectif de disponibilite de 99% mensuel hors maintenance planifiee. Les maintenances planifiees sont annoncees avec 48h de preavis sur status.identis.ci. En cas d'indisponibilite non planifiee superieure a 2 heures, un credit de 10% du montant recharge dans le mois est applique automatiquement.

## **4.2 Clauses importantes**
**6**

**Wallet et remboursements  [IMPORTANT]**

Le solde du wallet ne perime pas. En cas de fermeture du compte a l'initiative du client, le solde residuel est rembourse dans un delai de 5 jours ouvrables. Les frais d'inscription (15 000 FCFA) ne sont pas remboursables. Les verifications consommees ne sont pas remboursables sauf en cas de bug technique documente d'Identis.

**7**

**Propriete intellectuelle  [IMPORTANT]**

Les templates de scoring, de workflow et de formulaire fournis par Identis restent la propriete d'Identis. Les configurations specifiques creees par le workspace (regles personnalisees, champs sur-mesure) restent la propriete du workspace. Identis peut utiliser des donnees anonymisees et agregees pour ameliorer le service.

**8**

**Droit applicable et juridiction  [IMPORTANT]**

Les presentes CGU sont soumises au droit ivoirien. Tout litige sera soumis a la competence exclusive des tribunaux d'Abidjan, sauf accord amiable prealable.

**05  Identite de marque**

## **5.1 Nom — verification de disponibilite**
**Verification**

**A faire**

**Organisme**

**Delai**

**Budget**

Nom de domaine identis.ci

Verifier disponibilite + reserver

NIC-CI (nic.ci)

Immediat

~15 000 FCFA/an

Nom de domaine identis.africa

Verifier + reserver en backup

Registrar international

Immediat

~10 000 FCFA/an

Marque 'IDENTIS' en CI

Depot marque INAPI

INAPI Abidjan

3 a 6 mois

~100 000 FCFA

Marque OAPI (zone UEMOA)

Depot marque OAPI si expansion

OAPI Yaounde

6 a 12 mois

~300 000 FCFA

Profil LinkedIn Identis

Creer page entreprise

LinkedIn

Immediat

0 FCFA

Handle @identis_ci sur X

Reserver le handle

X (Twitter)

Immediat

0 FCFA

## **5.2 Options de nom alternatives**
Si 'Identis' est indisponible en marque ou domaine, voici les alternatives evaluees.

**Nom**

**Disponibilite estimee**

**Points forts**

**Points faibles**

Identis

A verifier INAPI

Court, professionnel, evocateur

Peut exister ailleurs

Verifci

Probablement libre

Ancre CI, descriptif

Trop local, limite UEMOA

Identiis

Probablement libre

Variante distinctive

Double i peu naturel

Konfirm

A verifier

Verbe d'action, moderne

Orthographe non standard

TrustPass

A verifier

Anglophone, universel, evoque confiance

Moins local, moins CI

## **5.3 Tagline — options**
**Tagline**

**Angle**

**Usage recommande**

Verifiez en confiance

Emotion — confiance

Marketing grand public, agences immo

La conformite KYC pour l'Afrique

Marche — UEMOA

Pitch investisseurs, contexte B2B

Votre identite, verifiee en secondes

Rapidite — candidat

Flow candidat, landing page

Le KYC qui comprend votre terrain

Localite — differenciateur

Prospection fintechs CI

Recommandation : 'Verifiez en confiance' pour le grand public et les agences immo. 'La conformite KYC pour l'Afrique' pour le pitch B2B fintechs et investisseurs. Les deux coexistent selon le contexte.

## **5.4 Identite visuelle minimum**
- **Couleur principale : **#2563EB (Bleu) — confiance, technologie, serieux
- **Couleur secondaire : **#1B3A6B (Bleu nuit) — profondeur, solidite
- **Typographie : **Inter pour le web (Google Fonts), Arial pour les documents Word
- **Logo : **Wordmark 'Identis' avec accent sur le 'i' (point remplace par une empreinte ou un check) — a designer
- **Ton de communication : **Direct, rassurant, professionnel sans etre froid. Francais standard, pas de jargon technique dans les messages clients

**06  Securite et reponse aux incidents**

## **6.1 Perimetre de securite — ce qu'on protege**
**Asset**

**Classification**

**Mesures de protection**

Photos biometriques (CNI, selfie)

CRITIQUE

R2 chiffre AES-256, URL signee 15 min, suppression 90 jours

Cles API workspace

CRITIQUE

Hash bcrypt, prefix unique, jamais en clair en base

JWT secrets

CRITIQUE

Variables d'environnement, rotation mensuelle

Donnees formulaire candidat

SENSIBLE

PostgreSQL chiffre at-rest, acces workspace uniquement

Credentials Smile ID

CRITIQUE

Variables d'environnement, jamais en code source

Credentials Wave/Orange Money

CRITIQUE

Variables d'environnement, jamais en code source

Logs applicatifs

INTERNE

Sentry — pas de donnees personnelles dans les logs

Code source

CONFIDENTIEL

Repository prive GitHub, acces restreint

## **6.2 Plan de reponse a une breche de donnees**
Procedure obligatoire en cas de suspicion ou confirmation de compromission de donnees biometriques.

**H+0**

**Detection et confinement immediat**

- Isoler le composant compromis (couper l'acces R2, revoquer les cles API si necessaire)
- Alerter le fondateur et le responsable technique immediatement (WhatsApp + appel)
- Creer un ticket d'incident prive sur GitHub avec toutes les informations disponibles
- Ne pas communiquer publiquement avant evaluation complete

**H+2**

**Evaluation de l'impact**

- Identifier quels workspaces et quels candidats sont potentiellement affectes
- Determiner la nature des donnees exposees (photos, formulaire, cles API)
- Evaluer si la breche est confirmee ou seulement suspectee
- Documenter la chronologie de l'incident

**H+4**

**Notification des parties**

- Si breche confirmee : notifier les workspaces affectes par email et WhatsApp
- Contenu de la notification : nature des donnees exposees, mesures prises, conseils
- Si donnees biometriques exposees : notification ARTCI obligatoire dans les 72h (loi CI)
- Mettre a jour status.identis.ci avec un message transparent

**H+24**

**Resolution et communication**

- Corriger la vulnerabilite et deployer le patch
- Forcer la rotation de toutes les cles API potentiellement exposees
- Publier un post-mortem transparent sur le blog ou par email aux clients
- Proposer une compensation aux workspaces affectes (credit wallet)

## **6.3 Checklist securite avant mise en production**
**Verification**

**Responsable**

**Statut**

Aucun secret (cle, mot de passe) dans le code source git

Tech lead

A verifier

Variables d'environnement toutes definies en production

Tech lead

A verifier

HTTPS actif sur tous les endpoints (Certbot/Let's Encrypt)

Infra

A verifier

Headers de securite HTTP (Helmet.js) actifs

Tech lead

A verifier

Rate limiting Nginx configure (100 req/min par IP)

Infra

A verifier

ClamAV sidecar actif et a jour

Infra

A verifier

Sentry configure et recevant des evenements de test

Tech lead

A verifier

Uptime Robot configure sur /health

Fondateur

A verifier

Backup PostgreSQL quotidien configure et teste

Infra

A verifier

WorkspaceScopeGuard teste sur tous les endpoints metier

Tech lead

A verifier

Aucune donnee personnelle dans les logs Sentry

Tech lead

A verifier

URLs R2 en lecture directe desactivees (signeduniqueement)

Tech lead

A verifier

Test de penetration basique effectue (OWASP Top 10)

Fondateur

A verifier

Declaration ARTCI deposee

Fondateur

A verifier

CGU validees par avocat et en ligne

Fondateur

A verifier

## **6.4 Politique de pentest**
- **MVP (avant lancement) : **test OWASP Top 10 manuel par le fondateur ou un contact technique de confiance. Budget : 0 a 100 000 FCFA.
- **Phase 2 (apres 10 clients) : **pentest externe par un prestataire specialise. Budget estime : 300 000 a 500 000 FCFA.
- **Annuel ensuite : **audit de securite annuel obligatoire, resultat partage avec les clients Dedicated sur demande.
- **Bug bounty (Phase 3) : **programme de signalement de vulnerabilites avec recompense. Plateforme HackerOne ou equivalent.

_Document confidentiel — Identis Documents Complementaires v1.0 — Mai 2026_