const db = require("./db_connection");

/**** Read and print the subjects table ****/

const select_patients_sql = "SELECT * FROM patient";

db.execute(select_patients_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'patient' contents:")
        console.log(results);
    }
);

db.end();