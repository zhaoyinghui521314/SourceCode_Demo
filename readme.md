# 1.jonsServer
json-server --watch db.json<br>
json-server --watch db.json -d 5000<br>   

# 2.myAxios
## 使用说明
单独作为函数使用:<br>   
    bind了Axios.request方法，axios为方法，this指向且需要绑定context上下文信息<br>
    普通函数this谁调用就是谁的，箭头函数声明时候已经确定<br>
```
    axios({method: 'get', url: 'http://localhost:3000/posts'})
```

作为方法调用函数使用:<br>      
    将Axios上的方法给axios方法一份，例如Axios.prototype.get/post/<br> 
```
    axios.get({url: 'http://localhost:3000/posts'})
```

拦截器函数使用:<br> 
    请求在前unshift队列，响应在后push队列，队列原始[dispatch, undefined占位]<br>
```
    axios.interceptors.request.use(f1, f2)
    axios.interceptors.response.use(f1, f2)
```

关闭请求函数使用:<br>
    甲方：暴露promise状态和修改promise的方法和promise修改后的动作， 乙方：使用修改promise的方法<br>
```
    let cancelCallback = null;
    axios({method: 'get', url: 'http://localhost:3000/posts', cancelToken: new function(function(c){
        cancelCallback = c;
    })})

    cancelCallback();
```


# 3.myPromise
## 使用说明
promise函数使用:<br>
    函数中包含promiseStatus和promiseResult，同步调用resolve和reject内置提供修改状态和值，异步修改时调用then的回调函数<br>
```
    let p = new Promise((resolve, reject) => {
        // 同步
            resolve();
            reject();
            throw new Error();
        // 异步
        setTimeout(() => {
            resolve();
        })
    })
```

then函数使用:<br>
    执行时机： 同步 or 异步，判断状态不为pending直接操作，为pending向将回调函数存入数组，等内置函数执行修改后再调用<br>
    微任务延时执行：加个setTimeout调用then函数的回调<br>
    返回结果: Promise对象 => return Promise一致[把then的回调先执行一遍，.then拿到返回值]，return 非Promise状态为成功的，throw error状态为失败的<br>
```
    p.then(resolveData => {
        
        return promise((r1, r2) => {});
        return 非promise
        throw new Error
    }, rejectData => {
        f
    })
```

all、race函数使用：<br>
    原型上面的是实例有的prototype例如Promise.protype.then，方法直接调用挂在Promise.all<br>
    all等所有成功返回值，结果顺序result[i]不能变，有一个失败则失败<br>
    race谁先执行完.then执行就用谁的<br>
```
    let p1 = new Promise((r1, r2) => {
        resolve();
    })
    let p2 = new Promise((r1, r2) => {
        reject();
    })
    let all = Promise.all([p1, p2]);
```

catch异常穿透:<br>
    第二个参数不写时，给一个默认的reject函数抛出异常<br>
```
    p: reject
    p.then(d1 => {
        //
    }).then(d2 => {
        //
    }).catch(e){
        // 穿透捕获
    }
```

