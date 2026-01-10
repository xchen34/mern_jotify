import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
    //获取请求头中的授权信息 Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const auth = req.headers.authorization || ""; 
   //检查是否以"Bearer "开头(持有者的意思)如果是则跳过前7个字符获取token 
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    //如果没有token 返回401未授权
    if (!token) return res.status(401).json({message:  "Unauthorized"});

    try{
       //使用密钥验证token的有效性 会把解码后的信息存储在decoded变量中
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        //将解码后的用户信息存储在请求对象的auth属性中 以便后续中间件或路由处理程序使用
        req.auth = {id: decoded.sub, type: decoded.typ };
        return next();
        } catch (error) {
            return res.status(401).json({message: "Unauthorized"});

        }
}

export default requireAuth;

// jwt.verify(token, secretKey) 的工作原理：
// 分解 JWT：JWT 由三部分组成，用 . 分隔
// Header（头部）
// Payload（负载/数据）
// Signature（签名）
// 验证签名：
// 使用密钥（JWT_ACCESS_SECRET）重新计算签名
// 将计算出的签名与 token 中的签名对比
// 如果匹配 → token 未被篡改 ✓
// 如果不匹配 → token 无效，抛出错误 ✗
// 检查过期时间：验证 token 是否已过期
// 解码并返回：如果验证通过，返回解码后的 payload

// decoded 存储的内容
// decoded 变量存储的是 JWT 的 payload（负载），通常包含：
// {
//   sub: "用户ID",           // subject - 主题（通常是用户ID）
//   typ: "access/refresh",   // type - 令牌类型
//   iat: 1234567890,         // issued at - 签发时间
//   exp: 1234567890          // expiration - 过期时间
// }
// 1. req 对象最初没有 auth 属性
// req = { headers: {...}, body: {...}, ... }

// 2. 这行代码给 req 添加了 auth 属性
// req.auth = {id: decoded.sub, type: decoded.typ};

// 3. 现在 req 对象变成了：
// req = { 
//   headers: {...}, 
//   body: {...}, 
//   auth: { id: "用户ID", type: "access" }  // ← 新增的
// }