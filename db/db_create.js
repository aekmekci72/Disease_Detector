const db = require("./db_connection");

/**** Delete *CONTENTS OF* existing tables (but not dropping tables themselves) ****/

const delete_patient_table_sql = "DELETE FROM patient;"

db.execute(delete_patient_table_sql);


/**** Create some sample subjects and assignments ****/

const insert_patient_sql = `
    INSERT INTO patient 
        (patient_id, age, dob, height, weight) 
    VALUES 
        (?, ?, ?, ?, ?);
`

db.execute(insert_patient_sql, [1, 14, "2008-05-19", "64", "105"]);
db.execute(insert_patient_sql, [2, 3, "2021-02-11", "36", "60"]);
db.execute(insert_patient_sql, [3, 27, "1995-12-07", "64", "123"]);
db.execute(insert_patient_sql, [4, 50, "1972-10-23", "64", "135"]);
db.execute(insert_patient_sql, [5, 104, "1919-04-30", "64", "112"]);




db.end();