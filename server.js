const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// ===================================================
// DATABASE CONNECTION
// Set these as Environment Variables on your host
// (Render / Railway) -- NEVER hardcode real credentials here
// ===================================================
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,       // e.g. yourserver.database.windows.net
    database: process.env.DB_NAME,
    port: 1433,
    options: {
        encrypt: true,               // required for Azure SQL
        trustServerCertificate: false
    }
};

let poolPromise = sql.connect(dbConfig)
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('DB connection failed:', err);
    });

async function q(strings, ...values) {
    const pool = await poolPromise;
    const request = pool.request();
    values.forEach((v, i) => request.input('p' + i, v));
    let text = strings[0];
    values.forEach((v, i) => { text += '@p' + i + strings[i + 1]; });
    return request.query(text);
}

app.get('/', (req, res) => res.send('Emergency Resource Management API is running'));

// ===================== USERS =====================
app.get('/getUsers', async (req, res) => {
    try {
        let result = await q`SELECT * FROM Users`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addUser', async (req, res) => {
    try {
        const { name, phone } = req.body;
        await q`INSERT INTO Users (name, phone) VALUES (${name}, ${phone})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateUser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, phone } = req.body;
        await q`UPDATE Users SET name=${name}, phone=${phone} WHERE userId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteUser/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Users WHERE userId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== VICTIMS =====================
app.get('/getVictims', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT v.victimId, v.userId, u.name AS userName,
                   v.injuryStatus, v.familyCount
            FROM Victim v
            INNER JOIN Users u ON v.userId = u.userId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addVictim', async (req, res) => {
    try {
        const { userId, injuryStatus, familyCount } = req.body;
        await q`INSERT INTO Victim (userId, injuryStatus, familyCount) VALUES (${userId}, ${injuryStatus}, ${familyCount})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteVictim/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Victim WHERE victimId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== DISASTERS =====================
app.get('/getDisasters', async (req, res) => {
    try {
        let result = await q`SELECT * FROM Disaster`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addDisaster', async (req, res) => {
    try {
        const { type, severity } = req.body;
        await q`INSERT INTO Disaster (type, severityLevel, reportedAt) VALUES (${type}, ${severity}, GETDATE())`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateDisaster/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { type, severity } = req.body;
        await q`UPDATE Disaster SET type=${type}, severityLevel=${severity} WHERE disasterId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteDisaster/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Disaster WHERE disasterId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== LOCATIONS =====================
app.get('/getLocations', async (req, res) => {
    try {
        let result = await q`SELECT * FROM Location`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addLocation', async (req, res) => {
    try {
        const { longitude, latitude, area } = req.body;
        await q`INSERT INTO Location (longitude, latitude, area) VALUES (${longitude}, ${latitude}, ${area})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateLocation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { longitude, latitude, area } = req.body;
        await q`UPDATE Location SET longitude=${longitude}, latitude=${latitude}, area=${area} WHERE locId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteLocation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Location WHERE locId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== ORGANIZATIONS =====================
app.get('/getOrganizations', async (req, res) => {
    try {
        let result = await q`SELECT * FROM Organization`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addOrganization', async (req, res) => {
    try {
        const { orgName, budget } = req.body;
        await q`INSERT INTO Organization (orgName, budget) VALUES (${orgName}, ${budget})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateOrganization/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { orgName, budget } = req.body;
        await q`UPDATE Organization SET orgName=${orgName}, budget=${budget} WHERE orgId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteOrganization/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Organization WHERE orgId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== RESCUERS =====================
app.get('/getRescuers', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT r.rescuerId, r.skillSet, r.orgId, o.orgName
            FROM Rescuer r
            INNER JOIN Organization o ON r.orgId = o.orgId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addRescuer', async (req, res) => {
    try {
        const { skillSet, orgId } = req.body;
        await q`INSERT INTO Rescuer (skillSet, orgId) VALUES (${skillSet}, ${orgId})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateRescuer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { skillSet, orgId } = req.body;
        await q`UPDATE Rescuer SET skillSet=${skillSet}, orgId=${orgId} WHERE rescuerId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteRescuer/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Rescuer WHERE rescuerId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== TEAMS =====================
app.get('/getTeams', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT t.teamId, t.teamName, t.leaderId, r.skillSet AS leaderSkill
            FROM Rescuer_Team t
            LEFT JOIN Rescuer r ON t.leaderId = r.rescuerId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addTeam', async (req, res) => {
    try {
        const { teamName, leaderId } = req.body;
        await q`INSERT INTO Rescuer_Team (teamName, leaderId) VALUES (${teamName}, ${leaderId})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateTeam/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { teamName, leaderId } = req.body;
        await q`UPDATE Rescuer_Team SET teamName=${teamName}, leaderId=${leaderId} WHERE teamId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteTeam/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Rescuer_Team WHERE teamId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== RESOURCES =====================
app.get('/getResources', async (req, res) => {
    try {
        let result = await q`SELECT * FROM Resource`;
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addResource', async (req, res) => {
    try {
        const { itemName, costPerUnit, totalQuantity } = req.body;
        await q`INSERT INTO Resource (itemName, costPerUnit, totalQuantity) VALUES (${itemName}, ${costPerUnit}, ${totalQuantity})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateResource/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { itemName, costPerUnit, totalQuantity } = req.body;
        await q`UPDATE Resource SET itemName=${itemName}, costPerUnit=${costPerUnit}, totalQuantity=${totalQuantity} WHERE resourceId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteResource/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Resource WHERE resourceId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== SOS REQUESTS =====================
app.get('/getRequests', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT s.requestId, s.victimId, u.name AS victimName,
                   s.disasterId, d.type AS disasterType,
                   s.locId, l.area AS locationArea, s.status
            FROM SOS_Request s
            INNER JOIN Victim v ON s.victimId = v.victimId
            INNER JOIN Users u ON v.userId = u.userId
            INNER JOIN Disaster d ON s.disasterId = d.disasterId
            INNER JOIN Location l ON s.locId = l.locId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addSOS', async (req, res) => {
    try {
        const { victimId, disasterId, locId } = req.body;
        await q`INSERT INTO SOS_Request (victimId, disasterId, locId, status) VALUES (${victimId}, ${disasterId}, ${locId}, 'Pending')`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateSOS/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { victimId, disasterId, locId } = req.body;
        await q`UPDATE SOS_Request SET victimId=${victimId}, disasterId=${disasterId}, locId=${locId} WHERE requestId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteSOS/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM SOS_Request WHERE requestId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== ALLOCATIONS =====================
app.get('/getAllocations', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT a.allocationId, a.reqId, u.name AS victimName,
                   a.rescuerId, r.skillSet AS rescuerSkill,
                   a.resId, res.itemName AS resourceName, a.allocatedQty
            FROM Resource_Allocation a
            INNER JOIN SOS_Request s ON a.reqId = s.requestId
            INNER JOIN Victim v ON s.victimId = v.victimId
            INNER JOIN Users u ON v.userId = u.userId
            INNER JOIN Rescuer r ON a.rescuerId = r.rescuerId
            INNER JOIN Resource res ON a.resId = res.resourceId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/addAllocation', async (req, res) => {
    try {
        const { reqId, rescuerId, resId, allocatedQty } = req.body;
        await q`INSERT INTO Resource_Allocation (reqId, rescuerId, resId, allocatedQty) VALUES (${reqId}, ${rescuerId}, ${resId}, ${allocatedQty})`;
        res.send('Saved');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/updateAllocation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { reqId, rescuerId, resId, allocatedQty } = req.body;
        await q`UPDATE Resource_Allocation SET reqId=${reqId}, rescuerId=${rescuerId}, resId=${resId}, allocatedQty=${allocatedQty} WHERE allocationId=${id}`;
        res.send('Updated');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/deleteAllocation/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await q`DELETE FROM Resource_Allocation WHERE allocationId=${id}`;
        res.send('Deleted');
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== REPORTS =====================
app.get('/report/location', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT l.area, COUNT(s.requestId) AS totalRequests
            FROM SOS_Request s
            INNER JOIN Location l ON s.locId = l.locId
            GROUP BY l.area
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/report/full', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT s.requestId, u.name AS victimName,
                   d.type AS disaster, l.area AS location, s.status
            FROM SOS_Request s
            INNER JOIN Victim v ON s.victimId = v.victimId
            INNER JOIN Users u ON v.userId = u.userId
            INNER JOIN Disaster d ON s.disasterId = d.disasterId
            INNER JOIN Location l ON s.locId = l.locId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/report/allocation', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT a.allocationId, u.name AS victim, d.type AS disaster,
                   l.area AS location, r.skillSet AS rescuer,
                   res.itemName AS resource, a.allocatedQty AS qty
            FROM Resource_Allocation a
            INNER JOIN SOS_Request s ON a.reqId = s.requestId
            INNER JOIN Victim v ON s.victimId = v.victimId
            INNER JOIN Users u ON v.userId = u.userId
            INNER JOIN Disaster d ON s.disasterId = d.disasterId
            INNER JOIN Location l ON s.locId = l.locId
            INNER JOIN Rescuer r ON a.rescuerId = r.rescuerId
            INNER JOIN Resource res ON a.resId = res.resourceId
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/report/resources-used', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT r.itemName, SUM(a.allocatedQty) AS totalUsed
            FROM Resource_Allocation a
            INNER JOIN Resource r ON a.resId = r.resourceId
            GROUP BY r.itemName
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/report/rescuer-work', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT r.skillSet, COUNT(a.allocationId) AS totalTasks
            FROM Resource_Allocation a
            INNER JOIN Rescuer r ON a.rescuerId = r.rescuerId
            GROUP BY r.skillSet
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/report/disaster-impact', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT d.type, COUNT(s.requestId) AS totalCases
            FROM SOS_Request s
            INNER JOIN Disaster d ON s.disasterId = d.disasterId
            GROUP BY d.type
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/report/organization', async (req, res) => {
    try {
        const pool = await poolPromise;
        let result = await pool.request().query(`
            SELECT o.orgName, COUNT(r.rescuerId) AS totalRescuers
            FROM Organization o
            INNER JOIN Rescuer r ON o.orgId = r.orgId
            GROUP BY o.orgName
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
