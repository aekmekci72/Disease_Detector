const db = require("./db_connection");

const delete_symptoms_table_sql = "DELETE FROM symptoms;"

db.execute(delete_symptoms_table_sql);

const insert_symptom_sql = `
    INSERT INTO symptoms 
        (symptom_id, name) 
    VALUES 
        (?, ?);
`

db.execute(insert_symptom_sql, [456789, 'Comp Sci']);
