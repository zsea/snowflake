const snowflake = require("./snowflake")
    , Locker = require("zlocker")
    , fs = require("fs")
    ;
function sleep(ms){
    return new Promise(function(resolve){
        setTimeout(resolve,ms);
    });
}
function getSnowflakeSync(options) {
    options = options || {};
    let lockerDir = options.lockerDir || "./.locker";
    if (lockerDir[lockerDir.length - 1] !== "/") lockerDir = lockerDir + "/";
    let locker = new Locker({ dir: lockerDir });
    while (true) {
        try {
            locker.lockSync();
        }
        catch (e) {
            continue;
        }
        break;
    }
    let store = lockerDir + ".last";
    let lastId = 0;
    try {
        lastId = fs.readFileSync(store, "utf-8");
        if (isNaN(lastId)) {
            lastId = 0;
        }
        else {
            lastId = parseInt(lastId);
            lastId++;
        }
    }
    catch (e) {
        lastId = 0;
    }

    if (lastId >= 1024) lastId = 0;
    fs.writeFileSync(store, lastId+"", "utf-8");
    //console.log(lastId);
    let sf = new snowflake(lastId, options.dataCenterId || 0);
    locker.unlockSync();
    return sf;
}
async function getSnowflake(options){
    options = options || {};
    let lockerDir = options.lockerDir || "./.locker";
    if (lockerDir[lockerDir.length - 1] !== "/") lockerDir = lockerDir + "/";
    let locker = new Locker({ dir: lockerDir });
    while (true) {
        try {
            await new Promise(function(resolve,reject){
                locker.lock(function(err){
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve();
                    }
                });
            });
        }
        catch (e) {
            //console.log(e)
            await sleep(10);
            continue;
        }
        break;
    }
    let store = lockerDir + ".last";
    let lastId = 0;
    try {
        lastId = await fs.promises.readFile(store,"utf-8");
        //lastId = fs.readFileSync(store, "utf-8");
        if (isNaN(lastId)) {
            lastId = 0;
        }
        else {
            lastId = parseInt(lastId);
            lastId++;
        }
    }
    catch (e) {
        lastId = 0;
    }

    if (lastId >= 1024) lastId = 0;
    await fs.promises.writeFile(store, lastId+"", "utf-8");
    //console.log(lastId);
    let sf = new snowflake(lastId, options.dataCenterId || 0);
    await new Promise(function(resolve,reject){
        locker.unlock(function(err){
            if(err){
                reject(err);
            }
            else{
                resolve();
            }
        });
    });
    return sf;
}
module.exports={
    getSnowflake,
    getSnowflakeSync
}
