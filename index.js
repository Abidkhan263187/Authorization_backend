const express = require("express")
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();


const { connection } = require("./db")
const { signupModel } = require('./signUpModel')
const {projectModel}=require('./projectModel')

const app = express()
app.use(express.json())
app.get('/', (req, res) => {
    res.send("hello  from welcome page")
})


const authenticate = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
        return res.status(401).send({ msg: "please login again" })
    }

    const decoded = jwt.verify(token, process.env.SECRET);
     console.log(decoded)
    const {email}= decoded
      req.email= email  // we are setting the email in req.email 

    if (decoded) {
        next()
    }
    else {
        res.status(401).send("please login again")
    }

}
const authorization =(userrole)=>{
   return async (req, res, next) => {
        console.log(req.email)
          const { role } = await signupModel.findOne({ email: req.email })
          console.log(role)
          if ( userrole.includes(role)) {
              next()
          }
          else {
              res.status(401).send({ msg: "you are not authorized to acces this" })
          }
      }
} 



app.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log(email, name, password)

    const hash_password = bcrypt.hashSync(password, 8);
    try {

        const signupUser = await signupModel.create({
            email,
            name,
            password: hash_password,
            role
        })

        res.status(200).send({ msg: "signup successfully", signupUser })
    } catch (error) {
        console.log(error)
        res.status(500).send("signup failed")
        console.log("error while signup")
    }

})




app.post('/login', async (req, res) => {
    const { email, password } = req.body
    // console.log(email)
    const user = await signupModel.findOne({ email: email })
    try {
        const verify = bcrypt.compareSync(password, user.password);
        if (verify) {
            const token = jwt.sign({ email: user.email }, process.env.SECRET)    // algo+ payload +scretKey  generate token
            res.send({ mssg: "credentials match", "token": token })
        } else {
            res.status(401).send({ msg: "invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.status(500).send("login failed")
        console.log("error while signup")
    }


})

app.get('/projects', authenticate,authorization(["seller","customer","admin"]) ,async (req, res) => {


        const projects= await  projectModel.find()
     res.status(200).send({projects})

})


app.post('/projects/create', authenticate,authorization(["seller","abid"]), async (req, res) => {

    const { title, description } = req.body;

    try {
        if(req.body){
            const project = projectModel({
                title,
                description
            })
            await project.save()
            res.status(200).send("project created successfully")
        }else{
           res.status(400).send("provide all the details for the project")
        }
    } catch (error) {
        console.log("error while creating project")
        console.log(error)
        res.status(400).send("please fill details correctly")
    }

})


// only for customer 
app.get("/finance", authenticate,authorization(["customer"]), (req, res) => {
    res.status(200).send("successfully authenticated on finance0 page ")
})

app.get('/admin', authenticate,authorization(["admin"]),(req,res)=>{
    res.status(200).send("successfully authenticated on admin page ")
})



app.post('/projects/delete/:id', authenticate,authorization, (req, res) => {


    res.status(200).send("successfully deleted")
})

app.get('/cart', authenticate, (req, res) => {
    res.status(200).send("successfully authenticated on cart page ")

})


app.listen(9000, async () => {
    try {
        await connection
        console.log("connection established")
    } catch (error) {
        console.log("error while connecting")
    }
    console.log("listening on 9000")
})