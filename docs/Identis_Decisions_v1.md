**IDENTIS**

**Decisions Produit & Legal**

_Reponses aux questions critiques — donnees, provider, formulaire, workflow, technique, legal_

26 decisions documentees | 6 blocs thematiques

Version

**1.0**

Date

**Mai 2026**

Statut

**Decisions validees**

# **Introduction**

Ce document centralise toutes les decisions critiques prises sur le produit Identis avant le debut du developpement. Chaque decision repond a une question reelle identifiee lors de la phase de conception. Elle est documentee avec sa justification, ses consequences et son statut.

Une decision documentee vaut mieux que dix debats repetes. Ce document est la reference en cas de doute — il evite de repasser par les memes questions pendant le developpement.

**Statut**

**Signification**

TRANCHEE — implementer

Decision finale, pas de retour en arriere sans nouveau document

TRANCHEE — action requise

Decision prise mais necessite une action externe (avocat, partenaire, etc.)

A VALIDER — avant lancement

Decision de principe, a confirmer avec un expert ou un client

OUVERTE — Phase 2+

Pas de decision MVP, sera revisitee ulterieurement

# **Bloc 1 — Donnees et vie privee**

**D-01 Qui est responsable des donnees biometriques vis-a-vis de l'ARDP ?**

Double responsabilite partagee selon le modele sous-traitant / responsable de traitement. Identis est sous-traitant : on traite les donnees pour le compte du workspace. Le workspace est responsable de traitement vis-a-vis de son candidat. Ce modele est formalise dans un DPA (Data Processing Agreement) standard accepte a l'inscription — pas un contrat negocie separe.

- Modele de reference : Stripe avec ses marchands (meme architecture legale)
- Le DPA est une annexe des CGU, pas un document separe
- Le workspace signe le DPA en acceptant les CGU a l'inscription

**Decision : **TRANCHEE — action requise : faire rediger le DPA par un avocat CI avant le lancement. Budget estime 150 000 a 300 000 FCFA.

**D-02 Si un candidat demande la suppression de ses donnees, qui gere ?**

Le candidat s'adresse a son workspace (l'organisation qui l'a verifie). Le workspace declenche la suppression via le dashboard Identis (bouton 'Supprimer le dossier') ou via l'API DELETE /cases/:id. Cette action supprime : photos CNI sur R2, selfie sur R2, donnees du formulaire (formData). Identis conserve uniquement les metadonnees non-personnelles — score anonymise, date, product utilise — pour son propre audit comptable.

- Delai de traitement maximum : 72 heures apres demande au workspace
- Le workspace est responsable de traiter la demande — Identis lui fournit l'outil
- Log de la suppression conserve (sans donnees personnelles) pour preuve de conformite

**Decision : **TRANCHEE — implementer : endpoint DELETE /cases/:id avec suppression en cascade R2 + formData des Sprint 1.

**D-03 Combien de temps conserve-t-on les photos biometriques ?**

90 jours par defaut, suppression automatique via job cron. L'admin workspace peut reduire ce delai dans ses parametres (30 jours minimum) mais ne peut pas l'augmenter au-dela de 90 jours sans justification reglementaire documentee soumise a Identis. Cette politique est affichee clairement dans le dashboard et dans le rapport PDF de chaque dossier.

- Choix 90 jours : delai conservateur, couvre la majorite des besoins audit client
- Le rapport PDF final est conserve indefiniment — pas les photos brutes
- Les donnees formulaire (revenus, employeur) suivent la meme politique que les photos

**Decision : **TRANCHEE — implementer : job cron quotidien de nettoyage R2 des fichiers expires. Parametres workspace pour la duree.

**D-04 Si un workspace est radie pour non-paiement, que deviennent ses donnees ?**

Processus en 3 etapes avec previs obligatoire. Etape 1 (J0) : suspension acces dashboard et API, workspace notifie par email et WhatsApp. Etape 2 (J0 a J30) : periode de grace — le workspace peut exporter ses donnees et rapports PDF via un acces en lecture seule. Etape 3 (J30) : suppression complete et irreversible de toutes les donnees du workspace.

