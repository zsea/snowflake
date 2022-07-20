const fs = require("fs")

    ;

function Locker(options) {
    options = options || {};
    var hasLock = false;
    var lockerDir = options.dir || "./.locker/";
    if (lockerDir[lockerDir.length - 1] !== "/") dir = dir + "/";
    if (!fs.existsSync(lockerDir)) fs.mkdirSync(lockerDir);
    lockerDir = lockerDir + "locker";
    this.lock = function Lock(cb) {
        cb = cb || function () { };
        if (hasLock) return;
        fs.mkdir(lockerDir, function (err) {
            if (err) return cb(err);

            fs.writeFile(lockerDir + '/' + process.pid + ".pid", Date.now()+"", function (err) {
                if (err) cb(err);
                hasLock = true;
                return cb();
            });
        });
    }
    this.lockSync = function () {
        if (hasLock) return;
        fs.mkdirSync(lockerDir);
        fs.writeFileSync(lockerDir + '/' + process.pid + ".pid", Date.now()+"");
        hasLock = true;
    }
    this.unlock = function (cb) {
        cb = cb || function () { };
        if (!hasLock) return cb();
        fs.unlink(lockerDir + '/' + process.pid + ".pid", function (err) {
            if (err) return cb(err);

            fs.rmdir(lockerDir, function (err) {
                if (err) return cb(err);
                hasLock = false;
                cb();
            });
        });
    }
    this.unlockSync = function () {
        if (!hasLock) return;
        fs.unlinkSync(lockerDir + '/' + process.pid + ".pid");
        fs.rmdirSync(lockerDir);
        hasLock = false;
    }
}
module.exports = Locker;