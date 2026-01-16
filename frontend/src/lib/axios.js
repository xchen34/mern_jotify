import axios from "axios";

const BASE_URL = import.meta.env.MODE === 'development' ? "http://localhost:5001/api" : "/api";

const api = axios.create({
   baseURL: BASE_URL,
   withCredentials: true, //请求头会自动带上cookie access token 否则不会带
})

//请求拦截器 每次发送请求前都会执行
// 每当你要发请求（比如 "获取笔记"），Axios 会先暂停一下，运行这个函数。
api.interceptors.request.use((config) => {
   const token = localStorage.getItem("accessToken");
   // 它检查你的口袋 (LocalStorage) 里有没有 "通行证" (Token)。
   // 如果有，它就把通行证贴在你的请求信封上 (Authorization Header)。
   if (token) config.headers.Authorization = `Bearer ${token}`;
   // 最后放行，请求真正发出。
   return config;
});

//响应拦截器   前端收到响应之后、但代码得到结果之前运行的。  
// 为什么？因为你的 Access Token 会过期（比如 15 分钟后）。 如果没有响应拦截器 (Response Interceptor)，通过以下流程，用户体验会很差：
// 用户在你网站上操作。
// Access Token 过期。
// 用户点击“保存笔记” -> 请求失败 (401 Unauthorized)。
// 结果：页面报错或白屏，用户被迫重新登录，刚才写的笔记丢了。
// 响应拦截器的作用 (无感刷新)： 它像一个聪明的管家，如果你被拒之门外，它会立刻帮你补办证件，让你重新进去，就像什么都没发生一样。
api.interceptors.response.use(
   (response) => { //接受2个参数 第一个参数是成功时的回调函数 第二个参数是失败时的回调函数
      return response
   },
   async (error) => { //参数二：请求失败，做处理
      const originalRequest = error.config;  //把失败的请求配置保存起来

      // 如果报错是 401 (未授权) 并且之前没重试过
      if (error.response?.status === 401 && !originalRequest._retry) { //如果报错是401 未授权 并且之前没重试过
         originalRequest._retry = true; // 标记已重试，防止死循环

         try {
            // 1. 尝试用 RefreshToken 换取新的 AccessToken
            // 因为我们开启了 withCredentials，浏览器会自动带上那个保质期 7 天的 cookie
            const response = await api.post("/refresh");

            // 2. 拿到新的 AccessToken
            const { accessToken } = response.data;

            // 3. 存到本地，供之后的请求使用
            localStorage.setItem("accessToken", accessToken);

            // 4. 更新刚才失败请求的 Header
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // 5. 重新发起刚才那个失败的请求
            return api(originalRequest); //api 是你用 axios.create() 创建的一个 Axios 实例。在 Axios 中，实例本身就是一个函数，直接调用它并传入配置对象（originalRequest），就会发起一个新的 HTTP 请求
         } catch (err) {
            // 如果换票也失败了（说明 7 天的有效期也到了，或者被封号了）
            // 这时才真正把用户踢出去
            localStorage.removeItem("accessToken");
            window.location.href = "/login"; // 这里可以根据需要决定是否跳转
            return Promise.reject(err); //Promise.reject() 会创建一个被拒绝的 Promise，这个 Promise 会传递错误信息
         }
      }
      return Promise.reject(error);
   }
);


// 1. config 是什么？
// 答：config 不是全局变量，它是 Axios 传给你的一个参数 是 Axios 调用这个回调函数时，自动传进来的一个对象。
// 内容：它包含了当前这个请求的所有配置信息。
// 比如：你要去哪？(url: '/notes')
// 用什么方式？(method: 'get')
// 带什么头？(headers: {})
// 比喻：想象你寄快递。快递员（Axios）在发货前，把快递单（config）递给你，说：“老板，还要加什么备注（Header）吗？” 你在单子上写上“加急”（Token），然后还给他 (return config)，他才发货。

//我用的双token架构 折中方案。 这里accesstoken存在localStorage中 是不安全的 因为在15分钟内可以被js脚本偷走（XSS攻击）  
//拦截器代码config.headers.Authorization = `Bearer ${token}`; 可以读取localStorage中的token并添加到请求头中 
// 而refresh token存在httpOnly cookie中 是安全的 因为js脚本无法访问cookie 只有浏览器发请求时会自动带上。
//更安全的做法是将accessToken也存在httpOnly cookie中 
//但是CSRF 需要额外防护，SameSite / domain / https 配置麻烦，跨域开发麻烦 

export default api;