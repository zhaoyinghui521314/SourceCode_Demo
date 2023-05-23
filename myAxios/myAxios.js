var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// 拦截器对象
function intercepterManager(){
    this.handler = [];
}
intercepterManager.prototype.use = function(resolve, reject){
    this.handler.push({
        resolve, reject
    });
}

// Axios对象
function Axios(config){
    this.default = config;
    this.interceptors = {
        request: new intercepterManager(),
        response: new intercepterManager(),
    }
}

// dispatch
function dispatchRequest(config){
    // 中间层对原生结果做处理
    return xhrAdpter(config).then((response) => {
        console.log("r", response);
        return response;
    }, (err) => {
        console.log("f");
        throw err;
    });
}

// adpter
function xhrAdpter(config){
    //发送请求, 返回包含原生结果的promise
    console.log('发送请求', config);
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open(config.method, config.url);
        xhr.send();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status >= 200 && xhr.status <= 300){
                    resolve({
                        config: config,
                        data: JSON.parse(xhr.responseText),
                        header: xhr.getAllResponseHeaders(),
                        request: xhr,
                        status: xhr.status,
                        statusText: xhr.statusText
                    })
                }
            }
        }
    }, (reject) => {
        reject(new Error('失败') + xhr.status);
    })
}

// 原型方法
Axios.prototype.request = function(config){
    console.log('request', config);
    let promise = Promise.resolve(config);
    // 第二个占位，配合拦截器promise回调不被破坏顺序
    let chain = [dispatchRequest, undefined]; 
    // 拦截器放置
    this.interceptors.request.handler.forEach(key => {
        chain.unshift(key.resolve, key.reject);
    })
    this.interceptors.response.handler.forEach(key => {
        chain.push(key.resolve, key.reject);
    })
    console.log('chain', chain);
    // 循环两两一组执行
    while(chain.length != 0){
        result = promise.then(chain.shift(), chain.shift());
    }
    return result;
}
Axios.prototype.get = function(config){
    return this.request({method: 'get'});
}
Axios.prototype.post = function(config){
    return this.request({method: 'post'});
}


// 声明函数
function createInstance(config){
    //声明对象
    let context = new Axios(config);
    //声明函数: 绑定context对象，能通过this访问到context上面的内容，否则如果是windows调用则获取不到一些方法
    let instance = Axios.prototype.request.bind(context);
    //对象原型方法加到函数上
    Object.keys(Axios.prototype).forEach((key) => {
        //不加bind也是函数，加了bind让this指向可以访问
        instance[key] = Axios.prototype[key].bind(context);
    })
    //对象属性加到函数上
    Object.keys(context).forEach(key => {
        instance[key] = context[key];
    })
    return instance;
}

//既是函数直接调用，函数上面也有方法调用
let axios = createInstance({url: 'test'});
axios.interceptors.request.use(function(config){
    console.log('请求拦截1', config);
    // throw '参数出错';
    return config;
}, function(err){
    console.log('失败');
    return Promise.reject(error);
})
axios.interceptors.request.use(function(config){
    console.log('请求拦截2', config);
    return config;
}, function(err){
    console.log('失败');
    return Promise.reject(error);
})
axios.interceptors.response.use(function(response){
    console.log('请求响应1', response);
    return response;
}, function(err){
    console.log('失败');
    return err;
})
axios.interceptors.response.use(function(response){
    console.log('请求响应2', response);
    return response;
}, function(err){
    console.log('失败');
    return err;
})
console.log('axios:', axios);
axios({method: 'get', url: 'http://localhost:3000/posts'});
// axios.get({});