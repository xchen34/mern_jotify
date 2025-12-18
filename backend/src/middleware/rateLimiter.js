import ratelimit from "../config/upstash.js"

import fetch from "node-fetch";
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

//实现具体的业务逻辑 做一些checks
const rateLimiter = async (req, res, next) => {
    try{
        const {success} = await ratelimit.limit("my-limit-key")
        if (!success) {
            return res.status(429).json({message: "Too many requests"})
        }
        next();
    } catch (error) {
        console.log("Rate limit erro 鸭鸭鸭", error);
          next(error);
    }
};

export default rateLimiter;