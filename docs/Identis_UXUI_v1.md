**IDENTIS**

**UX / UI Design System**

_Architecture des surfaces, flows utilisateurs et principes de design_

Bento Grid  |  Tailwind CSS  |  shadcn/ui

Version

**1.0 — MVP**

Date

**Mai 2026**

Stack UI

**Tailwind + shadcn/ui**

Grid System

**Bento Grid**

# **1. Principes de design**
Identis n'est pas un outil grand public. C'est un outil professionnel utilise quotidiennement par des agents terrain, des responsables conformite, et des developpeurs. Le design doit servir l'efficacite avant l'esthetique.

**Clarte**

L'information importante est visible en un coup d'oeil. Pas de decoration inutile.

**Rapidite**

L'agent terrain complete un screening en moins de 3 minutes.

**Confiance**

L'UI inspire le serieux. Le client doit avoir confiance dans les resultats.

**Resilience**

Fonctionne sur 3G, Android 8+, ecrans 5 pouces.

## **1.1 Stack UI retenu**
**Element**

**Choix**

**Justification**

Framework CSS

Tailwind CSS v4

Utilitaire, rapide, pas de CSS custom a maintenir

Composants

shadcn/ui

Accessibles, non-opinies, copiables dans le projet

Grid system

Bento Grid

Dashboard moderne, cartes respirantes, hierarchy visuelle claire

Icones

Lucide React

Inclus dans shadcn/ui, cohesion visuelle garantie

Typographie

Inter (Google Fonts)

Lisible sur ecrans basse resolution, supporte les diacritiques francais

Graphiques

Recharts

Leger, compose, compatible React/Next.js

Animations

Tailwind animate + tw-animate-css

Micro-interactions subtiles, pas de librairie lourde

## **1.2 Palette de couleurs**
**Brand Dark**

#1B3A6B

**Brand Primary**

#2563EB

**Brand Light**

#DBEAFE

**Texte**

#111827

**Surface**

#F3F4F6

**Succes**

#D1FAE5

**Attention**

#FEF3C7

**Danger**

#FEE2E2

**Info**

#EDE9FE

**Card**

#FFFFFF

# **2. Architecture des surfaces**
Identis expose trois surfaces d'acces complementaires. Chacune cible un profil utilisateur distinct et s'adapte a son contexte d'usage.

**01**

**Web App — Dashboard (Next.js)**

Interface principale. Accessible depuis un navigateur desktop ou tablette. Cible les responsables, compliance officers, admins workspace et developpeurs. Dense en information, optimisee pour la prise de decision.

**02**

**Mobile PWA — App Agent (Next.js PWA)**

Application web progressive installable sur Android. Cible les agents terrain IMF et immobiliers. Interface epuree, actions en 3 taps maximum, optimisee pour 3G et ecrans 5 pouces.

**03**

**Flow Candidat — Lien unique (Next.js)**

Page standalone ouverte depuis un lien WhatsApp/SMS. Aucune installation, aucun compte requis. Cible le candidat final (locataire, emprunteur). Ultra-simple, rassurant, conforme ARDP.

**04**

**API Dashboard — Espace developpeur**

Section du web app dediee aux integrateurs. Gestion des cles API, logs en temps reel, documentation interactive, webhooks. Inspiration : dashboards Stripe / Supabase.

## **2.1 Modele multi-tenant avec Dedicated**
**Type de tenant**

**Hebergement**

**Visibilite admin**

**Cible**

Cloud (mutualisé)

Serveurs Identis

Usage + statut + licence

Fintechs, IMF, agences

Dedicated

Serveurs du client

Statut + licence + heartbeat uniquement

Grandes banques, institutions

Dans les deux cas, le workspace est enregistre dans l'ecosysteme Identis. Le client Dedicated reste visible dans le super-admin — statut de licence, date d'expiration, derniere connexion — mais ses donnees ne quittent jamais son infra.

# **3. Web App — Dashboard**
## **3.1 Structure de navigation**
**Section**

**Contenu**

**Acces**

Dashboard

KPIs Bento, dossiers recents, alertes actives, pipeline rapide