- Jamais de suppression sans previs minimum 30 jours
- Export des donnees disponible pendant la periode de grace (CSV + PDF)
- Ce processus est documente dans les CGU et rappele a l'inscription

**Decision : **TRANCHEE — implementer : module de suspension avec acces lecture seule et job de suppression a J+30.

**D-05 Les donnees des clients Cloud sont-elles isolees physiquement ou logiquement ?**

Isolation logique uniquement en mode Cloud mutualisé. L'isolation est garantie par workspaceId present sur chaque entite Prisma, les guards NestJS qui verifient l'appartenance au workspace sur chaque requete, et les queries Prisma qui filtrent systematiquement par workspaceId. L'isolation physique (base de donnees separee par client) n'est pas prevue en Cloud — elle est reservee aux clients Dedicated.

- Ce choix est documente dans les CGU — on ne survend pas la securite
- Les clients qui exigent l'isolation physique sont orientes vers l'offre Dedicated
- Audit de securite prevu avant ouverture publique (Phase 2)

**Decision : **TRANCHEE — implementer : WorkspaceScopeGuard applique des Sprint 1 sur tous les endpoints metier. Ne pas attendre.

# **Bloc 2 — Smile ID et provider KYC**

**D-06 Que se passe-t-il si Smile ID est indisponible ?**

Circuit breaker avec 3 modes configurables par workspace. Mode STRICT : blocage total, aucune verification sans Smile ID — pour les workspaces avec obligations reglementaires strictes. Mode DEGRADE (defaut) : on collecte le formulaire et on met le dossier en file d'attente, Smile ID est relance automatiquement via Bull queue quand le service revient. Mode MANUEL : bypass Smile ID, l'agent valide manuellement avec score plafonne automatiquement a 50/100.

- Bull queue avec retry exponentiel : 5min, 15min, 1h, 4h, 24h
- Alerte Sentry + notification admin workspace si Smile ID down > 10 minutes
- Page de statut status.identis.ci affiche l'etat du provider en temps reel

**Decision : **TRANCHEE — implementer : circuit breaker Sprint 2, mode DEGRADE par defaut, mode configurable par workspace.

**D-07 Smile ID peut changer ses tarifs — comment on se protege ?**

Deux niveaux de protection. Niveau contractuel : negocier un contrat Smile ID avec tarifs bloques 12 mois minimum avant le lancement commercial. Niveau architectural : la marge actuelle de 58 a 70% constitue un coussin suffisant pour absorber une hausse tarifaire sans impacter la rentabilite a court terme. L'architecture technique abstrait le provider derriere une interface IVerificationProvider — un second provider peut etre integre sans refonte.

- Interface IVerificationProvider : verifyDocument(), checkLiveness(), checkAML()
- Smile ID implementation de cette interface — Verichap peut l'implementer en P2
- Si Smile ID +50% : on repercute sur le pricing client avec 30 jours de preavis

**Decision : **TRANCHEE — action requise : negocier le contrat Smile ID avant Sprint 1. Interface IVerificationProvider a implementer des Sprint 1.

**D-08 Faux negatif Smile ID — CNI valide rejetee — qui est responsable ?**

Identis n'est pas un garant d'identite. On est un outil d'aide a la decision. Deux protections formelles : CGU claires ('Identis ne garantit pas l'authenticite des informations declarees, uniquement la conformite des documents au moment de la verification') et mention systematique sur chaque rapport PDF genere. Le workflow prevoit une etape de revision manuelle precisement pour traiter les cas limites et les faux negatifs.

- Modele de reference : meme position que les agences de notation ou les cabinets d'audit
- Le validateur humain dans le workflow est la securite finale contre les faux negatifs
- Log de chaque cas de revision manuelle pour constituer un historique de qualite Smile ID

**Decision : **TRANCHEE — action requise : mention disclaimer a inclure dans les CGU (avocat) et dans le template PDF de rapport.

**D-09 Doit-on prevoir un second provider KYC en backup ?**

