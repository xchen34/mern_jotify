import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { signAccessToken, signRefreshToken } from "../config/jwt.js";
import { z } from "zod"; //用于验证输入数据



// 这里的 Zod 是什么？只查格式还是查数据库？
// Zod 是一个工具库：没错，它专门用来做数据验证（Validation）。
// 它只查“格式” 这样你就不用单独写if (email.includes("@")) ... 这种繁琐的判断了
//确保用户在注册时提交了合法的邮箱、符合长度要求的密码，以及可选的名字。
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().max(50).optional(),
});

//确保用户在登录时提交了合法的邮箱和符合长度要求的密码。
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
});

//当用户登录或刷新 Token 时，调用此函数把长效的 refreshToken 种在浏览器里。
//res.cookie()第一个参数是
const setRefreshCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true, //// 关键安全设置：防止前端 JS 代码 (如 XSS 攻击) 访问此 Cookie
        secure: true,// 仅允许通过 HTTPS 传输 (开发环境下如果用 HTTP 可能会导致无法设置，通常需配合环境判断)
        sameSite: "strict",// 防止 CSRF 攻击，要求请求必须来自同一站点
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie有效期7days ms毫秒为单位
    });
}

export const guest = async (req, res) => {
    try {
        // 检查环境变量是否加载
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.error("❌ ERROR: JWT_ACCESS_SECRET or JWT_REFRESH_SECRET is missing in .env");
            return res.status(500).json({ message: "Server configuration error (Missing JWT Secrets)" });
        }

        const guestId = crypto.randomBytes(16).toString("hex"); // 兼容旧版 Node.js
        const payload = { sub: guestId, typ: "guest" };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        setRefreshCookie(res, refreshToken);
        console.log("✅ Guest login successful for ID:", guestId);
        res.json({ accessToken, mode: "guest" });
    } catch (error) {
        console.error("❌ Guest Login Error:", error);
        res.status(500).json({ message: "Internal Server Error during Guest Login" });
    }
};

export const signup = async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

    const { email, password, name = "" } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, name });

    const payload = { sub: user._id.toString(), typ: "user", email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ accessToken, user: { id: user._id, email: user.email, name: user.name } });

};
export const login = async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { sub: user._id.toString(), typ: "user", email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name } });

};
export const refresh = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const payload = { sub: decoded.sub, typ: decoded.typ, email: decoded.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        setRefreshCookie(res, refreshToken);
        res.json({ accessToken });
    } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
export const logout = async (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully鸭鸭鸭" });
};





//这个文件 (
// authControllers.js
// ) 是运行在服务器上的逻辑代码。它可以控制能不能去访问数据库。

// 整个流程是这样的：

// 用户：点击“注册”按钮，发送数据。
// 服务器（Zod）：先看一眼数据。“咦，邮箱没写 @ 符号？” -> 直接报错，流程结束。（这一步你已经写了 Schema）
// 服务器（Controller）：如果 Zod 说格式没问题。代码会继续执行：
// 去数据库查一下：“这个邮箱在 User 表里已经存在了吗？”
// 如果存在 -> 报错“用户已存在”。
// 如果不存在 -> 用 bcrypt 把密码加密，然后存入数据库。（这一步你还没写！）



// 第三个参数 { ... } (Options 对象)
// 这是什么？：这是配置规则（或者说是“说明书”）。
// 存在哪？：这些规则会被浏览器读取并存储在 Cookie 的元数据（Metadata）里。它们不会作为数据发回给服务器，而是给浏览器看的指令。
// 看看你里面写的规则是啥意思：

// httpOnly: true (给浏览器看的)：
// 命令：“浏览器你听好了，这个 Cookie 只准通过 HTTP 请求发给服务器，不准让网页里的 JavaScript (document.cookie) 读取或修改它！”
// 目的：防止黑客写脚本偷你的 Token。
// secure: true (给浏览器看的)：
// 命令：“只有在加密链接 (HTTPS) 下才能发送这个 Cookie。”
// 目的：防止 Token 在网上传输时被窃听。
// maxAge (给浏览器看的)：
// 命令：“这饼干保质期 7 天，7 天后自动扔掉（删除）。”

// Cache (缓存) 是怎么存的？
// 不仅仅是内容，还是“复印件”：Cache 是浏览器自动在你的硬盘或内存里划了一块地，专门用来存图片、CSS、JS 文件。
// 怎么存：它像一个巨大的哈希表 (Map)。
// Key (键)：文件的网址 (URL)，比如 .../logo.png。
// Value (值)：文件的实际内容。
// 流程：下次你访问网页，浏览器先看这块地：“咦，logo.png 我之前下载过，也没过期。” -> 直接从硬盘读取，0 秒加载，不费流量。


// Session (会话) 到底是什么？
// 它是服务器记的“日记”。服务器在自己内存或数据库里建了一个档案袋（Session），专门记你的状态。
// Session 是服务器为某个用户维护的一份“跨请求的状态记录” 多个请求之间 服务器还能记得你是谁、做过什么
//服务器给每个用户分配一个sessionid 存在cookie中 下次用户访问时服务器根据sessionid找到对应的session信息

//cookie可以存在cookie但必须是 httpOnly + secure 否则就和存localStorage一样会被攻击利用如CSRF攻击 localstorage就会暴露给javascript脚本窃取XSS攻击


// | 对比        | Session   | token(jwt)           |
// | --------- | --------- | ----------------- |
// | 数据存哪      | 服务器       | 客户端               |
// | 是否有状态     | 有         | 无                 |
// | cookie 里放 | sessionId | token             |
// | XSS 风险    | 低         | 高（若 localStorage） |
// | 服务器压力     | 高         | 低                 |
// | 横向扩展      | 麻烦        | 容易                |
