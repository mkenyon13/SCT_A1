import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as http from 'http';
import * as dotenv from "dotenv"

// load variables from .env file
dotenv.config()

/**
 * This is a OWASP A02:2021 Cryptographic Failure.
The problem is that the username and the password for the database is being shared in the code.
This is not safe because sensitive personal data in the code is being shared on GitHub or online in general. 
this is a security risk because anyone can log into your database if they get the password and log in.
to fix this you can use a .env file that stores all of the personal data using variables assigned to each password and username. 
then you can import them to the main file and just use the variables from the .env file. 
to make sure that the .env file is not uploaded to GitHub you can put it into a .gitiignore file.
 */
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};
/**
 * 
 * This is OWASP A01:2021 Broken Access Control.
the issue is that this code is connoting to the database using the admin account,
this is not a safe way to do this because if someone you don't want to logs into the database without you knowing they will have full control of the database.
to fix this we need to provide a account that does not have full access to the database and only has user permissions.
 */

function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    /**
 * This is a OWASP A04:2021 Insecure Design

the problem is that it accepts any input that the user enters without checking and making sure that its not something that could cause problems to the security.
to fix this you can add input validation that allows letters and spaces only or something that gets rid of hidden characters. 
doing this will make it safer because it does not trust the users inputs.
 * 
 */
    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            // added basic input validation so the user can only add letters and numbers. 
            const cleanedAnswer = answer.replace(/[^a-zA-Z\s]/g, '').trim();
            rl.close();
            resolve(cleanedAnswer);
        });
    });
}

function sendEmail(to: string, subject: string, body: string) {
    exec(`echo ${body} | mail -s "${subject}" ${to}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error sending email: ${error}`);
        }
    });
}

/**
 * 
 * This is a OWASP A02:2021 Cryptographic Failure.

the problem with this is that the code is using http instead of https which sends the data without encryption. this can cause a problem because anyone can change the data.
to fix this security problem just change the http to https.
 */
// changed it to https insted of http
function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get('https://insecure-api.com/get-data', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const query = 'INSERT INTO mytable (column1, column2) VALUES (?, ?)';
    const values = [data, 'Another Value'];

    /**
     * // OWASP A09:2021 Security Logging and Monitoring Failures
            // The issue is that console.error shows full error details that can leak information
            // To fix this, only log what’s needed and don’t print sensitive information.
     */
    connection.connect();
    connection.query(query, (error, results) => {
        if (error) {
            // removed the error from the output so it does not leak sensative information
            console.error('Error executing query:');
        } else {
            console.log('Data saved');
        }
        connection.end();
    });
}

(async () => {
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
})();