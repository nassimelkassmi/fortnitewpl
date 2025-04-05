
function start_server_msg() {
    console.log("server listening to port", port, `and available ate http://localhost:${port}`, );
}

const port:number = 5600




import { RequestHandler } from 'express';
import ms from "ms";
import * as fs      from 'fs';
import express , { Request, Response, NextFunction } from "express";
import * as path from "path"
import cors from 'cors'
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







app.get("/",(req:any, res:any) => {
    res.sendFile(path.resolve(__dirname, "./public/landingpage.html"))
})

const secrets = ["donut", "cake", "muffin","ice cream", "pizza"]

function get_secret() {
    let rand_index = Math.round(Math.random() * (secret.length - 1) )
    console.log(rand_index);
    
    return secrets[rand_index]
}




function handleNewUser(req:Request, res:Response):any {
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
    
    
    const newUser:User = {"username":user, "password":hashedpwd, "refreshtoken":"", "secret": get_secret(),"email":email}
    users.push(newUser)
    console.log(users);
    
    res.status(200)
    res.end(JSON.stringify({"success":true}))

}



app.post("/register",handleNewUser)


app.post("/login", (req: Request, res: Response) => {
    loginuser(req,res)
    res.end()
})

app.post("/secret", verifyJWT, secret)



app.get("/username", verifyJWT, getusername)

app.get("/logout", (req: Request, res: Response) =>{
    console.log("user ;logging out");
    
    logoutuser(req,res)
    res.end()
})


app.get("/refresh", (req: Request, res: Response) =>{
    console.log("bob");
    
 createNewAccessToken(req,res)
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
    

    
    if (!foundUser) { 
        console.log("did not find user4");
        return res.status(403)
    } 

    jwt.verify(refreshtoken, REFRESH_TOKEN_SECRET, (err:any, decoded:any) => {
        if (err || foundUser.username != decoded.username) {
            console.log("user not found");
            return res.status(403)
        }
        foundUser.refreshtoken = ""
    })
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

    if (match != undefined) {
        res.json(match.secret) //possibly incorrect
    }
    
    res.end()
}



let users:[User] = [{"username":"", "password":"", "refreshtoken":"", "secret": "","email":""}]
users.pop()

function loginuser(req: Request, res: Response) {
    const {user, pwd} = req.body
    if (!user || !pwd) { 
        res.status(400).json({"message":"username and password are required"})
        return 0
    }

    const foundUser = users.find(person => person.username === user)
    console.log("user is", user);
    console.log(foundUser);
    
    
    if (!foundUser) { 
        console.log("did not find use2r");
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

function verifyJWT(req: Request, res: Response, next: NextFunction):any {
    
    const authHeader = req.headers["authorization"] 
    if (!authHeader) {
        res.sendStatus(401)
        return 1
    }
    console.log(" ");
    
    console.log(authHeader.split(" "));
    
    const token = authHeader.split(" ")[1]
    //console.log("token is ", token);
    
    jwt.verify(token, ACCESS_TOKEN_SECRET,
        (err: any, decoded: any) => {
            if (err) { console.log("jwt does not match"); res.sendStatus(403)}
            res.locals.username = decoded 
            next()
            
        }
    )
}


type User = {
    "username":string,
    "password":string,
    "refreshtoken":string,
    "secret": string,
    "email":string
}


type checkjwt = {"if_match":boolean, "username":string}

function checkjwt(refreshtoken:string, secret_key:string):checkjwt {
    let match:checkjwt = {"if_match":false, "username":""}
    function set_token_user(err:any, decoded:any) { 
        if (err){ 
              }  
              match.if_match = true 
              match.username = decoded.username 
    }
    jwt.verify(refreshtoken, secret_key, set_token_user)
    return match
}



function createNewAccessToken(req: Request, res: Response) {
    const cookies = req.cookies
    if (!cookies?.jwt){        
        return res.status(401)
    }
    const refreshtoken:string = cookies.jwt
    const Usermatch:User | undefined = users.find(person => person.refreshtoken === refreshtoken)
    const if_token_valid:checkjwt = checkjwt(refreshtoken, REFRESH_TOKEN_SECRET)
    
    console.log("usermatch is ", Usermatch);
    console.log(if_token_valid);
    console.log(refreshtoken);
    
    
    if (!Usermatch || !if_token_valid.if_match || Usermatch.username !== if_token_valid.username) { 
        let log_responds = if_token_valid ? "did not find user1" : "token is invalid"
        log_responds = Usermatch ? log_responds : "the user the token is signed by and the matching user are not the same"
        console.log(log_responds);
        return res.status(403)} 
    
    //create new access token
    const accesstoken = jwt.sign({"username": Usermatch.username}, ACCESS_TOKEN_SECRET, {expiresIn:"60s"})
    
    res.json({accesstoken})
}


//order mathers
app.all("/*splat", (req: Request, res: Response) =>{
    res.status(404).send("not found")
})

app.listen(port, start_server_msg)