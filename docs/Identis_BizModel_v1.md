**IDENTIS**

**Modele Economique**

_Structure de revenus, pricing, couts et projections financieres_

Cloud Pay-as-you-go | Dedicated Licence | FCFA

Version

**1.0 — MVP**

Date

**Mai 2026**

Monnaie

**Franc CFA (FCFA)**

# **1. Vue d'ensemble du modele economique**

Identis genere des revenus selon deux flux principaux, adaptes chacun a un profil client distinct. Le modele est concu pour etre simple a comprendre, previsible pour le client, et rentable des les premiers mois.

**01**

**Flux Cloud — Pay-as-you-go**

Inscription unique avec credit de depart. Wallet prepaye rechargeable. Facturation a la verification consommee. Zero engagement mensuel. Cible : fintechs, IMF, agences immobilieres.

**02**

**Flux Dedicated — Licence logicielle**

Setup one-time + redevance mensuelle fixe. Le client gere son propre compte Smile ID et son infrastructure. Identis facture uniquement le logiciel et la maintenance. Cible : grandes institutions, banques, organismes publics.

**03**

**Flux Services — (Post-MVP)**

Intégration custom, formation equipes, audit conformite BCEAO, migration de donnees. Facturation au projet ou en regie journaliere.

Le candidat final (locataire, emprunteur) ne paie jamais directement. C'est toujours le workspace client qui supporte le cout des verifications. Le workspace peut repercuter ce cout dans ses propres frais de dossier — c'est son choix commercial.

# **2. Flux Cloud — Pay-as-you-go**

## **2.1 Frais d'inscription — Filtre et credit de depart**

**15 000 FCFA**

Frais d'inscription one-time — non remboursable

_Inclut 10 verifications completes offertes (~10 000 FCFA de valeur)_

### **Ce que couvre ce frais**

- **Filtre anti-plaisantins : **un workspace cree coute quelque chose — seuls les projets serieux s'inscrivent
- **Setup du workspace : **configuration initiale, creation du compte, onboarding
- **Credit de depart : **10 verifications completes (Document Verification + Selfie) pour tester en conditions reelles
- **Acces sandbox illimite : **inclus sans deduction du credit

Les 10 verifications offertes correspondent a la formule 'Document Verification + Selfie liveness' (valeur unitaire 1 200 FCFA). Le client peut ainsi valider son integration et tester le produit avant de recharger son wallet.

## **2.2 Wallet prepaye — Fonctionnement**

Apres l'inscription, le client recharge son wallet selon ses besoins. Chaque verification consomme un montant selon son type. Pas d'abonnement, pas d'engagement.

**Regle**

**Detail**

Recharge minimum

25 000 FCFA par recharge

Recharge maximum

Illimitee

Expiration du solde

Aucune — le solde ne perime pas

Alerte seuil bas

Notification automatique a 5 000 FCFA restants

Moyens de paiement

Wave CI, Orange Money, MTN MoMo, Virement bancaire

Delai creditement

Immediat (Wave/Orange) ou J+1 (virement)

Remboursement solde

Possible sur demande, delai 5 jours ouvrés

## **2.3 Grille tarifaire — Prix par verification**

**Basic KYC**

**500**

_FCFA / verification_

• Verification numero CNI

• Contre registre gouvernemental

• Pas de selfie requis

• Reponse < 3 secondes

• Usage : verification rapide

**DocV Standard**

**1 200**

_FCFA / verification_

• CNI recto/verso scanee

• Selfie liveness

• OCR + match facial

• Reponse < 5 secondes

• Usage : onboarding standard

**DocV + AML**

**1 800**

_FCFA / verification_

• Tout DocV Standard

• AML Check 1100+ listes

• Screening sanctions/PEP

• Rapport compliance inclus

• Usage : conformite BCEAO

**Smile Secure**

**300**

_FCFA / verification_

• Detection doublon facial

• Base workspace uniquement

