const cluster = require('cluster');

function getValue(v, def) {
    if (v === undefined || v === null) return def;
    return v;
}
function getWorkerid(workerId, max) {
    if (workerId !== null && workerId !== undefined) return workerId;
    if (cluster.isWorker) {
        workerId = cluster.worker.id % Number(max);
    }
    return workerId;
}
/**
 * 雪花ID生成器
 * @constructor
 * @param {Object} options - 配置选项
 * @param {Number} [options.timestampBits=41] - 时间位的长度，不能大于41
 * @param {Number} [options.twepoch=1640966400000] - 时间戳的开始时间
 * @param {Number} [options.workerIdBits=5] - 
 * @param {Number} [options.workerId=0] - 
 * @param {Number} [options.dataCenterIdBits=5] - 
 * @param {Number} [options.dataCenterId=0] - 
 * @param {Number} [options.sequenceBits=12] - 序列号位长度
 * @param {String} [options.type="auto"] - ID类型，可选值：auto/bigint/number/string
 * 
 */
function Snowflake(options) {

    options = options || {};
    options.timestampBits = BigInt(getValue(options.timestampBits, 41));
    options.twepoch = BigInt(getValue(options.twepoch, 1640966400000));
    options.workerIdBits = BigInt(getValue(options.workerIdBits, 5));

    options.dataCenterIdBits = BigInt(getValue(options.dataCenterIdBits, 5));

    options.sequenceBits = BigInt(getValue(options.sequenceBits, 12));
    options.type = options.type || "auto"; //类型：bigint/number/auto/string
    this.sequence = 0n;
    let length = options.timestampBits + options.workerIdBits + options.dataCenterIdBits + options.sequenceBits + 1n;
    this.totalBits = length;
    this.lastTimestamp = 0n;
    let maxValues = {
        timestamp: -1n ^ (-1n << options.timestampBits),
        workerId: -1n ^ (-1n << options.workerIdBits),
        dataCenterId: -1n ^ (-1n << options.dataCenterIdBits),
        sequence: -1n ^ (-1n << options.sequenceBits),
    }
    options.workerId = BigInt(getWorkerid(options.workerId, maxValues.workerId) || 0);
    options.dataCenterId = BigInt(options.dataCenterId || process.env["SNOWFLAKE_DATACENTER_ID"] || 0);
    this.maxValues = maxValues;
    this.options = options;
}
/**
 * 生成一个ID
 * @returns {Number|bigint} 生成的ID
 */
Snowflake.prototype.nextId = function () {
    let options = this.options;
    let seq = 0n;
    let timestamp = BigInt(Date.now()) - options.twepoch;
    if (options.timestampBits < 41n) {
        // 如果时间长度大于最大时间长度，则移除多余位数
        let bits = 41n - options.timestampBits;
        timestamp = timestamp >> bits;
    }
    if (timestamp < this.lastTimestamp) {
        // 如果遇到时钟回拨，则使用最后一次的时间
        timestamp = this.lastTimestamp;
    }
    if (timestamp === this.lastTimestamp) {
        // 如果与最后缓存时间相同，则在上一次的序列号上加1
        seq = this.sequence + 1n;
    }
    if (seq > this.maxValues.sequence) {
        // 如果序列号超过了最大值，则向后借1个时间（根据时间长度来判断，不是1秒，也不是1毫秒），序列号值设0
        timestamp = timestamp + 1n;
        seq = 0n;
    }
    let id = 0n;

    if (options.timestampBits > 0) {
        id = id | timestamp;
    }
    if (options.dataCenterIdBits > 0) {
        id = (id << options.dataCenterIdBits) | options.dataCenterId;
    }
    if (options.workerIdBits) {
        id = (id << options.workerIdBits) | options.workerId;
    }
    if (options.sequenceBits) {
        id = (id << options.sequenceBits) | seq;
    }
    this.lastTimestamp = timestamp;
    this.sequence = seq;
    if (options.type === "number") {
        id = Number(id)
    }
    else if (options.type === "auto") {
        //console.log("=======",this.totalBits)
        if (this.totalBits <= 54n) {
            id = Number(id);
        }
    }
    if (options.type === "string") {
        id = id.toString();
    }
    return id;
}
/**
 * 解析ID，用于查看生成的时间、dataCenterId、workerId、序列号等
 * @param {String|Number|bigint} id - ID
 * @returns [Object]
 */
Snowflake.prototype.parse = function (id) {
    id = BigInt(id);
    //console.log(this)
    let timestamp = 0n
        , seq = 0n
        , workerId = 0n
        , dataCenterId = 0n
        ;
    //timestamp = Date(Number(timestamp))
    if (this.options.dataCenterIdBits > 0n) {
        dataCenterId = id << (this.options.timestampBits + 1n) >> (64n - this.options.dataCenterIdBits - 1n);
    }

    if (this.options.sequenceBits > 0) {
        seq = id & this.maxValues.sequence;
    }
    if (this.options.workerIdBits > 0) {
        workerId = (id >> this.options.sequenceBits) & this.maxValues.workerId;
    }
    if (this.options.dataCenterIdBits > 0) {
        dataCenterId = (id >> (this.options.sequenceBits + this.options.workerIdBits)) & this.maxValues.dataCenterId;
    }
    if (this.options.timestampBits > 0) {
        timestamp = (id >> (this.options.sequenceBits + this.options.workerIdBits + this.options.dataCenterIdBits)) & this.maxValues.timestamp;
        if (this.options.timestampBits < 41n) {
            timestamp = timestamp << (41n - this.options.timestampBits);
        }
        timestamp = timestamp + this.options.twepoch;
    }
    return {
        timestamp: new Date(Number(timestamp)),
        dataCenterId: Number(dataCenterId),
        sequence: Number(seq),
        workerId: Number(workerId)
    };

}
/**
 * 使用默认配置创建一个54位的Id生成器
 * @returns [Snowflake]
 */
Snowflake.Short=function(){
    return new Snowflake({
        dataCenterIdBits:3,
        workerIdBits:3,
        sequenceBits:6,
        type:"number"
    })
}
module.exports=Snowflake;