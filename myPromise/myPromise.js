
function myPromise(executor){
    // 设置状态和属性
    this.promiseState = 'pending';
    this.promiseResult = null;
    // 如果直接调用，则是全局对象而不是该对象的this
    const self = this;
    // 保存异步回调函数
    this.callbacks = [];
    // 函数去改变promiseResult, 可以是哟个箭头函数就是myPromise的this了
    function resolve(data){
        if(self.promiseState === 'pending'){
            // console.log('this', this, 'self', self);
            self.promiseState = 'fulfilled';
            self.promiseResult = data;
            // 函数可能是异步的，执行then的回调函数
            if(self.callbacks.length != 0){
                setTimeout(() => {
                    self.callbacks.forEach(item => {
                        item.onResolved();
                    })
                })
            }
        }
    }
    // const resolve = (data) => {
    //     if(this.promiseState === 'pending'){
    //         console.log('this', this);
    //         this.promiseState = 'fulfilled';
    //         this.promiseResult = data;
    //     }
    // }
    function reject(data){
        if(self.promiseState === 'pending'){
            self.promiseState = 'failed';
            self.promiseResult = data;
            if(self.callbacks.length != 0){
                setTimeout(() => {
                    self.callbacks.forEach(item => {
                        item.onRejected(data);
                    })
                })
            }
        }
    }
    // 同步调用, 并捕获error的异常
    try{
        executor(resolve, reject);
    }catch(e){
        console.log('e', e);
        reject(e);
    }
    
}
// 不能使用箭头函数，否则是全局对象的，不是实例对象的那个
myPromise.prototype.then = function(onResolved, onRejected){
    const self = this;
    if(typeof onRejected !== 'function'){
        onRejected = reason => {
            throw reason;
        }
    }
    return new myPromise((resolve, reject) => {
        // console.log('this then', this);
        const callback = (f) => {
            try{
                let res = f(this.promiseResult);
                // console.log('temp res', res);
                // 这里也要用自己的继承
                if(res instanceof myPromise){
                    res.then(v => {
                        resolve(v);
                    }, r => {
                        reject(r);
                    })
                }else{
                    resolve(res);
                }
            }catch(e){
                // console.log('e:', e);
                reject(e);
            }
        }
        if(this.promiseState === 'fulfilled'){
            setTimeout(() => {
                callback(onResolved);
            })
        }else if(this.promiseState === 'failed'){
            setTimeout(() => {
                callback(onRejected);
            })
        }else{
            this.callbacks.push({
                onResolved: function(){
                    callback(onResolved);
                }, 
                onRejected:  function(){
                    callback(onRejected);
                },
            })
        }
    })
   
}

// 原型是实例的
myPromise.prototype.catch = function(onRejected){
    return this.then(undefined, onRejected);
}

// 类上面的是直接添加
myPromise.resolve = function(value){
    return new myPromise((resolve, reject) =>{
        try{
            if(value instanceof myPromise){
                value.then((onResolved) => {
                    resolve(onResolved);
                }, onRejected => {
                    reject(onRejected);
                })
            }else{
                resolve(value);
            }
        }catch(e){
            reject(e);
        }
    })
}
myPromise.reject = function(value){
    return new myPromise((resolve, reject) =>{
       reject(value);
    })
}
myPromise.all = function(promises){
    return new myPromise((resolve, reject) => {
        let promiseResult = [];
        let count = 0;
        for(let i = 0; i < promises.length; i++){
            promises[i].then((onResolvedData) => {
                count++;
                promiseResult[i] = onResolvedData;
                if(count == promiseResult.length){
                    resolve(promiseResult);
                }
            }, onRejectedData => {
                reject(onRejectedData);
            })
        }
       

    })
}
myPromise.race = function(promises){
    return new myPromise((resolve, reject) => {
        let flag = 0;
        for(let i = 0; i < promises.length; i++){
            console.log('i', i);
            promises[i].then(v => {
                resolve(v);
                flag = 1;
            }, r => {
                reject(r);
                flag = 1;
            })
            if(flag == 1){
                break;
            }
        }
    })
}


// 普通功能
// let test = new myPromise((resolve, reject) => {
//     // resolve('test');
//     setTimeout(() => {
//         // resolve('test异步');
//         reject('test异步');
//     }, 2000);
//     // reject('test');
//     // throw 'error';
// })
// test.a = 1;
// // console.log('test', test);
// const res = test.then(onResolvedData => {
//     console.log('success1', onResolvedData);
//     // return 1;
//     return new myPromise((r1, r2) => {
//         r1('r1');
//         // throw 'r';
//         // r2('r2');
//     });
// }, onRejectedData => {
//     console.log('fail1', onRejectedData);
//     return new myPromise((r1, r2) => {
//         r2('test my');
//     })
// })
// console.log('res', res);

// 异常穿透
// let t = new myPromise((r1, r2) => {
//     r2('test');
// })

// let r = t.then(r => {
//     console.log('r1');
// }).then(r => {
//     console.log('r2');
// }).then(r => {
//     console.log('r3');
// }).catch(r => {
//     console.log('r4');
// })
// console.log('r5', r);

// 类方法
// let t = myPromise.resolve(new myPromise((r1, r2) => r1('test')));
// console.log('t', t);
// let p1 = new myPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('ok');
//     }, 2000);
// })
// let p2 = myPromise.resolve('s1');
// let p3 = myPromise.reject('s2');

// let rrr = myPromise.all([p1, p2, p3]);
// console.log('res', rrr);

// let p1 = new myPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('ok');
//     }, 2000);
// })
// let p2 = myPromise.resolve('s1');
// let p3 = myPromise.reject('s2');

// let rrr = myPromise.race([p1, p2, p3]);
// console.log('res', rrr);

let p1 = new myPromise((resolve, reject) => {
    console.log('1');
    resolve(1);
})
p1.then(v => {
    console.log('2')
})
console.log('3');


// test.then(onResolvedData => {
//     console.log('success2', onResolvedData);
// }, onRejectedData => {
//     console.log('fail2', onRejectedData);
// })