• En add-on sur DocV

• Reponse < 2 secondes

• Usage : anti multi-comptes

Smile Secure (detection de doublon) est un add-on : il se cumule avec une verification DocV. Exemple : DocV Standard + Smile Secure = 1 200 + 300 = 1 500 FCFA pour une verification complete avec controle doublon.

## **2.4 Tarification degressive — Clients a volume**

A partir de 500 verifications par mois, une remise sur le prix unitaire est applicable. La remise est calculee automatiquement sur la consommation du mois ecoule.

**Volume mensuel**

**Basic KYC**

**DocV Standard**

**DocV + AML**

**Remise**

0 - 499 verif/mois

500 FCFA

1 200 FCFA

1 800 FCFA

—

500 - 1 999 verif/mois

425 FCFA

1 020 FCFA

1 530 FCFA

-15%

2 000 - 9 999 verif/mois

375 FCFA

1 050 FCFA

1 350 FCFA

-25%

10 000+ verif/mois

Sur devis

Sur devis

Sur devis

Negociable

La remise degressive s'applique automatiquement. Le client ne change pas de plan — il rechargera simplement moins souvent pour le meme volume. La remise est visible dans son tableau de bord wallet.

## **2.5 Structure de couts Cloud — Marge Identis**

Identis porte le cout Smile ID et le repercute avec marge sur chaque verification. Les estimations ci-dessous sont basees sur les tarifs marche Smile ID Afrique de l'Ouest.

**Produit**

**Cout Smile ID estime**

**Prix Identis**

**Marge brute**

**Marge %**

Basic KYC

~150 FCFA

500 FCFA

350 FCFA

70%

DocV Standard

~500 FCFA

1 200 FCFA

700 FCFA

58%

DocV + AML

~750 FCFA

1 800 FCFA

1 050 FCFA

58%

Smile Secure

~100 FCFA

300 FCFA

200 FCFA

67%

Ces marges sont estimatives — le tarif reel Smile ID est confirme apres negociation du contrat partenaire. A partir de 1 000 verifications/mois, Smile ID propose generalement des tarifs preferentiels qui ameliorent mecaniquement la marge.

# **3. Flux Dedicated — Licence logicielle**

Le client Dedicated deploie Identis sur sa propre infrastructure. Il gere son propre compte Smile ID et paie Smile ID directement. Identis facture uniquement le droit d'usage du logiciel et la maintenance.

Ce modele est strategiquement important : il cible les grandes institutions qui ne peuvent pas envoyer leurs donnees biometriques vers un cloud externe. En leur offrant cette option, Identis accede a des tickets eleves inaccessibles en SaaS pur.

## **3.1 Structure tarifaire Dedicated**

**Setup**

**150 000 — 300 000**

_FCFA one-time_

- Deploiement Docker/Podman
- Configuration serveur
- Integration Smile ID client
- Formation equipe admin
- Tests et mise en production

**Licence mensuelle**

**75 000**

_FCFA / mois_

- Acces complet au logiciel
- Mises a jour incluses
- Support technique
- Workspace enregistre
- Cle de licence activee

**A la charge du client**

**0 FCFA**

_facture par Identis_

- Compte Smile ID propre
- Verifications Smile ID
- Infrastructure serveur
- Base de donnees
- Stockage fichiers

## **3.2 Ce qu'Identis voit du client Dedicated**

Le client Dedicated reste enregistre dans l'ecosysteme Identis. Son instance distante envoie un heartbeat periodique. Identis ne voit jamais les donnees biometriques ou les dossiers.

**Ce qu'Identis voit**

**Ce qu'Identis ne voit pas**

Statut de la licence (active / expiree)

Donnees biometriques des candidats

Date d'expiration et de renouvellement

Dossiers et resultats de verification

Derniere connexion de l'instance (heartbeat)

Donnees du formulaire additionnel

Version du logiciel installee

Contenu du wallet ou transactions