Oui — decision d'architecture des le MVP, meme si un seul provider est utilise au lancement. On implemente une interface abstraite IVerificationProvider que Smile ID respecte. Verichap (solution locale CI/UEMOA) est identifie comme candidat backup. Le workspace ne choisit pas son provider dans le MVP — c'est Identis qui gere. L'ouverture du choix de provider est prevue en Phase 3.

- Avantage negociation : avoir un backup credible renforce la position vis-a-vis de Smile ID
- Verichap : solution locale, connait les documents CI/UEMOA, potentiel partenariat
- Le switch de provider est transparent pour le client — aucun changement d'API

**Decision : **TRANCHEE — implementer : interface abstraite Sprint 1. Verichap integration Sprint P3.

# **Bloc 3 — Formulaire dynamique et fichiers**

**D-10 Le formulaire est-il vraiment adapte a tout type de client ?**

Oui — c'est la separation fondamentale du produit. Smile ID repond a la question 'Est-ce que cette personne est bien celle qu'elle pretend etre ?' — c'est fixe et universel. Le formulaire dynamique repond a la question 'Quelles informations metier ai-je besoin pour ma decision ?' — c'est variable et sectoriel. Les deux sont independants. Une fintech peut utiliser Smile ID sans aucun formulaire. Une IMF veut Smile ID plus un formulaire credit complet.

- Smile ID = couche de verification biometrique universelle
- Formulaire = couche de collecte metier sectorielle
- Score global = agregation des deux sources (resultat Smile ID + donnees formulaire)

**Decision : **TRANCHEE — implementer : Form Builder independant du flux Smile ID. Les champs fixes CNI + Selfie sont toujours presents, le reste est optionnel.

**D-11 Comment le formulaire et le score influencent-ils Smile ID ?**

Ils ne l'influencent pas. Smile ID est appele en premier, il renvoie son resultat biometrique brut. Ce resultat est une entree parmi d'autres dans le Rule Engine d'Identis. Le Rule Engine combine le resultat Smile ID (liveness score, document valide, AML match) avec les donnees du formulaire (revenu, anciennete, situation pro) pour calculer un score global sur 100. Smile ID ne sait pas comment on utilise son resultat.

- Score Identis (0-100) = agregation Rule Engine de toutes les sources disponibles
- Le score Smile ID brut (liveness, match) est visible dans le detail du dossier
- Un client peut configurer le poids relatif de chaque source dans ses regles

**Decision : **TRANCHEE — documenter : diagramme de flux clair dans la doc technique. Le score Identis n'est pas le score Smile ID.

**D-12 Quelle taille maximum pour les fichiers uploades ? Qui paie le stockage ?**

Limites par defaut : 5 MB par fichier, 3 fichiers maximum par dossier, types acceptes PDF/JPG/PNG uniquement. Au-dela, l'upload est refuse avec message d'erreur explicite. Le cout R2 est absorbe dans le pricing des verifications — estime negligeable aux volumes MVP. A partir de 10 000 dossiers par mois, une politique de stockage separe sera introduite. Le workspace ne paie pas le stockage separement dans le MVP.

- 5 MB par fichier couvre 99% des fiches de paie et documents courants en CI
- Limite 3 fichiers par dossier evite l'abus de stockage sans bloquer les cas reels
- Les photos CNI et selfie (geres par Smile ID) ne comptent pas dans ce quota

**Decision : **TRANCHEE — implementer : validation cote serveur (pas seulement frontend) des limites. Revision en Phase 3 si volume justifie.

**D-13 Valide-t-on le contenu du document uploade (est-ce vraiment une fiche de paie) ?**

Non dans le MVP — validation semantique trop complexe et couteuse pour ce stade. On fait uniquement : validation du type MIME, scan antivirus ClamAV en sidecar Docker, renommage en UUID (pas de nom original conserve), stockage R2 chiffre AES-256. La validation semantique reste a la charge du validateur humain dans le workflow — c'est precisement son role. Une validation par OCR ou IA pourra etre ajoutee en Phase 3 si le besoin client est confirme.

