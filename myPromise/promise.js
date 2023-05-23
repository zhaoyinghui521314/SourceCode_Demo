const { error } = require('console');
const fs = require('fs');

const promiseReadFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err) reject(err);
            else resolve(1);
        })
        // resolve(1);
        // reject(2);
    })
}

promiseReadFile('test.txt')
.then() // 1.回调省略原封不动往后传
.then((value) => {
    console.log("data2:", value);
}, (err) => {
    console.log("err2:", err);
})
// .catch(e => console.log("e:", e));


let test = new Promise((resolve, reject) => {
    // resolve('test');
    setTimeout(() => {
        resolve('test');
    }, 2000)
})
test.then(onResolved => {
    console.log('success', onResolved);
}).catch(onReject => {
    console.log('fail');
})

// then省略第二个回调但又失败，如何执行后面的catch? 1.回调省略原封不动往后传  2.因为catch会捕获前面所有的错误

// const someAsyncThing = function() {
//     return new Promise(function(resolve, reject) {
//     resolve(x + 2);
//     });
// };
// someAsyncThing()
// .catch(function(error) {
//     console.log('oh no', error);
// })
// .then(function() {
//     console.log('carry on');
// });
   
// then会返回一个新的Promise实例，而catch就是.then(undefined, reject)catch 方法是 then 方法的语法糖，只接受 rejected 态的数据。
// catch:
// var p1 = new Promise(function(resolve, reject) {
//     resolve('Success');
//   });
  
// p1.then(function(value) {
//     console.log(value); // "Success!"
//     throw 'oh, no!';
//     }).catch(function(e) {
//     console.log(e); // "oh, no!"
//     }).then(function(){
//     console.log('after a catch the chain is restored');
//     }, function () {
//     console.log('Not fired due to the catch');
// });

// // 以下行为与上述相同
// p1.then(function(value) {
//     console.log(value); // "Success!"
//     return Promise.reject('oh, no!');
//     }).catch(function(e) {
//     console.log(e); // "oh, no!"
//     }).then(function(){
//     console.log('after a catch the chain is restored');
//     }, function () {
//     console.log('Not fired due to the catch');
// });
  
// // 在异步函数中抛出的错误不会被catch捕获到
// var p2 = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         throw 'Uncaught Exception!';
//     }, 1000);
//     });

// p2.catch(function(e) {
// console.log(e); // 不会执行
// });

// // 在resolve()后面抛出的错误会被忽略
// var p3 = new Promise(function(resolve, reject) {
//     resolve();
//     throw 'Silenced Exception!';
// });

// p3.catch(function(e) {
//     console.log(e); // 不会执行
// });

// // 如果已经决策
// var p1 = Promise.resolve("calling next");

// var p2 = p1.catch(function (reason) {
//     //这个方法永远不会调用
//     console.log("catch p1!");
//     console.log(reason);
// });

// p2.then(function (value) {
//     console.log("next promise's onFulfilled"); /* next promise's onFulfilled */
//     console.log(value); /* calling next */
// }, function (reason) {
//     console.log("next promise's onRejected");
//     console.log(reason);
// });
