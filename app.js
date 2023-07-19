//npx nodemon -e js,ejs,sql,env app.js
//npm run start
//npm run devstart

// set up the server
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser"); // Add this line

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
app.use(bodyParser.urlencoded({ extended: false }));



// start the server
app.listen(port, () => {
    console.log(`App server listening on ${port}`);
})

const query_select_symptom = `SELECT * FROM symptoms`;

app.get('/symptoms', (req, res, next) => {
    const username = req.query.username;
    db.query(query_select_symptom, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No symptoms found`);
        else {
            let data = { symptoms: results, username: username };
            res.render('symptoms', data);
        }
    });
});
app.get("/", (req, res) => {
    res.render('index');
});
app.get("/about", (req, res) => {
    res.render("about");
});
app.get("/open", (req, res) => {
    res.render("open");
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




const login_user_sql = `
    SELECT * 
    FROM login 
    WHERE user_name = ? AND password = ?;
`;

app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/login", (req, res) => {
    const username = req.body.user_name;
    const password = req.body.password;
  
    db.query(login_user_sql, [username, password], (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        if (results.length > 0) {
          // User login successful
          res.redirect(`/welcome?username=${username}`);
        } else {
          // Invalid username or password
          res.redirect("/login"); // Redirect back to the login page or show an error message
        }
      }
    });
  });
  



  

app.get("/signup",(req,res)=>{
    res.render("signup");
});

const query_select_riskfactors = `SELECT * FROM risk_factors`;

app.get('/riskconditions', (req, res, next) => {
    const username = req.query.username;
    db.query(query_select_riskfactors, (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);

        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No risk factors found`);
        else {
            let data = { risk_factor: results, username: username };
            res.render('riskconditions', data);
        }
    });
});

app.get("/confirmrisk", (req, res) => {
    const selectedRisks = Array.isArray(req.query.risk_factor) ? req.query.risk_factor : [req.query.risk_factor];
    const username = req.query.username;
    res.render("confirmrisk", { risk_factor: selectedRisks, username: username });
  });
  


app.get("/confirmsymptoms", (req, res) => {
    const selectedSymptoms = Array.isArray(req.query.symptom) ? req.query.symptom : [req.query.symptom];
    const username = req.query.username;
    res.render("confirmsymptoms", { symptoms: selectedSymptoms, username: username });
  });
  


const diagnosis_query = ``;



app.get("/results", (req, res) => {
    const username = req.query.username;
    // Process the selectedSymptoms data and pass it to the "confirmsymptoms" template
    res.render("results", { username: username });
});


const database_detail_sql = `
    SELECT * from past_results WHERE user_id=(SELECT user_id FROM login WHERE user_name = ?)
`


app.get('/database', (req, res, next) => {
    const username = req.query.username;
    db.query(database_detail_sql, [username],(error, results) => {
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
            let data = { patient: results[0] }; 
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


app.get("/intro", (req, res) => {
    const username = req.query.username;
    res.render("intro", { username: username })
});


app.post("/welcome", (req, res) => {
    const username = req.query.username;
    res.render("display", { username: username })
});



app.post("/intro", (req, res) => {
    const username = req.body.username;
    const {
      name_first,
      middle_initial,
      name_last,
      age,
      gender,
      weight,
      height,
      dob
    } = req.body;
  
    const values = [
      username,
      name_first || null,
      middle_initial || null,
      name_last || null,
      age || null,
      gender || null,
      weight || null,
      height || null,
      dob || null
    ];
  
    const create_patient_sql = `
        INSERT INTO patient
        (patient_id, name_first, middle_initial, name_last, age, gender, weight, height, dob)
        VALUES
        ((SELECT user_id FROM login WHERE user_name = ?), ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name_first = VALUES(name_first),
        middle_initial = VALUES(middle_initial),
        name_last = VALUES(name_last),
        age = VALUES(age),
        gender = VALUES(gender),
        weight = VALUES(weight),
        height = VALUES(height),
        dob = VALUES(dob);
  `;
  
    db.execute(create_patient_sql, values, (error, results) => {
      if (error) {
        console.log("Database error:", error);
        res.status(500).send(error);
      } else {
        console.log("Database query results:", results);
        res.redirect(`/welcome?username=${username}`);
      }
    });
  });
  
  



const create_user_sql = `
    INSERT INTO login 
        (user_name, password, email) 
    VALUES 
        (?, ?, ?);
`

app.post("/signup", ( req, res ) => {
    db.execute(create_user_sql, [req.body.user_name, req.body.password, req.body.email], (error, results) => {
        if (DEBUG)
            console.log(error ? error : results);
        if (error)
            res.status(500).send(error); 
        else {
            res.redirect(`/`);
        }
    });
});

const get_user_info_sql = `
  SELECT * FROM patient WHERE patient_id = (
    SELECT user_id FROM login WHERE user_name = ?
  );
`;
app.get("/display", (req, res) => {
    const username = req.query.username;
    db.query(get_user_info_sql, [username], (error, results) => {
        if (error) {
            res.status(500).send(error);
        } else {
            if (results.length === 0) {
                // No user found with the provided username
                res.render("display", { users: [], username: username }); // Pass the username variable to the view
            } else {
                const user = results[0]; // Retrieve the first user object
                res.render("display", { users: [user], username: username }); // Pass the username variable to the view
            }
        }
    });
});


app.post("/display", (req, res) => {
    const username = req.body.username; // Use req.query or req.body based on the request method
    res.render("welcome", { username: username }); // Update the view name to "userinformation" and pass the username variable
});


  
app.get("/welcome", (req, res) => {
    const username = req.query.username;
    res.render("welcome", { username: username });
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
