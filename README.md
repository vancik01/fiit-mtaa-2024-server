# MTAA 2024 - SERVER

**Team**: Duvač, Vančo

### Before you begin:

- make sure that you have `node` installed
- make sure you have `docker` installed

## Run Local development environment:

1. Pull the repository using `git pull <repository_url>`
2. Enter the projects directory `cd fiit-mtaa-2024-server`
3. Run `npm install`
4. Copy file `.env.dev` and rename it to `.env`
5. Run `docker compose up` (this will run a postgres DB in docker)
6. Make sure the DB is running using command `docker ps` (you should see container running with a name 'mtaa-2024-server-db-1')
7. Run `npx prisma migrate reset` (this will reset the DB, create all the tables, generate dummy data using _./prisma/seed.ts_)
8. Run `npx prisma generate` (generates typescript types for DB model)
9. If you want to see the data in a DB, run `npx prisma studio`. This will open a window in browser where you can see all the tables and data inside the db.