Tous les roles

Dossiers

Liste complete, filtres, recherche, statuts, scores

Tous les roles

Nouveau dossier

Initiation agent-direct ou generation lien unique

Agent, Admin

Workflow

Vue Kanban du pipeline, actions par etape

Responsable, Compliance

Analytics

Graphiques volume, scores moyens, temps traitement

Admin, Directeur

Configuration

Rule Engine, Form Builder, Workflow, Equipe

Admin uniquement

API & Dev

Cles API, webhooks, logs, documentation

Developpeur, Admin

Parametres

Branding workspace, notifications, facturation

Admin uniquement

## **3.2 Dashboard principal — Bento Grid**
Le dashboard est la page d'accueil. Il doit permettre au responsable de saisir l'etat global de son workspace en moins de 10 secondes.

**Dossiers en cours**

_Liste des 5 derniers dossiers actifs avec statut et score. Acces rapide au detail._

**Score moyen**

_Indicateur circulaire. Tendance sur 30 jours. Couleur dynamique vert/orange/rouge._

**Alertes actives**

_Dossiers bloques, doublons detectes, delais depasses._

**Pipeline workflow**

_Vue compacte Kanban : Soumis / En revision / Valide / Rejete. Nombre de dossiers par colonne._

**Volume 30j**

_Sparkline graphique. Total verifications. Comparaison mois precedent._

**Equipe active**

_Agents connectes aujourd'hui. Derniere action par membre._

**Lancer un screening**

_Bouton CTA principal. Mode agent-direct ou generation lien. Toujours visible._

**Taux d'approbation**

_Pourcentage dossiers approuves. Ventilation par score. Graphique donut._

**Expiration licence**

_Date de renouvellement. Quota verifications restantes. Lien upgrade._

Chaque carte Bento est un composant shadcn/ui Card independant. La grille utilise CSS Grid avec gap-4 et des colspan variables selon la taille de l'ecran. Sur mobile, les cartes s'empilent en colonne unique.

## **3.3 Liste des dossiers**
Vue centrale du produit. Chaque membre de l'equipe y revient plusieurs fois par jour.

### **Composants cles**
- Barre de recherche + filtres (statut, score, date, agent) en haut de page
- Tableau avec colonnes : ID dossier / Nom / Score / Statut / Etape workflow / Initiateur / Date / Actions
- Badge couleur sur le score : vert 70-100 / orange 40-69 / rouge 0-39
- Badge statut : En cours / En revision / Approuve / Rejete / Expire
- Actions rapides inline : Voir detail / Approuver / Escalader
- Pagination ou scroll infini selon le volume

## **3.4 Detail d'un dossier**
Page la plus dense du produit. Elle regroupe toutes les informations d'un dossier en un seul endroit.

**Colonne gauche (60%)**

- Identite verifiee (photo CNI + selfie cote a cote)
- Score de risque avec detail des regles declenchees
- Resultats Smile ID (liveness, document, AML)
- Donnees du formulaire additionnel
- Documents uploades (fiche de paie, etc.)

**Colonne droite (40%)**

- Etape workflow actuelle + historique
- Actions disponibles : Approuver / Rejeter / Escalader
- Zone commentaires avec auteur et horodatage
- Timeline audit trail (qui a fait quoi et quand)
- Bouton export PDF rapport final

# **4. Mobile PWA — App Agent**
L'app agent est la surface la plus critique pour l'adoption terrain. Un agent IMF qui jongle avec un client en face de lui n'a pas le temps de naviguer dans des menus complexes.

Choix technique : PWA (Progressive Web App) avant React Native. Meme codebase Next.js, installable depuis le navigateur Android, fonctionne offline partiel. React Native natif est prevu post-MVP si l'adoption mobile le justifie.

## **4.1 Regles UX mobile strictes**
- Maximum 3 taps pour lancer un screening
- Bouton d'action principal toujours visible (sticky bottom bar)
- Pas de tableau dense — cartes empilees uniquement
- Textes minimum 16px — lisibles en plein soleil
- Feedback immediat sur chaque action (pas de spinner silencieux)
- Mode offline : file d'attente locale si perte reseau, sync auto au retour
- Optimise pour une seule main — elements CTA en zone de pouce

