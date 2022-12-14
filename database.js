import mysql from 'mysql2';

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

// LOG COMMANDS
async function getLogs() {
    const [rows] = await db.query("SELECT * FROM test_logs")
    return rows
};
  
async function getLog(id) {
    const [rows] = await db.query(`
    SELECT * 
    FROM test_logs
    WHERE id = ?
    `, [id])
    return rows[0]
};
  
async function insertLog(uid, event, timestap, url, tab_id) {
    const [result] = await db.query(`
    INSERT INTO test_logs (uid, event, timestamp, url, tab_id)
    VALUES (?, ?, ?, ?, ?)
    `, [uid, event, timestap, url, tab_id]);
    
    const id = result.insertId;
    return getLog(id);
};

async function updateLog(scrollCount, blurCount, focusCount, clickCount, keypressCount, id) {
    const [result] = await db.query(`
    UPDATE test_logs
    SET
        scroll_count = ?,
	blur_count = ?,
	focus_count = ?,
	click_count = ?,
	keypress_count = ?
    WHERE
        id = ?;
    `, [scrollCount, blurCount, focusCount, clickCount, keypressCount, id]);

    return getLog(id);
};

// TASK COMMANDS
async function getTasks() {
    const [rows] = await db.query("SELECT * FROM tasks");
    return rows;
};

async function getTask(projectID, poolID) {
    const [rows] = await db.query(`
    SELECT * 
    FROM tasks
    WHERE (project_id, pool_id) = (?, ?)
    `, [projectID, poolID]);
    return rows[0];
};

async function insertTask(poolID, projectID, title, description, hasInstructions, mayContainAdultContent, requesterID, requesterTrusted, lang, averageAcceptanceTimeSec, grade, moneyAvgHourly, moneyMax3, moneyTop10, moneyMed, pool_startedAt, reward) {
    const [result] = await db.query(`
    REPLACE INTO tasks (pool_id, project_id, title, description, hasInstructions, mayContainAdultContent, requesterID, requesterTrusted, lang, averageAcceptanceTimeSec, grade, moneyAvgHourly, moneyMax3, moneyTop10, moneyMed, pool_startedAt, reward)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [poolID, projectID, title, description, hasInstructions, mayContainAdultContent, requesterID, requesterTrusted, lang, averageAcceptanceTimeSec, grade, moneyAvgHourly, moneyMax3, moneyTop10, moneyMed, pool_startedAt, reward]);
    return getTask(projectID, poolID);
};

// TASK RECIEPT COMMANDS
async function getReciepts() {
    const [rows] = await db.query("SELECT * FROM task_reciepts");
    return rows;
};

async function getReciept(projectID, uid) {
    const [rows] = await db.query(`
    SELECT * 
    FROM task_reciepts
    WHERE (project_id, uid) = (?, ?)
    `, [projectID, uid]);
    return rows[0];
};

async function insertReciept(uid, projectID, date, income) {
    const [result] = await db.query(`
    REPLACE INTO task_reciepts (project_id, uid, date, income)
    VALUES (?, ?, ?, ?)
    `, [projectID, uid, date, income]);
    return getReciept(projectID, uid);
};

// WORKER COMMANDS
async function getWorkers() {
    const [rows] = await db.query("SELECT * FROM worker");
    return rows;
};

async function getWorker(uid) {
    const [rows] = await db.query(`
    SELECT * 
    FROM worker
    WHERE uid = ?
    `, [uid]);
    return rows[0];
};

async function insertWorker(uid, country, language, birthdate, joined) {
    const [result] = await db.query(`
    REPLACE INTO worker (uid, country, language, birthdate, joined)
    VALUES (?, ?, ?, ?, ?)
    `, [uid, country, language, birthdate, joined]);
    return getWorker(uid);
};

// ASSIGNMENT COMMANDS
async function getAssignments() {
    const [rows] = await db.query("SELECT * FROM task_assignments");
    return rows;
};

async function getAssignment(projectID, uid) {
    const [rows] = await db.query(`
    SELECT * 
    FROM task_assignments
    WHERE (project_id, uid) = (?, ?)
    `, [projectID, uid]);
    return rows[0];
};

async function insertAssignment(uid, projectID) {
    const [result] = await db.query(`
    REPLACE INTO task_assignments (project_id, uid)
    VALUES (?, ?)
    `, [projectID, uid]);
    return getAssignment(projectID, uid);
};

export { getLog, getLogs, insertLog, updateLog, getTasks, insertTask, getReciepts, insertReciept, getWorkers, insertWorker, getAssignments, insertAssignment };
