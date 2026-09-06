# ZOH-HENAN Diaspora Tour 2026

Plateforme événementielle Next.js destinée à l’inscription, la billetterie sécurisée, l’envoi Resend, au check-in mobile et à l’administration du Diaspora Tour.

## Fonctionnalités

- inscription dynamique aux événements avec validation client et serveur ;
- attribution transactionnelle du numéro de ticket et contrôle de capacité dans PostgreSQL ;
- QR opaque, ticket mobile et email transactionnel Resend ;
- authentification équipe, scanner caméra et check-in atomique sans double entrée ;
- premier dashboard de présence protégé par rôle.

## Démarrage local

1. Installer Node.js 20 ou supérieur.
2. Copier `.env.example` vers `.env.local` et renseigner de vraies valeurs.
3. Installer les dépendances : `npm install`.
4. Lancer le serveur : `npm run dev`.
5. Ouvrir `http://localhost:3000`.

## Secrets à fournir

- URL et clé anonyme du projet Supabase ;
- clé Service Role Supabase, uniquement dans les variables serveur ;
- clé API Resend et expéditeur appartenant à un domaine vérifié ;
- URL publique finale, par exemple `https://tour.zoh-henan.com` ;
- clés Turnstile si cette protection est activée.

Ne commitez jamais `.env.local` ni une clé réelle. La configuration Supabase, les migrations, Resend et le déploiement Vercel seront détaillés à mesure de leur implémentation.

## Supabase

1. Créer un projet et relever son URL, sa clé anonyme et sa clé Service Role.
2. Exécuter `supabase/migrations/202609050001_initial.sql` dans le SQL Editor.
3. Exécuter `supabase/seed.sql` pour créer Paris et Milan.
4. Dans Authentication, créer les comptes équipe.
5. Pour chaque compte, ajouter une ligne dans `profiles` avec le même UUID et le rôle `admin`, `check_in_agent` ou `viewer`.

## Resend et DNS

Ajouter et vérifier le domaine d’envoi dans Resend, publier les entrées SPF et DKIM proposées, puis renseigner `RESEND_API_KEY` et `EMAIL_FROM`. Sans ces valeurs, l’inscription reste enregistrée mais l’échec d’email est journalisé côté serveur.

## Vercel

1. Importer ce dépôt dans Vercel avec le preset Next.js.
2. Ajouter toutes les variables de `.env.example` aux environnements Production et Preview.
3. Déployer, puis associer `tour.zoh-henan.com` dans **Settings → Domains**.
4. Mettre `NEXT_PUBLIC_SITE_URL=https://tour.zoh-henan.com` et redéployer.

La caméra nécessite HTTPS, fourni automatiquement par Vercel. La Service Role ne doit jamais être préfixée par `NEXT_PUBLIC_`.