- ClamAV en sidecar Docker : scan antivirus sans service externe payant
- UUID rename : le nom original du fichier n'est jamais conserve ni expose
- URL R2 signee : le fichier n'est jamais accessible directement, toujours via token temporaire

**Decision : **TRANCHEE — implementer : pipeline sanitisation Sprint 2. Validation semantique hors MVP.

**D-14 Que se passe-t-il si un candidat uploade un fichier malveillant ?**

Pipeline de sanitisation sequentiel obligatoire avant tout stockage. Sequence : reception du fichier en memoire (pas de disque) > scan ClamAV > validation type MIME > validation taille > renommage UUID > chiffrement AES-256 > stockage R2 > URL signee en reponse. Si ClamAV detecte une menace : rejet immediat avec message generique au candidat, log d'alerte Sentry, notification admin Identis. Le fichier n'atteint jamais R2.

- Le fichier transite uniquement en memoire RAM — jamais ecriture disque temporaire
- Message generique au candidat : 'Fichier invalide' — pas de detail sur la raison securite
- Trois tentatives maximum avant blocage du token candidat pour ce champ

**Decision : **TRANCHEE — implementer : pipeline complet Sprint 2. ClamAV obligatoire avant mise en production.

**D-15 Pre-rempli-t-on le formulaire depuis les donnees Smile ID ?**

Oui — feature prevue en Sprint 2. Apres le retour Smile ID, les champs correspondants sont pre-remplis automatiquement dans le formulaire : prenom, nom, date de naissance, numero CNI. Le candidat ou l'agent voit ces champs pre-remplis et peut les corriger si besoin. Les champs pre-remplis sont marques visuellement ('Source : CNI verifiee'). Cette feature reduit la friction et les erreurs de double saisie.

- Mapping configurable : le workspace peut desactiver le pre-remplissage si non desire
- Les champs pre-remplis restent editables — le candidat a toujours le dernier mot
- Les corrections apportees par le candidat sont loggues dans l'audit trail

**Decision : **TRANCHEE — implementer : Sprint 2. Mapping champs Smile ID vers champs formulaire configurable par workspace.

# **Bloc 4 — Workflow et responsabilite**

**D-16 Dossier approuve, client frauduleux apres — quelle est la responsabilite d'Identis ?**