Nombre de workspaces membres (anonymise)

Regles Rule Engine configurees

La separation est totale sur les donnees metier. Identis conserve uniquement les informations necessaires a la gestion de la relation commerciale et a la validation de la licence.

## **3.3 Conditions de la relation Dedicated**

- **Contrat minimum : **12 mois renouvelable par tacite reconduction
- **Preavis de resiliation : **60 jours avant echeance
- **Mises a jour : **le client valide et deploie les mises a jour — Identis fournit les releases
- **Support : **inclus dans la redevance — SLA 48h ouvrées pour les incidents critiques
- **Audit de version : **Identis peut verifier a distance la version installee via le heartbeat
- **Suspension : **en cas de non-paiement, la cle de licence est desactivee apres 30 jours de grace

# **4. Comparaison Cloud vs Dedicated**

**Critere**

**Cloud Pay-as-you-go**

**Dedicated Licence**

Frais initiaux

15 000 FCFA inscription

150 000 — 300 000 FCFA setup

Cout recurrent

A la verification consommee

75 000 FCFA/mois fixe

Engagement

Aucun

12 mois minimum

Hebergement donnees

Serveurs Identis (cloud)

Serveurs du client

Compte Smile ID

Gere par Identis

Compte propre du client

Cout Smile ID

Inclus dans le prix unitaire

Facture directement par Smile ID

Mises a jour

Automatiques

A valider et deployer par le client

Visibilite donnees

Identis voit tout

Identis voit licence + heartbeat

Cible

Fintechs, IMF, agences

Banques, institutions, public

Ticket moyen annuel

Variable selon usage

900 000+ FCFA/an hors setup

# **5. Projections financieres**

Les projections ci-dessous sont basees sur des hypotheses conservatrices pour la premiere annee post-lancement. Elles ne tiennent pas compte d'eventuels clients Dedicated en annee 1.

## **5.1 Hypotheses de base**

**Hypothese**

**Valeur retenue**

**Justification**

Clients Cloud actifs M6

5 workspaces

Acquisition lente — terrain CI

Clients Cloud actifs M12

15 workspaces

Bouche a oreille + prospection active

Verifications moy./client

100/mois

Mix IMF et agences immo

Mix produit

70% DocV Standard, 20% Basic KYC, 10% DocV+AML

Estimation terrain

Revenu moyen/verification

~1 000 FCFA

Moyenne ponderee du mix produit

1er client Dedicated

Mois 10

Cycle de vente long (6-9 mois)

## **5.2 Scenarios de revenus — Annee 1**

**Indicateur**

**Pessimiste**

**Base**

**Optimiste**

**Clients Cloud M12**

8

15

25

**Verifications/client/mois**

60

100

150

**Revenu inscriptions M12**

120 000 FCFA

225 000 FCFA

375 000 FCFA

**Revenu verifications M12**

480 000 FCFA

1 500 000 FCFA

3 750 000 FCFA

**Client Dedicated (si signe)**

0

900 000 FCFA

1 800 000 FCFA

**Revenu total annuel estime**

~3 M FCFA

~8 M FCFA

~18 M FCFA

Ces projections excluent les revenus de services (integration custom, formation). Un seul client Dedicated signe double potentiellement le revenu annuel. L'objectif prioritaire est d'atteindre 5 clients Cloud actifs dans les 6 premiers mois.

## **5.3 Structure des couts operationnels**

**Poste de cout**

**Estimation mensuelle**

**Nature**

Smile ID (verifications Cloud)

Variable — ~40% du revenu verif

Variable

Infrastructure cloud (VPS, R2)

~15 000 — 30 000 FCFA

Fixe

WhatsApp Business API

~5 000 — 10 000 FCFA

Semi-variable

Nom de domaine + SSL

~1 000 FCFA

Fixe

Outils dev (GitHub, monitoring)

~5 000 FCFA

Fixe

Total couts fixes mensuels