## **4.2 Ecrans de l'app agent**
**Ecran**

**Contenu**

**Composant shadcn**

Accueil agent

File de dossiers assignes. Score rapide. Bouton CTA 'Nouveau screening'

Card + Badge + Button

Choix du mode

2 options larges : Scanner CNI moi-meme / Envoyer lien au client

RadioGroup stylise

Scan CNI

Interface camera native. Cadre de recadrage. Auto-detection document.

Dialog + Camera API

Selfie liveness

Instructions claires. Compte a rebours. Indicateur de qualite.

Progress + Alert

Formulaire

Champs du Form Builder. Un champ par ecran sur mobile.

Form + Input + Select

Resultats

Score large centre. Badge couleur. Resume des regles declenchees.

Card + Badge gros

Generation lien

Lien copie-colle + bouton Partager WhatsApp natif. Expiration visible.

Input + Button share

Mes dossiers

Liste chronologique. Filtre statut. Indicateur dossiers en attente.

Tabs + Card list

# **5. Flow Candidat — Lien unique**
Le flow candidat est la seule surface publique d'Identis. Il est ouvert depuis un lien WhatsApp ou SMS. Le candidat n'a pas de compte, ne connait pas Identis, et peut etre mefiant.

Objectif UX : le candidat doit comprendre en 5 secondes pourquoi on lui demande ces informations, et avoir confiance avant de prendre une photo de sa CNI.

