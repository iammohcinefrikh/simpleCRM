# Facturation en Ligne SimpleCRM

## Contexte du Projet

SimpleCRM vise à développer une solution de facturation en ligne (SAAS) pour les entreprises qui gèrent leurs propres factures moyennant un abonnement mensuel. Avec l'augmentation des besoins en gestion de la facturation, ces entreprises recherchent des solutions intégrées qui leur permettent de gérer leur comptabilité et leurs stocks.

Les fonctionnalités attendues de cette solution incluent :

- Création de fiches d'entreprise avec des détails tels que le nom, l'adresse, l'identifiant fiscal, etc.
- Gestion des fiches de produits avec des informations sur les prix, les marges, les dimensions, etc.
- Création et gestion des fiches clients avec leurs coordonnées.
- Gestion des réapprovisionnements chez les fournisseurs.
- Établissement des factures.

## Règles de Gestion

- Les clients peuvent créer des factures avec un ou plusieurs produits.
- Chaque facture concerne un seul client.
- Chaque produit peut être acheté chez un ou plusieurs fournisseurs.
- Chaque entreprise peut gérer les factures, les clients et le stock des produits, et s'approvisionner chez ses fournisseurs en cas de rupture.

## User Stories

En tant que responsable commercial, je souhaite pouvoir gérer la liste des clients, fournisseurs, factures et commandes (lire, ajouter, supprimer et modifier).

## Attentes de SimpleCRM

SimpleCRM attend :

- Modélisation et création de la base de données.
- Développement d'une API pour gérer les activités commerciales des clients (entreprises abonnées).

## Technologies Utilisé

- Environnement Node.js et Express pour créer un serveur web.
- Base de données centralisée utilisant MySQL pour garder une trace de toutes les activités commerciales et capitaliser sur les informations clients.
- Prisma pour la gestion de la base de données.