~26 000 — 46 000 FCFA

Hors Smile ID

Le point mort Cloud est atteint avec environ 3 a 4 clients actifs generant 100 verifications/mois chacun — soit ~300 000 a 400 000 FCFA de revenu mensuel brut. C'est un objectif realisable en 3 a 4 mois post-lancement.

# **6. Metriques cles a suivre**

**NWA**

Nouveaux
Workspaces
Actifs*par mois*

**CPV**

Cout par
Verification*marge reelle vs estimee*

**WRR**

Wallet
Recharge
Rate*% wallets recharges / mois*

**DCV**

Dedicated
Contract
Value*valeur annuelle contrats*

**Metrique**

**Definition**

**Objectif M6**

**Objectif M12**

Workspaces actifs

Workspace avec au moins 1 verif dans le mois

5

15

Taux de recharge wallet

% wallets recharges dans les 30j apres epuisement

> 60%

> 75%

Verifications/workspace/mois

Volume moyen par client actif

50+

100+

Revenu mensuel recurrent

Verifications + licences Dedicated

200 000 FCFA

800 000 FCFA

Cout Smile ID / revenu

Part du cout provider sur le revenu brut

<45%

<40%

Delai moyen recharge

Jours entre 2 recharges wallet

<30 jours

<21 jours

NPS client

Net Promoter Score workspace admin

> 40

> 60

# **7. Strategie de montee en gamme client**

Le modele Pay-as-you-go n'est pas la destination finale pour tous les clients. L'objectif est de faire monter les clients Cloud a volume vers des arrangements preferentiels, et d'identifier les candidats Dedicated.

**Etape 1 — Entree**

**Etape 2 — Volume**

**Etape 3 — Strategique**

**Pay-as-you-go standard**

- Inscription 15 000 FCFA
- Tarif unitaire plein
- Recharge 25 000 FCFA min
- Support standard

**Client a volume (500+/mois)**

- Remise degressive -15% a -25%
- Gestionnaire de compte dedie
- SLA support ameliore (24h)
- Acces aux nouvelles features beta

**Client Dedicated**

- Licence mensuelle 75 000 FCFA
- Setup + deploiement
- Compte Smile ID propre
- Souverainete donnees totale

# **8. Synthese**

Un modele simple, deux flux. Le Cloud Pay-as-you-go genere du revenu immediatement des les premiers clients. Le Dedicated genere des tickets eleves a partir du mois 10. Les deux se complementent sans se cannibaliser.

## **Recapitulatif des revenus par source**

**Source**

**Declencheur**

**Montant**

**Recurrence**

Inscription workspace

Nouveau client Cloud

15 000 FCFA

One-time

Recharge wallet

Consommation verifications

25 000 FCFA min

Variable

Verifications Basic KYC

Appel API ou dashboard

500 FCFA/unite

A l'usage

Verifications DocV Standard

Appel API ou dashboard

1 200 FCFA/unite

A l'usage

Verifications DocV + AML

Appel API ou dashboard

1 800 FCFA/unite

A l'usage

Smile Secure (add-on)

Ajout sur verification DocV

300 FCFA/unite

A l'usage

Setup Dedicated

Signature contrat Dedicated

150 000-300 000 FCFA

One-time

Licence Dedicated

Contrat actif

75 000 FCFA/mois

Mensuel fixe

Services custom (post-MVP)

Demande client

Sur devis

Projet

## **Prochaines decisions a prendre**

- Confirmer le tarif reel Smile ID apres creation du compte partenaire
- Valider le frais d'inscription de 15 000 FCFA avec 2-3 prospects avant lancement
- Definir la politique de remboursement du solde wallet (conditions exactes)
- Rediger le contrat type Dedicated (avec un conseil juridique local CI)
- Fixer le seuil de volume a partir duquel un gestionnaire de compte est assigne

_Document confidentiel — Identis Modele Economique v1.0 — Mai 2026_
