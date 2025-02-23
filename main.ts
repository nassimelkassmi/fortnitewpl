
function start_server_msg() {
    console.log("server listening to port 5000");
}




const __dirname = import.meta.dirname

import ms from "ms";
import * as http    from 'http';
import * as fs      from 'fs';
import express , { Request, Response, NextFunction } from "express";
import * as path from "path"
import cors from 'cors'
import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
import crypto from "crypto"
import { log } from "console";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser"
const rawdata = fs.readFileSync('token_secrets.json', "utf8"); 
const tokens = JSON.parse(rawdata);


const ACCESS_TOKEN_SECRET = tokens.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = tokens.REFRESH_TOKEN_SECRET;




const app = express()
app.use(cors())
app.use(express.static("./public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser());







app.get("/",(req, res) => {
    res.sendFile(path.resolve(__dirname, "./public/landingpage.html"))
})

const secrets = ["donut", "cake", "muffin","ice cream", "pizza"]

function get_secret() {
    let rand_index = Math.round(Math.random() * (secret.length - 1) )
    console.log(rand_index);
    
    return secrets[rand_index]
}


function handleNewUser(req, res) {
    const {user, pwd, email} = req.body
    if (!user || !pwd)
        {return res.status(400).json({"message":"username and password are required"})}
     
    const duplicate = users.find(person => person.username === user)
    if(duplicate) {
        console.log("duplicate user");
        
        return res.sendStatus(409)
    };
    const hashedpwd = bcrypt.hashSync(pwd, 10)
    const check = bcrypt.compareSync(pwd, hashedpwd)
    console.log(check);
    
    
    const newUser = {"username":user, "password":hashedpwd, "refreshtoken":"", "secret": get_secret(),"email":email}
    users.push(newUser)
    console.log(users);
    
    res.status(200)
    res.end(JSON.stringify({"success":true}))

}


app.post("/register",handleNewUser)

app.post("/login", (req,res) => {
    loginuser(req,res)
    res.end()
})

app.post("/secret", verifyJWT, secret)

app.get("/username", verifyJWT, getusername)

app.get("/logout", (res,req) =>{
    console.log("user ;logging out");
    
    logoutuser(res,req)
    req.end()
})


app.get("/refresh", (req,res) =>{
    console.log("bob");
    
    handlerefreshtoken(req,res)
    res.end()
})


function logoutuser(req: Request, res: Response) {
    console.log("logging out user ");
    
    const cookies = req.cookies
    if (!cookies?.jwt){        
        console.log("invalid cookie for logging out");
        console.log(req.cookies);
        
        return res.status(401)
    }
    const refreshtoken = cookies.jwt
    const foundUser = users.find(person => person.refreshtoken === refreshtoken)
    console.log(foundUser);
    
    if (!foundUser) { 
        console.log("did not find user");
        return res.status(403)
    } 
    function somew(err, decoded) {
        if (err || foundUser.username != decoded.username) {
            console.log("user not found");
            return res.status(403)
        }

        foundUser.refreshtoken = ""
    }
    jwt.verify(refreshtoken, REFRESH_TOKEN_SECRET, somew)
}


function getusername(req: Request, res: Response) {
    let user = res.locals.username 
    if (user) {
        res.json(res.locals.username)
    }else{res.status(409)}
    res.end()
}


function secret(req: Request, res: Response, next:NextFunction) {
    let user = res.locals.username 
    if (!user) {next()}
    let match = users.find(person => person.username = user)
    if (!match) {next()}

    res.json(match.secret)
    res.end()
}



let users = []

function loginuser(req: Request, res: Response) {
    const {user, pwd} = req.body
    if (!user || !pwd) { 
        res.status(400).json({"message":"username and password are required"})
        return 0
    }

    const foundUser = users.find(person => person.username === user)
    if (!foundUser) { 
        console.log("did not find user");
        res.status(401)
        return 0
    }
    const match = bcrypt.compareSync(pwd,foundUser.password)
    if (match) {
        const accesstoken = jwt.sign({"username":foundUser.username}
            ,ACCESS_TOKEN_SECRET, {expiresIn: "60s"}
        )
        const refreshstoken = jwt.sign({"username":foundUser.username}
            ,REFRESH_TOKEN_SECRET, {expiresIn: "1d"}
        )
        foundUser.refreshtoken = refreshstoken
        res.cookie("jwt", refreshstoken, {httpOnly:true, maxAge:ms("1d")  })
        res.json({accesstoken})
    }else{
        console.log("the password and thing dont match");
        
        res.sendStatus(401)
    }

}

function verifyJWT(req: Request, res: Response,next:NextFunction) {
    
    const authHeader = req.headers["authorization"] 
    if (!authHeader) {
        res.sendStatus(401)
    }
    console.log(" ");
    
    console.log(authHeader.split(" "));
    
    const token = authHeader.split(" ")[1]
    //console.log("token is ", token);
    
    jwt.verify(token, ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) { console.log("jwt does not match"); res.sendStatus(403)}
            res.locals.username = decoded 
            next()
            
        }
    )
}






function handlerefreshtoken(req: Request, res: Response) {
    
    
    const cookies = req.cookies
    if (!cookies?.jwt){        
        console.log("geen cookies");
        console.log(req.cookies);
        
        return res.status(401)
        
    }
    const refreshtoken = cookies.jwt
    const foundUser = users.find(person => person.refreshtoken === refreshtoken)
    if (!foundUser) { 
        console.log("did not find user");
        return res.status(403)} 

    
    function somew(err, decoded) {
        if (err || foundUser.username != decoded.username) {
            return res.status(403)
        }
        const accesstoken = jwt.sign({"username": decoded.username},
             ACCESS_TOKEN_SECRET, {expiresIn:"60s"})
        console.log("refreshed the token", decoded.username);
        res.json({accesstoken})
    }
    jwt.verify(
        refreshtoken, REFRESH_TOKEN_SECRET, somew
    )

}


//order mathers
app.all("*", (req, res) =>{
    res.status(404).send("not found")
})

app.listen(5000, start_server_msg)