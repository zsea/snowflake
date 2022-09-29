const SNOWFLAKE=require("../");

/**
 * 默认配置
 */
var sn=new SNOWFLAKE();
console.log(sn.nextId());

/**
 * 53位ID生成器
 */
sn=SNOWFLAKE.Short();
console.log(sn.nextId());
/**
 * 自定义一个生成器
 */
sn=new SNOWFLAKE({timestampBits:32,workerIdBits:0,dataCenterIdBits:5,sequenceBits:16});
console.log(sn.nextId());
/**
 * 配置机器ID和工作ID
 */
sn=new SNOWFLAKE({workerId:1,dataCenterId:1});
console.log(sn.nextId());
/**
 * 配置输出方式
 */
 sn=new SNOWFLAKE({type:"string"});
 console.log(sn.nextId());
