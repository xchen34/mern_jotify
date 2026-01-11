import jwt from "jsonwebtoken";

//服务器用 JWT_ACCESS_SECRET 把用户身份“签名”成 access token，然后返回给浏览器15分钟有效期
//15分钟内用户不用重新登录，直接用这个 token 访问受保护的 API 接口
//secret是用来生成
export function signAccessToken(payload){
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: "15m",});
}


//在不重新登录的前提下，合法地生成新的 access token 
//是生成一张
// 7 天有效的“长期凭证”（refresh token），
// 它本身 什么接口都不能访问，
// 只能在 access token 过期时，
// 用来向服务器 换取一个新的 access token。
//7天内用户不用重新登录，直接用这个 token 换取新的 access token
export function signRefreshToken (payload){
    return jwt.sign (payload, process.env.JWT_REFRESH_SECRET, {expiresIn: "7d",});
}


// Payload = the user data you want to store inside the token
// Example: const payload = { userId: "12345", email: "user@example.com" }
// When the token is decoded later, you get this data back to identify the user

// JWT 并不会加密 payload。
// payload 是 明文的，只是被 base64 编码。
// 用最短的方式解释清楚
// JWT 里发生的三件事（按顺序）
// payload → base64 编码
// 👉 只是“换一种写法”，不是加密
// 用 secret 计算签名（signature）
// 👉 防篡改、防伪
// 把三段拼起来 → token
//签名不是为了确认“是不是本人”，
// 而是确认 token 是服务器发的、没被改过
// token 不能泄露，
// 不是因为能看到信息，
// 而是因为 谁拿着 token，谁就拥有这个用户的权限
//JWT 真正解决的问题只有一个

// “这个请求是谁发的，而且有没有被篡改？”
// 它不负责保密。
// 如果你真的需要“加密 payload”怎么办？
// 那是另一个体系：
// 🔒 JWE（JSON Web Encryption）
// 🔒 或者：payload 里只放 id，真正数据查数据库
// 给你一句“防误解警句”（很有用）
// JWT ≠ 加密
// JWT = 明文 + 防伪签名