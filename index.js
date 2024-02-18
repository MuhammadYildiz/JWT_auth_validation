import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authMiddleware } from "./authMiddleware.js"; /* Import js file must write file.js */
dotenv.config();
const app = express();
app.use(express.json())

/* Create user info for user Login */
const user = {
    userName: "Admin",
    email: "admin@gmail.com",
    password: "AdminPassword"
}

/*  Create refresh tokens array for save all refresh tokens in a array*/
const refreshTokens = []
/* User login with create Access token and refresh token */
app.post("/login", async (req, res) => {
    /* Get user info from user request */
    const { email, password } = req.body;
    /* Control and valid user info */
    if (email !== user.email || password !== user.password) {
        return res.status(400).json({ message: "Information is invalid" })
    }
    /* Create access token with  Validity period 2 minus or many second */
    const accessToken = jwt.sign({ email: user.email, userName: user.userName, password: user.password }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30s' })/*Validity period 30 second */
    /* Create refresh token for get new access token when access token validity period is over */
    const refreshToken = jwt.sign({ email: user.email, userName: user.userName, password: user.password }, process.env.REFRESH_TOKEN_SECRET_KEY) /* refresh token no have expires time  and use refresh token secret key*/
    /* add refresh token to refresh tokens array */
    refreshTokens.push(refreshToken)
    /* return access token and refresh token */
    return res.status(200).json({ accessToken, refreshToken })
    /* Usr postman and get accessToken */
})
console.log(refreshTokens);

/* Use refresh  token for create new access token   in Postman*/
app.post("/refresh", async (req, res) => {
    /* get refresh token after user login fro, user request */
    const { refreshToken } = req.body;
    /* control refresh token is valid or not */
    if (!refreshToken) {
        return res.status(400).json({ message: "Wrong Request" })
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(400).json({ message: "Wrong Request, Your are a invalid user" })
    }
    /* Verify Refresh token and user data after user login with jwt.verify*/
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json(err)
        }
        /* Create new access token  agin in  refresh method*/
        const accessToken = jwt.sign({ email: data.email, userName: data.userName, password: data.password }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '30s' })/*Validity period 2 minus */
        /* Return new access token  */
        return res.status(200).json({ newAccessToken: accessToken })
    })
})
/* Create fruits array for user get data after user login*/
const fruitsArray = [
    {
        name: "Apple",
        color: "Red",
        price: 20
    },
    {
        name: "Banana",
        color: "Yellow",
        price: 30
    },
    {
        name: "Orange",
        color: "Green",
        price: 25
    },
]

/* User get data after login and get access token, refresh token */
app.get("/fruits", authMiddleware, (req, res) => {
    console.log(req.user);
    return res.json(fruitsArray)
})
/* remove user's refresh token from refreshTokens array  when  user Logout*/
app.post("/logout", (req, res) => {
    console.log(refreshTokens);
    /* 1. remove refreshToken from refreshTokens Array */
    refreshTokens.filter((token) => token !== req.body.refreshToken)
    console.log(refreshTokens);
    return res.status(200).json({ message: "Logout successful!" })
})
app.listen(process.env.PORT, () => {
    console.log("Project working on port" + process.env.PORT);
})