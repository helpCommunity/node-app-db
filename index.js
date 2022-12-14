import coreJoi from "joi";
import joiDate from "@joi/date";
const Joi = coreJoi.extend(joiDate);
import https from "https";
import fs from "fs";
import express from'express';
const app = express();

import { getLog, getLogs, insertLog, updateLog, getTasks, insertTask, getReciepts, insertReciept, getWorkers, insertWorker, getAssignments, insertAssignment } from'./database.js';

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.json());

app.get('/', (req,res) => {
    res.send("The server is up!");
});

app.get('/api', (req,res) => {
    res.send("The api is up!");
});

// FILE DOWNLOAD ENDPOINTS
app.get('/api/download/extension', (req,res) => {
    res.download('/home/ec2-user/node-app-db/files/TolokaTracer.zip');
});

app.get('/api/download/form', (req,res) => {
    res.download('/home/ec2-user/node-app-db/files/Consent_Form_PluginTrack.pdf');
});

// LOG ENDPOINTS
app.get('/api/civic_ai/private/secure/logs/', async (req,res) => {
    const logs = await getLogs();
    res.send(logs);
});

app.get('/api/civic_ai/private/secure/logs/:id', async (req,res) => {
    const log = await getLog(req.params.id);
    if (!log) return res.status(404).send('id not found');
    res.send(log);
});

app.post('/api/logs/', async (req,res) => {
    const { error } = validateLog(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    const { uid, event, timestamp, url, tab_id } = req.body;
    const log = await insertLog(uid, event, timestamp, url, tab_id);
    res.status(201).send(log);
});

app.put('/api/logs/:id', async (req,res) => {
    const log = await getLog(req.params.id);
    if (!log) return res.status(404).send('id not found');

    const { error } = validateUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { scrollCount, blurCount, focusCount, clickCount, keypressCount } = req.body;
    const updatedLog = await updateLog(scrollCount, blurCount, focusCount, clickCount, keypressCount, req.params.id);
    res.status(201).send(updatedLog);
});

// TASK ENDPOINTS
app.get('/api/civic_ai/private/secure/tasks/', async (req,res) => {
    const logs = await getTasks();
    res.send(logs);
});

app.post('/api/tasks/', async (req,res) => {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { pool_id, project_id, title, description, hasInstructions, mayContainAdultContent, requesterID, requesterTrusted, lang, averageAcceptanceTimeSec, grade, moneyAvgHourly, moneyMax3, moneyTop10, moneyMed, pool_startedAt, reward } = req.body;
    const task = await insertTask( pool_id, project_id, title, description, hasInstructions, mayContainAdultContent, requesterID, requesterTrusted, lang, averageAcceptanceTimeSec, grade, moneyAvgHourly, moneyMax3, moneyTop10, moneyMed, pool_startedAt, reward );
    res.status(201).send(task);
});

// RECIEPT ENDPOINTS
app.get('/api/civic_ai/private/secure/reciepts/', async (req,res) => {
    const logs = await getReciepts();
    res.send(logs);
});

app.post('/api/reciepts/', async (req,res) => {
    const { error } = validateReciept(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { uid, project_id, date, income } = req.body;
    const task = await insertReciept( uid, project_id, date, income );
    res.status(201).send(task);
});

// WORKER ENDPOINTS
app.get('/api/civic_ai/private/secure/workers/', async (req,res) => {
    const logs = await getWorkers();
    res.send(logs);
});

app.post('/api/workers/', async (req,res) => {
    const { error } = validateWorker(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { uid, country, language, birthdate, joined } = req.body;
    const task = await insertWorker( uid, country, language, birthdate, joined );
    res.status(201).send(task);
});

// ASSIGNMENT ENDPOINTS
app.get('/api/civic_ai/private/secure/assignments/', async (req,res) => {
    const assignments = await getAssignments();
    res.send(assignments);
});

app.post('/api/assignments/', async (req,res) => {
    const { error } = validateAssignment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { uid, project_id }  = req.body;
    const assignment = await insertAssignment( uid, project_id );
    res.status(201).send(assignment);
});

function validateLog(log)
{
    const schema = Joi.object({
        uid: Joi.string().required(),
        timestamp: Joi.string().max(25).required(),
        event: Joi.string().max(25).required(),
        url: Joi.string().max(255).allow(null).allow(''),
        tab_id: Joi.string().max(25).required()
    });

    return schema.validate(log);
}

function validateUpdate(log)
{
    const schema = Joi.object({
        scrollCount: Joi.number().integer().min(0).required(),
        blurCount: Joi.number().integer().min(0).required(),
        focusCount: Joi.number().integer().min(0).required(),
        clickCount: Joi.number().integer().min(0).required(),
        keypressCount: Joi.number().integer().min(0).required()
    });

    return schema.validate(log);
}

function validateTask(task)
{
    const schema = Joi.object({
        project_id: Joi.number().integer().required(),
        pool_id: Joi.number().integer().required(),
        title: Joi.string().required(),
        description: Joi.string().allow('').required(),
        pool_startedAt: Joi.date().iso().required(),
        hasInstructions: Joi.boolean().required(),
        mayContainAdultContent: Joi.boolean().required(),
        requesterID: Joi.string().max(50).required(),
        requesterTrusted: Joi.boolean().required(),

        lang: Joi.string().min(2).max(2).allow(null),
        averageAcceptanceTimeSec: Joi.number().allow(null),
        grade: Joi.number().allow(null),
        moneyAvgHourly: Joi.number().allow(null),
        moneyMax3: Joi.number().allow(null),
        moneyTop10: Joi.number().allow(null),
        moneyMed: Joi.number().allow(null),
        reward: Joi.number().min(0).required()
    });

    return schema.validate(task);
}

function validateReciept(reciept)
{
    const schema = Joi.object({
        uid: Joi.string().required(),
        project_id: Joi.number().integer().required(),
        date: Joi.date().format("YYYY-MM-DD").required(),
        income: Joi.number().min(0).required()
    });

    return schema.validate(reciept);
}

function validateWorker(worker)
{
    const schema = Joi.object({
        uid: Joi.string().required(),
        country: Joi.string().max(20).required(),
        language: Joi.string().min(2).max(60).required(),
        birthdate: Joi.date().format("YYYY-MM-DD").required(),
        joined: Joi.date().format("YYYY-MM-DD").required()
    });

    return schema.validate(worker);
}

function validateAssignment(assignment)
{
    const schema = Joi.object({
        uid: Joi.string().required(),
        project_id: Joi.number().integer().required()
    });

    return schema.validate(assignment);
}


const port = process.env.PORT || 8080;
/*
app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
*/

// Provide the private and public key to the server by reading each file’s content with the readFileSync() method.
https.createServer({
    key: fs.readFileSync("/home/ec2-user/node-app-db/private.key"),
    cert: fs.readFileSync("/home/ec2-user/node-app-db/certificate.crt"),
}, app).listen(port, () => { console.log(`Listening on port ${port}...`); });
