# TODO — Sprint 1 (Fondations vérification)

> Sprint démarré le 26 mai 2026. Se clôture quand tous les items sont cochés.

## En cours

- [ ] **Dashboard overview** — page `/dashboard` avec stats résumées : nb dossiers total, solde wallet, nb vérifications du mois, taux d'approbation
- [ ] **Workspace members** — endpoints API (inviter membre, changer rôle, retirer) + UI liste membres + formulaire invitation par email
- [ ] **DELETE /cases/:id** — suppression douce ou dure avec cascade : Verification, StepHistory, nettoyage photos R2, formData
- [ ] **Bull retry queue + timeout** — `Promise.race` timeout 30s sur l'appel Smile ID + queue BullMQ avec backoff 5min → 15min → 1h → 4h → 24h
- [ ] **Rapport PDF basique** — export par dossier : identité sujet, résultat vérification (liveness, document, faceMatch), référence case, date, logo workspace

## Bloquants externes

- [ ] Credentials Smile ID sandbox (`SMILE_ID_PARTNER_ID` + `SMILE_ID_API_KEY`) — renseigner dans `apps/api/.env`
- [ ] Migration DB — `pnpm -F db db:migrate` (requiert Docker)
