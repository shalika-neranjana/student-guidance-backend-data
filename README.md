# Student Results Dashboard

This project is a lightweight full-stack dashboard for viewing, creating, updating, and deleting student continuous assessment results.

## Stack

- Backend: Node.js, Express, Mongoose, MongoDB Atlas
- Frontend: HTML, CSS, vanilla JavaScript

## Project Structure

```text
.
|-- public/
|   |-- css/
|   |-- js/
|   `-- index.html
|-- src/
|   |-- config/
|   |-- constants/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   `-- validators/
|-- .env.example
|-- server.js
`-- package.json
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local `.env` file from `.env.example`.

3. Set your MongoDB connection values:

   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/InternConnect
   MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
   ```

4. Start the app:

   ```bash
   npm start
   ```

The dashboard will be available at [http://localhost:5000](http://localhost:5000).

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the server in watch mode
- `npm run lint`: Run ESLint across the project
- `npm test`: Run the validation test suite

## API Overview

- `GET /students`: List students
- `GET /modules`: List modules
- `GET /results`: List results with student and module details
- `POST /results`: Create a result
- `PUT /results/:id`: Update a result
- `DELETE /results/:id`: Delete a result

Legacy compatibility routes for update/delete still exist:

- `POST /results/:id/update`
- `POST /results/:id/delete`

## Improvements Included

- Separated backend concerns into config, models, controllers, services, and routes
- Added centralized request validation and error handling
- Moved MongoDB configuration into environment variables
- Preserved the DNS fallback for Atlas SRV lookup failures
- Simplified frontend state management and request handling
- Added linting and basic automated validation tests
