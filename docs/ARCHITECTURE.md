# Architecture cible

## Domaines

- **Inscription** : validation Zod client/serveur, honeypot, rate limit et fonction PostgreSQL atomique.
- **Billetterie** : numéro séquentiel par événement, token QR aléatoire, rendu HTML/PDF et calendrier ICS.
- **Email** : Resend côté serveur, template responsive, journalisation et renvoi contrôlé.
- **Check-in** : caméra mobile, résolution du token côté serveur, confirmation humaine et écriture atomique idempotente.
- **Administration** : Auth Supabase, rôles, statistiques, participants, événements et export CSV.

## Modèle de données

| Table | Responsabilité |
| --- | --- |
| `events` | Événements dynamiques, capacité et ouverture des inscriptions |
| `participants` | Coordonnées, statut, ticket et état de présence |
| `check_ins` | Trace unique de l’entrée et identité de l’agent |
| `profiles` | Profil Auth Supabase, rôle et activation |
| `audit_logs` | Événements sensibles sans secrets ni données QR en clair |

Les contraintes PostgreSQL garantissent l’unicité `(event_id, lower(email))`, du ticket, du token QR et du check-in principal. Une fonction SQL verrouille l’événement, vérifie sa capacité puis attribue le prochain numéro dans une transaction.

## Routes

- Publiques : `/`, `/confirmation`, `/ticket/[token]`.
- Équipe : `/login`, `/check-in`.
- Administration : `/admin`, `/admin/participants`, `/admin/participants/[id]`, `/admin/events`.
- API : inscription, renvoi, ticket/QR/ICS, résolution et confirmation de scan, recherche manuelle, statistiques et export.

## Composants

- `RegistrationForm`, `EventCard`, `FormField`, `ConsentField`.
- `DigitalTicket`, `QrCode`, `DownloadActions`.
- `CameraScanner`, `ScanResult`, `ManualParticipantSearch`.
- `AdminShell`, `StatsCards`, `AttendanceChart`, `ParticipantsTable`, `EventEditor`.

## Frontières de sécurité

Le navigateur ne reçoit que la clé anonyme Supabase. Les créations publiques passent par le serveur ; la Service Role reste exclusivement serveur. Chaque action d’équipe vérifie la session, le profil actif et le rôle. Les lectures publiques d’une table complète sont interdites par RLS.

## Risques et décisions

1. **Concurrence** : inscription et check-in reposent sur transactions, verrous et contraintes uniques PostgreSQL.
2. **QR copié** : token opaque à forte entropie, révocable, sans donnée personnelle ; un scan n’enregistre rien avant confirmation.
3. **Capacité** : contrôle réalisé dans la même transaction que l’inscription.
4. **Vercel distribué** : rate limiting adossé à un stockage partagé en production, pas à la mémoire du processus.
5. **Caméra mobile** : HTTPS obligatoire, caméra arrière privilégiée, arrêt explicite des pistes et saisie manuelle de secours.
6. **Email** : domaine Resend vérifié (SPF/DKIM), erreurs journalisées et renvoi idempotent protégé.
