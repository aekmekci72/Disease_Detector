//npx nodemon -e js,ejs,sql,env app.js
//npm run start
//npm run devstart

// set up the server
const express = require("express");
const logger = require("morgan");
const app = express()
const port = 3031;
const DEBUG = true;
const db = require("./db/db_connection");

// Configure Express to use EJS
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

app.use(logger("dev"));
app.use(express.static(__dirname+'/public'));
app.use( express.urlencoded({ extended: false }) );




// start the server
app.listen(port, () => {
    console.log(`App server listening on ${port}`);
})

const query_select_symptom = `SELECT * FROM symptoms`;

app.get('/intro/riskconditions/confirmrisk/symptoms', (req, res, next) => {
    db.query(query_select_symptom, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No symptoms found]`);
        else {
            let data = { symptoms: results }; 
            res.render('symptoms', data);
        }
    });
});

app.get("/", (req, res) => {
    res.render('index');
});
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.get("/abstract",(req,res)=>{
    res.render("abstract");
});

app.get("/credits",(req,res)=>{
    res.render("credits");
});

app.get("/ourteam",(req,res)=>{
    res.render("ourteam");
});

app.get("/intro",(req,res)=>{
    res.render("intro");
});

const query_select_riskfactors = `SELECT * FROM risk_factors`;

app.get('/intro/riskconditions', (req, res, next) => {
    db.query(query_select_riskfactors, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No risk factors found`);
        else {
            let data = { risk_factor: results }; 
            res.render('riskconditions', data);
        }
    });
});


app.get("/intro/riskconditions/confirmrisk",(req,res)=>{
    res.render("confirmrisk");
});


app.get("/intro/riskconditions/confirmrisk/symptoms/confirmsymptoms", (req, res) => {
    res.render("confirmsymptoms");
});


const diagnosis_query = ``;

app.get('/intro/riskconditions', (req, res, next) => {
    db.query(query_final_algorithm, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No risk factors found`);
        else {
            let data = { risk_factor: results }; 
            res.render('riskconditions', data);
        }
    });
});

app.get("/intro/riskconditions/confirmrisk/symptoms/confirmsymptoms/results",(req,res)=>{
    res.render("results");
});



const database_detail_sql = `
    SELECT * from patient
`


app.get('/database', (req, res, next) => {
    db.query(database_detail_sql, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else {
            let data = { patient: results }; 
            res.render('database', data);
        }
    });
});

const get_patient_stuff_sql = `
    SELECT * FROM patient
    WHERE patient_id = ?
`;

app.get('/database/:id/details', (req, res, next) => {
    db.query(get_patient_stuff_sql, [req.params.id], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No patient found with id = "${req.params.id}"`);
        else {
            let data = { patient: results[0] }; // Access the first patient object from the results
            res.render('details', data);
        }
    });
});



const delete_patient_xref_sql = `
    DELETE 
    FROM
        login_patient_xref
    WHERE
        patient_id = ?
`
const delete_patient_sql = `
    DELETE
    FROM
        patient
    WHERE
        patient_id = ?
`
app.get("/database/:id/delete", ( req, res ) => {
    db.execute(delete_patient_xref_sql, [req.params.id], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); 
    });
    db.execute(delete_patient_sql, [req.params.id], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); 
        else {
            res.redirect("/database");
        }
    });
});

const create_patient_sql = `
    INSERT INTO patient
        (name_first, middle_initial, name_last, age, gender, weight, height, dob)
    VALUES
        (?, ?, ?, ?, ?, ?, ?, ?);
`

app.post("/intro", ( req, res ) => {
    db.execute(create_patient_sql, [req.body.name_first, req.body.middle_initial, req.body.name_last, req.body.age, req.body.gender, req.body.weight, req.body.height, req.body.dob], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); 
        else {
            res.redirect(`/intro/riskconditions`);
        }
    });
});


// const update_patient_stuff_sql = `
//     UPDATE
//         patient
//     SET
//         name_first = ?,
//         middle_initial = ?,
//         name_last = ?, 
//         age = ?,
//         gender = ?,
//         weight = ?,
//         height = ?,
//         dob = ?
//     WHERE
//         patient_id = ?


const update_patient_stuff_sql = `
    UPDATE 
        patient
    SET 
        name_first = ?,
        middle_initial = ?,
        name_last = ?,
        age = ?,
        gender = ?,
        weight = ?,
        height = ?,
        dob = ?
    WHERE 
        patient_id = ?
`

app.post('/database/update/:id', (req, res) => {
    const patient_id = req.params.id;
    const values = [
        req.body.name_first,
        req.body.middle_initial,
        req.body.name_last,
        req.body.age,
        req.body.gender,
        req.body.weight,
        req.body.height,
        req.body.dob,
        patient_id
    ];

    db.execute(update_patient_stuff_sql, values, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error);
        else {
            res.redirect(`/database`);
        }
    });
});
