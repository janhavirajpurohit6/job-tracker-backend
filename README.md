## job tracker 
is a full stack web app to track jobs/interships . 

## Features
- User signup/login with JWT authentication
- Add, edit, delete job applications
- Filter by status (applied, OA, interview, offer, rejected)
- Dashboard with application stats

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **Auth:** JWT, bcrypt for password hashing

## How to Run
1. Clone this repo
2. Run `npm install`
3. Create a `.env` file with your DB credentials (see `.env.example` if provided)
4. Set up the MySQL tables (see `schema.sql`)
5. Run `npm run dev`
6. Visit `http://localhost:5000`