# 🚨 Emergency Resource Management System

A full-stack DBMS project that coordinates disaster response by linking **victims**, **rescuers**, **resources**, **organizations**, and **SOS requests** through a normalized relational database.

**Live App:** [emergencyresourcemanagementsystem.netlify.app](https://emergencyresourcemanagementsystem.netlify.app/)

---

## 📖 Overview

Disaster relief often suffers from fragmented, paper-based tracking — no central link between a victim's location, available rescuers, and relief supplies. This project solves that by providing a centralized system to:

- Register victims and link them to disasters and locations
- Log SOS requests and route them for help
- Track rescuers, their skills, and the organizations they belong to
- Allocate resources (medicine, food, water, etc.) to specific victims
- Generate reports on hotspots, rescuer workload, and resource usage

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)  →  Netlify (static hosting)
Backend  (Express API)  →  Vercel (serverless functions)
Database (SQL Server)   →  connected via environment variables
```

The frontend talks to the backend through a single configurable variable (`API_BASE` in `config.js`), so the API URL can be swapped without touching any page.

## 🧩 Database Design

Designed and normalized up to **BCNF**. Core entities:

| Entity | Description |
|---|---|
| `Users` | Basic contact info for any registered person |
| `Victim` | Linked 1:1 to a `User`, holds injury status & family count |
| `Disaster` | A logged event (type, severity, timestamp) |
| `Location` | Geographic coordinates + area name |
| `SOS_Request` | Links a victim, a disaster, and a location |
| `Organization` | Relief agency (name, budget) |
| `Rescuer` | Linked to an `Organization`, has a skill set |
| `Rescuer_Team` | A team led by a `Rescuer` |
| `Resource` | Relief inventory item (name, cost, quantity) |
| `Resource_Allocation` | Links an `SOS_Request`, a `Rescuer`, and a `Resource` with quantity |

Full ER diagram, functional dependencies, and the normalization walkthrough (1NF → BCNF) are documented in [`ProjectReport .pdf`](./ProjectReport%20.pdf).

## ⚙️ Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express
- **Database:** Microsoft SQL Server (`mssql` driver)
- **Hosting:** Netlify (frontend) + Vercel (backend API)

## 🚀 Getting Started Locally

### 1. Clone the repo
```bash
git clone https://github.com/FALAKNAZMALICK/EMERGENCY-RESOURCE-MANAGEMENT-SYSTEM----DBMS_PROJECT.git
cd EMERGENCY-RESOURCE-MANAGEMENT-SYSTEM----DBMS_PROJECT
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Set up the database
Run the schema (tables + constraints) against your own SQL Server instance — see the DDL section in `ProjectReport .pdf`, or use the `CREATE TABLE` statements for each entity listed above.

### 4. Configure environment variables
Create a `.env` file (or set these in your hosting provider's dashboard):
```
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=your_server.database.windows.net
DB_NAME=your_database_name
```

### 5. Run the backend
```bash
node server.js
```
The API will start on `http://localhost:3000` (or the port Vercel/your host assigns).

### 6. Point the frontend at your backend
Edit `config.js`:
```js
const API_BASE = "http://localhost:3000"; // or your deployed backend URL
```
Then open `index.html` in a browser (or serve the folder with any static server).

## 🔌 API Endpoints

All endpoints are prefixed with the deployed backend URL (see `config.js`).

| Module | Endpoints |
|---|---|
| Users | `GET /getUsers` · `POST /addUser` · `PUT /updateUser/:id` · `DELETE /deleteUser/:id` |
| Victims | `GET /getVictims` · `POST /addVictim` · `DELETE /deleteVictim/:id` |
| Disasters | `GET /getDisasters` · `POST /addDisaster` · `PUT /updateDisaster/:id` · `DELETE /deleteDisaster/:id` |
| Locations | `GET /getLocations` · `POST /addLocation` · `PUT /updateLocation/:id` · `DELETE /deleteLocation/:id` |
| Organizations | `GET /getOrganizations` · `POST /addOrganization` · `PUT /updateOrganization/:id` · `DELETE /deleteOrganization/:id` |
| Rescuers | `GET /getRescuers` · `POST /addRescuer` · `PUT /updateRescuer/:id` · `DELETE /deleteRescuer/:id` |
| Teams | `GET /getTeams` · `POST /addTeam` · `PUT /updateTeam/:id` · `DELETE /deleteTeam/:id` |
| Resources | `GET /getResources` · `POST /addResource` · `PUT /updateResource/:id` · `DELETE /deleteResource/:id` |
| SOS Requests | `GET /getRequests` · `POST /addSOS` · `PUT /updateSOS/:id` · `DELETE /deleteSOS/:id` |
| Allocations | `GET /getAllocations` · `POST /addAllocation` · `PUT /updateAllocation/:id` · `DELETE /deleteAllocation/:id` |
| Reports | `GET /report/location` · `GET /report/full` · `GET /report/allocation` · `GET /report/resources-used` · `GET /report/rescuer-work` · `GET /report/disaster-impact` · `GET /report/organization` |

## 🔄 System Workflow

The system follows an 11-step sequence to keep referential integrity intact:

1. Add a **User**
2. Create a **Victim** profile from that user
3. Log a **Disaster**
4. Add its **Location**
5. Add available **Resources**
6. Register an **Organization**
7. Onboard **Rescuers** under that organization
8. Form a **Team**
9. Raise an **SOS Request** (links victim + disaster + location)
10. **Allocate** a rescuer and resource to the request
11. View auto-generated **Reports**

## 📊 Sample Reports

- Full SOS report (victim, disaster, location, status)
- Rescuer workload by skill set
- Resource utilization summary
- Disaster impact by type
- Organizational capacity (rescuers per org)

## ⚠️ Known Limitations

- Resource quantities are not auto-decremented when an allocation is made
- Location coordinates are entered manually (no live GPS integration)
- Requires an active internet/server connection to function

## 📄 License

This project was built for academic purposes as part of a university coursework assignment.
