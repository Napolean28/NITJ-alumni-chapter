const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

//SET API KEY TO SEND VERIFICATION EMAILS
sgMail.setApiKey('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');

//TO RESPOND TO GET AND POST REQUEST.
const app = express();

//TO GET THE DATA FROM SUBMITED FORMS.
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//LINK THE DATABASE
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'alumnichapter'
});

//CONNECT TO THE DATABASE
db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Database connected.')
    }
});

//SPECIFIY THE ROOT DIRECTORY AS CURRENT DIRECTORY.
app.use(express.static(__dirname));

app.set( 'port', ( process.env.PORT || 3000 ));

// Start node server
app.listen( app.get( 'port' ), function() {
  console.log( 'Node server is running on port ' + app.get( 'port' ));
  });


//RESPOND WITH index.html WHEN THE PORT 3000 IS REACHED.
app.get('/', (req, response)=>{
    response.sendFile('userregistration.html', {root: '.'});
});

app.post('/register', urlencodedParser, (req, res)=>{
    // console.log(req.body.emailId);
    //GENRATE A RANDOM NUMBER 
    const OTP = parseInt((Math.random()*100000)+1);
    console.log(OTP);

    //SEND THIS OTP TO MAIL.
    const msg = {
    to: `${req.body.emailId}`,
    from: 'alumnichapter@nitj.ac.in',
    subject: 'Alumni Chapter CSE NITJ',
    text: `Dr. B. R. Ambedkar National Institue of Technology Jalandhar, Punjab Dear ${req.body.FirstName} ${req.body.LastName} Your One Time Password for email verification is ${OTP} Thankyou for registering with NITJ CSE Alumni Chapter Regards NITJ Alumni Chapter Team Thankyou`,
    html: `<body><center><div class="container"><div style="padding-top: 10px"><img src="http://i67.tinypic.com/s48f1k.png" alt="NIT Jalandhar" style="width:5%;max-width: 90px;min-width: 70px;"><br><div style="margin-top: 10px;"><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</div></div><div style="padding: 15px;"><h3>Dear ${req.body.FirstName} ${req.body.LastName}<br></h3>Your One Time Password for email verification is <strong>${OTP}</strong>.<br>Thankyou for registering with NITJ CSE Alumni Chapter<br>Regards NITJ Alumni Chapter Team</div><div style="background: linear-gradient(90deg, #DA4453, #89216B);color: white; padding: 5px;margin-top: 15%;"><b>Thank you</b></div></div></center></body>`,
    };

    // sgMail.send(msg);

    const markup = `<!DOCTYPE html> <html> <head> <link rel="stylesheet" type="text/css" href="./css/userregistration.css"> <title>Verify Email</title> <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"> </head> <body> <div class="container"> <div id="headDiv"> <img src="./images/nitjlogo.png" alt="NITJ" id="logo"> <span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span> </div> <!-- <h1 id="h1">Verify Email</h1> --> <h4>Verify Email</h4> <div class="mainOption"> <form action="/verify" method="post"> <label for="OTP">Enter the OTP sent to ${req.body.emailId}</label> <br><br> <input type="hidden" name="emailId" value="${req.body.emailId}"> <input type="hidden" name="FirstName" value="${req.body.FirstName}"> <input type="hidden" name="LastName" value="${req.body.LastName}"> <input type="number" name="OTP" id="OTP" placeholder="OTP"> <input class="p3" type="submit" name="signupButton" value="Done" > </form> </div> </div> </body> </html>`;
    res.writeHead(200, { 'content-type': 'text/html' });

    //TO ADD EMAIL AND OTP TO DATABASE FIRST
    //CHECK WHETHER THE EMAILID IS ALREADY PRESENT IN DATABASE.
        //IF PRESENT, CHECK WHETHER VERIFIED OR NOT.
        //IF NOT PRESENT, ADD THE USER TO THE DATABASE.
    
    //CHECK WHETHER EMAILID IS PRESENT IN DATABASE.
    let sql = `SELECT COUNT(*) FROM credentials WHERE email = '${req.body.emailId}'`;
    db.query(sql, (err, result)=>{
        if(err){
            console.log('Check User error: ', err);
        }else{
            // // console.log(result[0]['COUNT(*)']);
            //EMAIL ID IS ALREADY PRESENT IN DATABASE.
            //CHECK WHETHER THE USER IS ALREADY VERIFIED.
            if(result[0]['COUNT(*)']){
                sql = `SELECT verified FROM credentials WHERE email = '${req.body.emailId}'`;
                db.query(sql, (err, result)=>{
                    if(err){
                        console.log('Verified or not error: ', err);
                    }else{
                        //THE USER IS ALREADY VERIFIED.
                        // // console.log(result[0]['verified']);
                        if(result[0]['verified']){
                            sql = `SELECT COUNT(*) FROM users WHERE email = '${req.body.emailId}'`;
                            db.query(sql, (err, result)=>{
                                if(err){
                                    console.log('User details retrival error: ',err);
                                }else{
                                    if(result[0]['COUNT(*)']){
                                        //USER'S PERSONAL DETAILS ARE ALREADY PRESENT.
                                        console.log('Already Verified.');
                                        res.write(`<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="./css/userregistration.css"><title>Verified User</title><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"></head><body><div class="container"><div id="headDiv"><img src="./images/nitjlogo.png" alt="NITJ" id="logo"><span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span></div><h4>Dear ${req.body.FirstName} ${req.body.LastName}<br></h4>Your email address ${req.body.emailId} is already verified<br>You will be notified via email of any upcoming events.</div></body></html>`);
                                        res.end();
                                    }else{
                                        //USER'S PERSONAL DETAILS ARE NOT YET OBTAINED, SO GET THE PERSONAL DETAILS.
                                        console.log('Get Personal Details');  
                                        res.write(`<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="./css/userregistration.css"><title>Personal Details</title><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"></head><body><div class="container"><div id="headDiv"><img src="./images/nitjlogo.png" alt="NITJ" id="logo"><span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span></div><!-- <center> --><h4>Personal Details</h4><div class="mainOption"><form action="/details" method="post"><input type="hidden" name="emailId" value="${req.body.emailId}"><input type="hidden" name="FirstName" value="${req.body.FirstName}"><input type="hidden" name="LastName" value="${req.body.LastName}"><select name="course" id="course" required><option value="" disabled selected hidden>Course</option><option value="btech">B.Tech</option><option value="mtech">M.Tech</option><option value="phd">Ph.D.</option></select> <input type="text" name="year" placeholder="Year of Passing" required> <input type="text" name="workingat" placeholder="Working At: " required> <input type="text" name="designation" placeholder="Working As: " required> <select name="gender" id="gender" required><option value="" disabled selected hidden>Gender</option><option value="Male">Male</option><option value="Female">Female</option></select> <input class="p3" type="submit" name="signupButton" value="Submit" ></form></div><!-- </center> --><!-- <h1 id="h1">Personal Details</h1> --></div></body></html>`);
                                        res.end();
                                    }
                                }
                            })
                            
                        }else{
                            //USER IS NOT YET VERIFIED, UPDATE THE OTP AND SEND THE MAIL.
                            sql = `UPDATE credentials SET otp = ${OTP} WHERE email = '${req.body.emailId}'`;
                            db.query(sql, (err, result)=>{
                                if(err){
                                    console.log('Update OTP error: ', err);
                                }else{
                                    sgMail.send(msg);
                                    console.log('Mail Sent');
                                    console.log('OTP Updated: ', result);
                                    res.write(markup);
                                    res.end();
                                }
                            });
                        }
                    }
                });
            }else{
                //USER IS NOT ALREADY PRESENT IN THE DATABASE.
                //ENCRYPT THE PASSWORD BEFORE ADDING TO DATABASE.
                let hash = bcrypt.hashSync(req.body.password, 10);
                // // console.log('Hashed password: ', hash);

                //ADD TO THE DATABASE AND SEND OTP FOR VERIFICATION IN NEXT STEP.
                if(req.body.verifiedusing === 'email'){
                    sql = `INSERT INTO credentials (email, otp, verified, pass, verifiedusing) VALUES ('${req.body.emailId}', ${OTP}, false, '${hash}', '${req.body.verifiedusing}')`;
                }else{
                    sql = `INSERT INTO credentials (email, otp, verified, pass, verifiedusing) VALUES ('${req.body.emailId}', -1, true, '${hash}', '${req.body.verifiedusing}')`;
                }
                
                db.query(sql, (err, result)=>{
                    if(err){
                        console.log('Insertion Failed: ', err);
                        console.log(err.code);
                    }else{
                        console.log('New User Added', result);
                        if(req.body.verifiedusing === 'email'){
                            //USER REGISTERED USING EMAIL ID.
                            sgMail.send(msg);
                            console.log('Mail Sent');
                            let userInsertedResponse = `<!DOCTYPE html> <html> <head> <link rel="stylesheet" type="text/css" href="./css/userregistration.css"> <title>Verify Email</title> <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"> </head> <body> <div class="container"> <div id="headDiv"> <img src="./images/nitjlogo.png" alt="NITJ" id="logo"> <span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span> </div> <!-- <h1 id="h1">Verify Email</h1> --> <h4>Verify Email</h4> <div class="mainOption"> <form action="/verify" method="post"> <label for="OTP">Enter the OTP sent to ${req.body.emailId}</label> <br><br> <input type="hidden" name="emailId" value="${req.body.emailId}"> <input type="hidden" name="FirstName" value="${req.body.FirstName}"> <input type="hidden" name="LastName" value="${req.body.LastName}"> <input type="number" name="OTP" id="OTP" placeholder="OTP"> <input class="p3" type="submit" name="signupButton" value="Done" > </form> </div> </div> </body> </html> `;
                            res.write(userInsertedResponse);
                            res.end();
                        }else{
                            //USER REGISTERED USING GOOGLE OR LINKEDIN, HENCE IS ALREADY VERIFIED.
                            let userInsertedResponse =`<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="./css/userregistration.css"><title>Personal Details</title><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"></head><body><div class="container"><div id="headDiv"><img src="./images/nitjlogo.png" alt="NITJ" id="logo"><span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span></div><!-- <center> --><h4>Personal Details</h4><div class="mainOption"><form action="/details" method="post"><input type="hidden" name="emailId" value="${req.body.emailId}"><input type="hidden" name="FirstName" value="${req.body.FirstName}"><input type="hidden" name="LastName" value="${req.body.LastName}"><select name="course" id="course" required><option value="" disabled selected hidden>Course</option><option value="btech">B.Tech</option><option value="mtech">M.Tech</option><option value="phd">Ph.D.</option></select> <input type="text" name="year" placeholder="Year of Passing" required> <input type="text" name="workingat" placeholder="Working At: " required> <input type="text" name="designation" placeholder="Working As: " required> <select name="gender" id="gender" required><option value="" disabled selected hidden>Gender</option><option value="Male">Male</option><option value="Female">Female</option></select> <input class="p3" type="submit" name="signupButton" value="Submit" ></form></div><!-- </center> --><!-- <h1 id="h1">Personal Details</h1> --></div></body></html>`;
                            res.write(userInsertedResponse);
                            res.end();
                        }
                        
                    }
                });
            }
        }
    });
});