Aucune responsabilite sur la fraude post-verification. Identis est un outil d'aide a la decision, pas un garant d'identite. Deux protections formelles : CGU explicites ('Identis verifie la conformite documentaire au moment de la verification et ne garantit pas le comportement futur de la personne verifiee') et mention obligatoire sur chaque rapport PDF ('Document d'aide a la decision. La responsabilite de la decision finale appartient au client Identis.').

- Modele de reference : agences de credit scoring, cabinets d'audit, notaires
- Identis verifie l'identite au moment T — elle ne predit pas le comportement futur
- Le workflow de validation humaine est la protection complementaire pour les cas limites

**Decision : **TRANCHEE — action requise : formulation exacte a valider avec avocat CI avant lancement. Mention PDF a implementer des Sprint 1.

**D-17 Un validateur approuve manuellement un dossier rouge — trace suffisante pour la BCEAO ?**

Oui si on rend le commentaire obligatoire pour tout override manuel. Pour un dossier avec score < 40 (rouge) approuve manuellement, le systeme exige : commentaire de minimum 50 caracteres expliquant la decision, confirmation explicite 'Je confirme approuver ce dossier malgre le score de risque eleve', mention 'OVERRIDE MANUEL — Score XX/100' dans l'audit trail et le rapport PDF. Le compliance officer est notifie automatiquement de tout override rouge.

- L'audit trail stocke : acteur, timestamp, score au moment de la decision, commentaire complet
- Export PDF mensuel de tous les overrides pour le compliance officer
- Alertes automatiques si le taux d'override rouge depasse 10% sur un workspace

**Decision : **TRANCHEE — implementer : modal de confirmation obligatoire pour override rouge. Commentaire min 50 caracteres. Sprint 3.

**D-18 Comment gere-t-on le delai maximum d'une etape dans le workflow ?**

Chaque etape du workflow a un delai maximum configurable (par defaut 48h). Trois comportements au depassement, configurables par etape : ESCALADE (dossier monte a l'etape suivante automatiquement), ALERTE (notification au superieur sans mouvement du dossier), AUTO-APPROBATION (rare, uniquement pour etapes non-critiques). Un job Bull verifie les delais toutes les heures. L'agent initiateur est notifie si son dossier est bloque depuis plus de 24h.

- Delai par defaut 48h couvre la majorite des organisations en CI (week-end inclus)
- L'admin workspace configure le delai par etape — pas de valeur universelle imposee
- Tableau de bord admin : dossiers en retard classes par anciennete

**Decision : **TRANCHEE — implementer : job cron horaire de verification des delais. Sprint 3.

# **Bloc 5 — Technique et scalabilite**

**D-19 Smile ID est asynchrone — comment gere-t-on l'UI pendant l'attente ?**

Deux strategies selon le produit appele. Basic KYC : synchrone, reponse en moins de 3 secondes, l'UI attend avec un spinner. Document Verification + Selfie : asynchrone, Smile ID rappelle via webhook. Dans ce cas, l'agent voit 'Verification en cours...' avec messages rassurants, et le dashboard se met a jour via WebSocket (Socket.io integre NestJS) des que le webhook est recu. Timeout 30 secondes : si Smile ID ne repond pas, mode degrade active automatiquement.

- WebSocket : connexion persistante, mise a jour instantanee sans rechargement de page
- Timeout 30s → mode degrade → dossier PENDING → retry automatique via Bull queue
- L'agent terrain est notifie par WhatsApp quand le resultat est disponible en mode degrade

**Decision : **TRANCHEE — implementer : WebSocket Sprint 2. Pas de polling — trop couteux sur connexion 3G.

**D-20 Un candidat perd sa connexion a mi-flow — peut-il reprendre ?**

Oui — resilience critique pour le terrain africain avec connexions instables. La progression du candidat est sauvegardee en base a chaque etape completee via le champ lastCompletedStep sur l'entite EntryPoint. Si le candidat revient sur le meme lien avant expiration, il reprend exactement a la derniere etape validee. Les photos deja prises sont conservees temporairement en session (15 minutes) pour eviter de refaire le selfie.

- lastCompletedStep : enum des etapes (CONSENT, CNI_FRONT, CNI_BACK, SELFIE, FORM, REVIEW)
- Photos conservees 15 min en session Redis — pas sur R2 avant soumission finale
- Si le lien expire pendant la session, le candidat voit un message explicatif clair

**Decision : **TRANCHEE — implementer : sauvegarde par etape Sprint 2. Feature critique pour adoption terrain.

**D-21 Comment gere-t-on les timeouts Smile ID sans bloquer l'agent terrain ?**

Promise.race entre l'appel Smile ID et un timeout de 30 secondes. Si timeout : le dossier passe en statut PENDING, l'agent voit 'Verification en cours, vous serez notifie' et peut continuer son travail. Bull queue prend le relais avec retry automatique : 5 min, 15 min, 1h, 4h, 24h. Si le retry echoue apres 24h : notification admin Identis et admin workspace, decision manuelle requise. L'agent n'est jamais bloque en attendant Smile ID.

- L'agent peut soumettre plusieurs dossiers en parallele sans attendre les resultats
- Tableau de bord : section 'En attente de verification' visible par l'admin
- SLA interne : 95% des verifications completees en moins de 60 secondes

**Decision : **TRANCHEE — implementer : Promise.race + Bull retry Sprint 1 (infrastructure critique).

**D-22 Le Rule Engine est-il precompile ou evalue a chaque verification ?**

Evalue a chaque verification mais avec cache Redis de 5 minutes. Les regles d'un workspace sont chargees depuis PostgreSQL, compilees en memoire et cachees dans Redis avec la cle rules:{workspaceId}. A chaque modification de regle par l'admin, le cache est invalide immediatement (cache invalidation explicite). Pour les workspaces a tres fort volume (10 000+ verifications par mois), une precompilation statique pourra etre introduite en Phase 3.

- Cache TTL 5 minutes : bon compromis entre fraicheur et performance
- Invalidation immediate sur modification : l'admin voit l'effet de ses regles instantanement
- Mode simulation (tester les regles sur les 30 derniers dossiers) contourne le cache volontairement

**Decision : **TRANCHEE — implementer : cache Redis Sprint 2. Precompilation Phase 3 si besoin confirme.

**D-23 Comment gere-t-on le cas du candidat qui soumet plusieurs fois le meme lien ?**

Le lien unique est a usage unique strict. Des que le candidat soumet son dossier (etape 7 — confirmation), le token passe en statut COMPLETED et ne peut plus etre utilise. Si le candidat tente de rouvrir le lien apres soumission, il voit un message : 'Votre verification a deja ete soumise avec succes. Contactez [nom workspace] pour toute question.' Si l'agent veut une nouvelle verification du meme candidat, il genere un nouveau lien depuis le dashboard.

- Distinction COMPLETED (soumis) vs EXPIRED (delai depasse sans soumission)
- Un candidat peut rouvrir le lien pour reprendre (lastCompletedStep) mais pas resoummettre
- L'agent voit dans son dashboard si le lien a ete ouvert, en cours, ou complete

**Decision : **TRANCHEE — implementer : statut COMPLETED sur soumission, verification du statut a chaque ouverture du lien. Sprint 2.

# **Bloc 6 — Business et legal**

**D-24 Identis a-t-il besoin d'un agrement specifique pour collecter des donnees biometriques en CI ?**

Pas un agrement lourd — une declaration prealable aupres de l'ARTCI (Autorite de Regulation des Technologies de Communication et de l'Information) suffit. La loi ivoirienne n°2013-450 sur la protection des donnees personnelles exige cette declaration pour tout traitement de donnees biometriques. Ce n'est pas un processus long — delai estime 2 a 4 semaines, cout quasi nul. La declaration doit etre faite avant toute mise en production avec de vraies donnees.

- ARTCI : autorite de regulation CI — www.artci.ci
- Declaration distincte de l'immatriculation RCCM — ne pas confondre
- La declaration couvre Identis en tant que sous-traitant — les workspaces ont leur propre obligation

**Decision : **TRANCHEE — action requise : deposer la declaration ARTCI avant Sprint 4 (dernier sprint MVP). Prioritaire.

**D-25 Le modele Pay-as-you-go necessite-t-il un agrement BCEAO comme prestataire de paiement ?**

Non — Identis n'est pas un prestataire de services de paiement au sens de la reglementation BCEAO. On encaisse des frais pour un service logiciel (SaaS), pas des transferts de fonds entre tiers. Wave CI et Orange Money sont nos prestataires de paiement agrees — on utilise leurs APIs en tant que marchands, on ne devient pas nous-memes etablissement de paiement. Ce point doit etre confirme par un juriste specialise en droit UEMOA avant le lancement commercial.

- Position de principe : meme statut qu'un abonnement Canva ou Notion vendu en CI
- Si confirmation negative du juriste : basculer vers facturation annuelle uniquement
- Wallet prepaye = credit de service, pas de monnaie electronique au sens BCEAO

**Decision : **A VALIDER — avant lancement : consultation juriste droit UEMOA. Budget estime 100 000 a 200 000 FCFA pour avis ecrit.

**D-26 Comment se protege-t-on si un workspace utilise Identis pour des activites illicites ?**

Trois niveaux de protection complementaires. Niveau admission : verification de l'existence legale du workspace a l'inscription (RCCM ivoirien ou equivalent) — pas de compte pour une entite non identifiee. Niveau contractuel : clause CGU de resiliation immediate pour usage illicite avec preservation des logs pour les autorites. Niveau operationnel : monitoring des patterns anormaux (volume suspect, types de verifications inhabituels, pics nocturnes) avec alerte admin Identis.

- KYB du workspace : verifier que l'entreprise existe avant activation du compte
- En cas de signalement ou detection : suspension immediate, conservation logs 5 ans, cooperation autorites
- Identis n'est pas responsable des usages tiers mais doit demontrer la due diligence

**Decision : **TRANCHEE — action requise : clause CGU specifique (avocat), et verification RCCM a l'inscription Sprint 4. Monitoring Phase 2.

# **Synthese — Tableau de toutes les decisions**

**ID**

**Sujet**

**Statut**

**Sprint / Phase**

D-01

Responsabilite ARDP : sous-traitant / responsable

TRANCHEE — avocat requis

Avant lancement

D-02

Suppression donnees candidat sur demande

TRANCHEE — implementer

Sprint 1

D-03

Conservation photos biometriques 90 jours

TRANCHEE — implementer

Sprint 1

D-04

Processus radiation workspace impaye

TRANCHEE — implementer

Sprint 2

D-05

Isolation multi-tenant logique uniquement

TRANCHEE — implementer

Sprint 1

D-06

Fallback Smile ID indisponible (mode degrade)

TRANCHEE — implementer

Sprint 2

D-07

Abstraction provider + contrat Smile ID

TRANCHEE — action requise

Avant Sprint 1

D-08

Disclaimer faux negatif dans CGU et PDF

TRANCHEE — avocat requis

Avant lancement

D-09

Interface IVerificationProvider abstraite

TRANCHEE — implementer

Sprint 1

D-10

Formulaire independant de Smile ID

TRANCHEE — implementer

Sprint 1

D-11

Score Identis ≠ score Smile ID

TRANCHEE — documenter

Sprint 2

D-12

Limite upload : 5 MB, 3 fichiers, PDF/JPG/PNG

TRANCHEE — implementer

Sprint 2

D-13

Pas de validation semantique documents MVP

TRANCHEE — hors MVP

Phase 3

D-14

Pipeline sanitisation fichiers malveillants

TRANCHEE — implementer

Sprint 2

D-15

Pre-remplissage formulaire depuis Smile ID

TRANCHEE — implementer

Sprint 2

D-16

Responsabilite fraude post-verification

TRANCHEE — avocat requis

Avant lancement

D-17

Override rouge : commentaire obligatoire 50 car.

TRANCHEE — implementer

Sprint 3

D-18

Gestion delais workflow + escalade auto

TRANCHEE — implementer

Sprint 3

D-19

WebSocket pour resultats asynchrones Smile ID

TRANCHEE — implementer

Sprint 2

D-20

Resilience flow candidat (lastCompletedStep)

TRANCHEE — implementer

Sprint 2

D-21

Timeout Smile ID + Bull retry queue

TRANCHEE — implementer

Sprint 1

D-22

Rule Engine : cache Redis 5 min + invalidation

TRANCHEE — implementer

Sprint 2

D-23

Lien unique a usage unique strict (COMPLETED)

TRANCHEE — implementer

Sprint 2

D-24

Declaration ARTCI donnees biometriques

TRANCHEE — action urgente

Avant Sprint 4

D-25

Statut legal wallet prepaye vs BCEAO

A VALIDER — juriste UEMOA

Avant lancement

D-26

Protection usage illicite (KYB + CGU + monitoring)

TRANCHEE — avocat requis

Sprint 4

## **Actions requises avant lancement — recap**

**Action**

**Responsable**

**Deadline**

**Budget estime**

Negocier contrat Smile ID (tarifs bloques 12 mois)

Fondateur

Avant Sprint 1

0 FCFA

Rediger DPA et CGU (avocat CI)

Fondateur + avocat

Avant Sprint 4

150-300k FCFA

Deposer declaration ARTCI donnees biometriques

Fondateur

Avant Sprint 4

~0 FCFA

Consulter juriste UEMOA sur statut wallet prepaye

Fondateur + juriste

Avant lancement

100-200k FCFA

Valider disclaimer faux negatif (avocat)

Fondateur + avocat

Avant lancement

Inclus CGU

KYB workspace a l'inscription (verification RCCM)

Tech — Sprint 4

Sprint 4

0 FCFA

_Document confidentiel — Identis Decisions Produit & Legal v1.0 — Mai 2026_