## **5.1 Principes specifiques au flow candidat**
- Branding du workspace visible immediatement (logo + nom de l'organisation)
- Explication claire du contexte : 'Immo Prestige Abidjan vous demande une verification d'identite pour votre candidature de location'
- Consentement ARDP explicite avec texte simple, pas juridique
- Progress bar visible — le candidat sait ou il en est
- Pas de compte a creer, pas de mot de passe
- Confirmation SMS/WhatsApp a la fin
- Lien expire clairement indique — cree l'urgence sans stresser

## **5.2 Steps du flow candidat**
**1**

**Accueil contextualise**

Logo + nom du workspace. Message d'explication du motif. Temps estime : 3 minutes. Bouton 'Commencer'. Lien expiration visible.

**2**

**Consentement ARDP**

Texte de consentement en francais simple. Case a cocher explicite. Lien vers politique de confidentialite. Impossible de continuer sans consentement.

**3**

**Photo CNI recto**

Instructions visuelles. Cadre de recadrage. Conseils : bonne lumiere, pas de reflet. Validation automatique de la lisibilite.

**4**

**Photo CNI verso**

Meme interface. Indication que les deux faces sont necessaires.

**5**

**Selfie liveness**

Instructions animees simples. Le candidat tourne legerement la tete. Indicateur de detection en temps reel.

**6**

**Formulaire additionnel**

Champs configures par le workspace. Un champ par ecran. Labels clairs avec indication du pourquoi si necessaire.

**7**

**Recapitulatif**

Resume de ce qui a ete soumis. Bouton 'Confirmer et envoyer'. Derniere chance de corriger.

**8**

**Confirmation**

Ecran de succes. Message personnalise du workspace. Confirmation SMS/WhatsApp envoyee. Aucun score ou resultat affiche au candidat.

Le candidat ne voit jamais son score. Il recoit uniquement une confirmation de reception. Le score est reserve aux agents et validateurs internes du workspace.

# **6. Flows utilisateurs detailles**
## **6.1 Flow — Agent initie un dossier directement**
**1**

**Agent ouvre l'app mobile**

Page d'accueil avec sa file de dossiers. Il tape 'Nouveau dossier'.

**2**

**Choix du mode**

Deux options : 'Client present — je scanne' ou 'Client absent — envoyer un lien'. Il choisit 'Client present'.

**3**

**Scan de la CNI**

L'agent pointe la camera sur la CNI du client. Scan automatique. Donnees pre-remplies.

**4**

**Selfie liveness**

L'agent tend le telephone au client. Le client fait le selfie. L'agent reprend le telephone.

**5**

**Formulaire**

L'agent remplit les champs additionnels (revenus, employeur...) en interrogeant le client.

**6**

**Soumission**

L'agent soumet. Resultat Smile ID en 5 secondes. Score calcule. Dossier entre dans le workflow.

**7**

**Resultat immediat**

Badge vert/orange/rouge. Score. Regles declenchees. L'agent informe verbalement le client.

## **6.2 Flow — Agent envoie un lien au client**
**1**

**Agent cree un dossier**

Il renseigne le nom du client et le contexte (ex : 'Appartement Cocody Angre - Candidat Koné').

**2**

**Generation du lien**

Lien unique genere. Duree d'expiration configurable (ex : 48h). Bouton 'Copier' et 'Partager sur WhatsApp'.

**3**

**Client complete son flow**

Le client ouvre le lien sur son telephone. Il fait les etapes 1 a 8 du flow candidat.

**4**

**Notification agent**

L'agent recoit une notification WhatsApp ou push : 'Kone a complete sa verification — Score 78/100'.

**5**

**Dossier entre en workflow**

Le dossier est automatiquement route selon le score. Le responsable prend le relais.

## **6.3 Flow — Responsable valide un dossier**
**1**

**Notification recue**

Le responsable recoit une alerte : 'Nouveau dossier en attente de revision — Score 55/100'.

**2**

**Ouverture du detail**

Il ouvre le dossier. Voit la photo CNI, le selfie, le score, les regles declenchees et le formulaire.

**3**

**Examen des donnees**

Il consulte les resultats Smile ID, verifie les documents uploades, lit les champs du formulaire.

**4**

**Decision**

Trois options : Approuver avec commentaire / Rejeter avec motif / Escalader au directeur.

**5**

**Audit trace**

Sa decision, son commentaire et l'horodatage sont ajoutes a la timeline du dossier.

**6**

**Notification compliance**

Si approuve, le compliance officer est notifie pour le sign-off final.

# **7. Configuration workspace**
La section Configuration est reservee aux admins du workspace. C'est la partie la plus complexe de l'UI — elle doit rester comprehensible pour un responsable sans background technique.

## **7.1 Rule Engine — Interface de configuration**
**Interface de creation de regle**

- Dropdown 'Si' : liste des conditions disponibles
- Operateur : >, <, =, contient, est dans
- Valeur : champ numerique ou selection
- Consequence : malus X pts / blocage / alerte
- Toggle actif/inactif sans supprimer la regle

**Vue d'ensemble des regles**

- Liste de toutes les regles avec statut actif/inactif
- Impact estime : 'Cette regle a affecte X dossiers'
- Seuils de score configurables : vert/orange/rouge
- Bouton simulation : 'Tester sur les 30 derniers dossiers'
- Choix du template de depart (IMF, immo, fintech, custom)

## **7.2 Form Builder — Interface de configuration**
- Vue drag-and-drop des champs (reordonnement par glisser-deposer)
- Sidebar droite : parametres du champ selectionne (label, obligatoire, options)
- Preview live du formulaire tel que le candidat le verra
- Blocs fixes CNI + Selfie non modifiables, visuellement distincts (cadenas)
- Bouton 'Charger un template' pour demarrer depuis IMF / Immo / Fintech
- Bouton 'Tester le formulaire' — l'admin peut le remplir lui-meme pour valider

## **7.3 Workflow Builder — Interface de configuration**
- Vue lineaire des etapes avec fleches de progression
- Ajout / suppression / reordonnement d'etapes
- Par etape : nom, role responsable, delai maximum, action si delai depasse
- Visualisation : 'Un dossier score 55 passera par Etape 1 → Etape 2 → Compliance'
- Mode test : simuler un dossier fictif dans le workflow

## **7.4 Branding workspace**
**Element**

**Description**

**Composant shadcn**

Logo

Upload image PNG/SVG. Affiché en-tête dashboard et rapports PDF.

Avatar + Input file

Couleur principale

Color picker. Appliquée aux boutons et accents.

Input color + preview

Nom organisation

Affiché dans le flow candidat et les rapports.

Input text

Sous-domaine

workspace.identis.ci — configurable par l'admin Identis.

Input + badge statut

Message accueil candidat

Texte personnalisé affiché page 1 du flow candidat.

Textarea + preview

# **8. Espace developpeur — API Dashboard**
Inspire des dashboards Stripe et Supabase. Le developpeur fintech doit pouvoir s'integrer et debugger sans jamais contacter le support.

**Section**

**Contenu**

**Priorite MVP**

Cles API

Generation, rotation, revocation des cles. Environnements sandbox / production.

Sprint 2

Logs en temps reel

Chaque appel API logge avec requete, reponse, statut, duree. Filtre par type.

Sprint 2

Webhooks

Ajout d'endpoints. Test manuel. Historique des envois et statuts.

Sprint 2

Usage & quotas

Graphique de consommation. Quota restant. Alertes seuil.

Sprint 3

Documentation

Reference API integree. Exemples de code NestJS / Node / Python.

Sprint 2

Sandbox

Donnees de test CI predefinies. Reset de l'environnement en un clic.

Sprint 1

# **9. Composants shadcn/ui identifies**
Liste des composants shadcn/ui a installer et utiliser par surface.

**Composant**

**Usage dans Identis**

Card

Toutes les cartes Bento dashboard, cartes dossiers, cartes metriques

Badge

Statuts dossiers, scores, tags de role, indicateurs actif/inactif

Button

Actions principales et secondaires, CTA mobile sticky

Table

Liste des dossiers, logs API, historique audit trail

Dialog / Sheet

Confirmation d'actions, detail rapide d'un dossier, formulaire mobile

Tabs

Navigation sections configuration, filtres dossiers

Select / Combobox

Filtres, choix de template, selection de role dans workflow

Form + Input

Formulaires Form Builder, parametres workspace, creation de regle

Progress

Etapes du flow candidat, barre de quota

Alert / Toast

Notifications actions, erreurs API, confirmations

Avatar

Photo CNI, selfie candidat, membres equipe

Separator

Divisions de sections dans le detail dossier

Skeleton

Loading states des cartes Bento et listes

Command

Recherche globale (Cmd+K), recherche dossiers

Collapsible

Detail des regles declenchees dans le score, timeline audit trail

Calendar / DatePicker

Filtres par date, configuration expiration lien, date de licence

# **10. Ordre de build UI**
Chaque sprint livre des ecrans fonctionnels et utilisables. Pas de design sans implementation derriere.

**Sprint**

**Ecrans livres**

**Surface**

Sprint 1

Flow screening agent-direct (scan CNI + selfie + resultat)
Page resultat vert/orange/rouge
Dashboard minimal (liste dossiers)Mobile PWA + Web

Sprint 2

Flow generation lien unique
Flow candidat complet (8 etapes)
Espace developpeur (cles API + sandbox)Mobile + Public + Web

Sprint 3

Dashboard Bento complet
Detail dossier avec audit trail
Workflow Kanban
NotificationsWeb + Mobile

Sprint 4

Configuration Rule Engine
Form Builder drag-and-drop
Workflow Builder
Branding workspaceWeb

Post-MVP

Analytics avances
Admin super-tenant
Dedicated instance dashboard
React Native natifWeb + Mobile

# **Synthese**
Un seul codebase Next.js livre trois surfaces : le dashboard web, la PWA mobile agent, et le flow candidat. Tailwind CSS + shadcn/ui garantit la coherence visuelle sans ecrire de CSS custom. Le Bento Grid est reserve au dashboard desktop — sur mobile tout s'empile en colonne unique.

## **Ce que ce document ne couvre pas encore**
- Les wireframes haute fidelite — a produire en Figma ou directement en code
- Les animations et micro-interactions specifiques
- Le design des emails transactionnels
- L'interface super-admin Identis (gestion de tous les workspaces)

## **Prochaine etape**
Produire les premiers composants React en code — en commencant par le dashboard Bento et le flow screening mobile. Le design se valide dans le navigateur, pas dans Figma.

_Document confidentiel — Identis UX/UI v1.0 — Mai 2026_