app.post('/verify', urlencodedParser, (req, res)=>{
    
    console.log(req.body);
    const sql = `SELECT OTP FROM credentials WHERE email='${req.body.emailId}'`;
    db.query(sql, (err, result)=>{
        if(err){
            console.log(err);
        }else{
            // console.log(result[0].OTP);
            if(parseInt(req.body.OTP) === result[0].OTP){
                //OTP WAS CORRECT
                const sql = `UPDATE credentials SET verified = true, otp=-1 WHERE email='${req.body.emailId}'`;
                db.query(sql, (err, result)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log(result);
                    }
                });
                //SEND HTML MARKUP TO GET PERSONAL DETAILS
                const markup = `<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="./css/userregistration.css"><title>Personal Details</title><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"></head><body><div class="container"><div id="headDiv"><img src="./images/nitjlogo.png" alt="NITJ" id="logo"><span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span></div><!-- <center> --><h4>Personal Details</h4><div class="mainOption"><form action="/details" method="post"><input type="hidden" name="emailId" value="${req.body.emailId}"><input type="hidden" name="FirstName" value="${req.body.FirstName}"><input type="hidden" name="LastName" value="${req.body.LastName}"><select name="course" id="course" required><option value="" disabled selected hidden>Course</option><option value="btech">B.Tech</option><option value="mtech">M.Tech</option><option value="phd">Ph.D.</option></select> <input type="text" name="year" placeholder="Year of Passing" required> <input type="text" name="workingat" placeholder="Working At: " required> <input type="text" name="designation" placeholder="Working As: " required> <select name="gender" id="gender" required><option value="" disabled selected hidden>Gender</option><option value="Male">Male</option><option value="Female">Female</option></select> <input class="p3" type="submit" name="signupButton" value="Submit" ></form></div><!-- </center> --><!-- <h1 id="h1">Personal Details</h1> --></div></body></html>`;
                res.writeHead(200, { 'content-type': 'text/html' });
                res.write(`${markup}`);
                res.end();
            }else{
                //OTP WAS INCORRECT
                //SEND HTML MARKUP TO GET THE CORRECT OTP
                const markup = `<!DOCTYPE html> <html> <head> <link rel="stylesheet" type="text/css" href="./css/userregistration.css"> <title>Verify Email</title> <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"> </head> <body> <div class="container"> <div id="headDiv"> <img src="./images/nitjlogo.png" alt="NITJ" id="logo"> <span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span> </div> <!-- <h1 id="h1">Verify Email</h1> --> <h4>Verify Email</h4> <div class="mainOption"> <form action="/verify" method="post"> <label for="OTP">Invalid OTP. Enter correct OTP sent to ${req.body.emailId}</label> <br><br> <input type="hidden" name="emailId" value="${req.body.emailId}"> <input type="hidden" name="FirstName" value="${req.body.FirstName}"> <input type="hidden" name="LastName" value="${req.body.LastName}"> <input type="number" name="OTP" id="OTP" placeholder="OTP"> <input class="p3" type="submit" name="signupButton" value="Done" > </form> </div> </div> </body> </html> `;
                res.writeHead(200, { 'content-type': 'text/html' });
                res.write(`${markup}`);
                res.end();
            }
        }
    })
});

app.post('/details', urlencodedParser, (req, res)=>{
    console.log(req.body);
    let sql = `INSERT INTO users VALUES ('${req.body.FirstName}', '${req.body.LastName}', '${req.body.emailId}', '${req.body.gender}', ${req.body.year},'${req.body.designation}', '${req.body.workingat}', '${req.body.course}')`;
    db.query(sql, (err, result)=>{
        if(err){
            console.log('User insertion failed', err);
        }else{
            //USER HAS BEEN SUCCESFULLY REGISTERED.
            console.log('User Insertion succesful', result);
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(`<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="./css/userregistration.css"><title>Thankyou</title><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"></head><body><div class="container"><div id="headDiv"><img src="./images/nitjlogo.png" alt="NITJ" id="logo"><span><b>Dr. B. R. Ambedkar National Institue of Technology</b><br>Jalandhar, Punjab</span></div><h4>Dear ${req.body.FirstName} ${req.body.LastName}<br></h4>Thankyou for registering with NITJ CSE Alumni Chapter.<br>You will be notified via email of any upcoming events.</div></body></html>`);
            res.end();
        }
    })
});