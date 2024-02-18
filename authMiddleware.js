import Jwt from "jsonwebtoken"
/* MiddleWare must have next */
export const authMiddleware = (req, res, next) => {
    /* Get token authorization from req.headers  and split it for get second element*/
    const token = req.headers['authorization']?.split(' ')[1]
    /* Control token */
    if (!token) {
        return res.status(401).json({ message: "You are not an authorized user!, Please Login!" })
    }
    /* Verify token with jwt.verify */
    Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (error, user) => {
        if (error) {
            console.log(error);
            return res.status(400).json(error);
        }
        req.user = user;
        next();
    })
}
