import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";
//职责分离：存储 vs. 逻辑
//     @upstash/redis (存储层)： 这是 Redis 数据库的驱动程序。它只负责数据的读写。它知道如何 SET 一个键或 GET 一个值，但它并不知道什么是“滑动窗口算法”，也不知道该如何计算用户是否在 20 秒内请求了超过 10 次。
//     @upstash/ratelimit (逻辑层)： 这是一个算法库。它内置了复杂的限流逻辑（如滑动窗口、漏桶、令牌桶算法）。
// 为什么不能只用 Redis？
// 如果你只导入 Redis，你确实可以自己实现限流，但你需要亲手写复杂的逻辑

import dotenv from "dotenv";

dotenv.config(); //加载.env文件中的环境变量

//Ratelimit 类：用于创建限流器实例 包括限流规则和 Redis 连接信息
//create a ratelimiter that allows 10 req per 20s 
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),  //从.env文件中获取redis配置 连接redis  redis是Ratelimit类构造函数的配置对象的一个属性
    limiter: Ratelimit.slidingWindow(20, "10 s"),  //limiter也是一个属性  滑动窗口限流器，每20秒最多10个请求
});


// 为什么不用 process.env.REDIS？
// 因为 Redis.fromEnv() 已经帮你自动读取了环境变量！
// // @upstash/redis 内部实现（简化版）
// class Redis {
//     static fromEnv() {
//         return new Redis({
//             url: process.env.UPSTASH_REDIS_REST_URL,      // ← 自动读取
//             token: process.env.UPSTASH_REDIS_REST_TOKEN   // ← 自动读取
//         });
//     }
// }

 export default ratelimit;



//其实在 Fullstack 开发中，MongoDB 和 Redis 经常是“搭档”关系，但它们扮演的角色完全不同。
//MongoDB 是 NoSQL 数据库，负责存储数据 储存在服务器的硬盘上 永久保存。Redis 是内存数据库，负责缓存数据。速度极快 存在服务器的内存上 临时保存。
//mongodb用文档性数据结构(json) redis用键值对(key value)数据结构
// 在一个标准的 Fullstack 应用中，它们的职责分工如下：
// MongoDB：数据的“家”
//     存放内容：用户信息、笔记内容、文章、评论等。
//     场景：当你调用 getAllNotes 或 createNote 时，你操作的是 MongoDB。因为你希望这些笔记在服务器关掉后依然存在。
// Redis：数据的“哨兵”或“缓存”
//     存放内容：限流计数器、Session（登录状态）、临时验证码。
//     场景（也就是你刚才看到的代码）：
//         限流 (Rate Limiting)：每秒钟有成千上万个请求进来，如果你每次都去问 MongoDB：“这个 IP 刚才请求了几次？”，MongoDB 的压力会非常大，而且查询太慢。
//         Redis 的优势：它在内存里。它能瞬间完成“读取次数 -> 加 1 -> 判断是否超过 10”的操作。由于限流数据是临时的（20 秒后就没用了），存放在 Redis 这种“快起快落”的地方最合适。

//. 什么是“滑动窗口” (Sliding Window)？
// 要理解滑动窗口，先看它的对手：固定窗口 (Fixed Window)。
// 固定窗口（像公交车）：假设规定每分钟只能进 10 人。12:00:59 秒瞬间冲进来 10 人，12:01:01 秒又冲进来 10 人。
// 在系统看来，这两分钟都没超标；但实际上，在短短 2 秒内挤进了 20 人，你的服务器可能瞬间就挂了。这叫“临界点突发流量”。
// 滑动窗口（像手电筒光圈）：它不看整分整点。它关注的是从你请求的这一刻起，往回推 20 秒这个范围内，到底有多少请求。