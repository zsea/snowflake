支持Cluster的Snowflake算法

# 安装

```
npm install --save @zsea/snowflake
```

# 使用

```javascript
const SNOWFLAKE=require("@zsea/snowflake");
const snowflake=new SNOWFLAKE({});
snowflake.nextId();
```

## 创建实例

使用```new```进行创建，也可使用```SNOWFLAKE.Short()```创建一个53位的ID生成器，以用于在没有BigInt的环境和前端JSON中使用。

### 参数

|参数名|类型|默认值|描述|
|---|---|---|---|
|options|object| | 配置项|
|options.timestampBits|number|41|时间戳长度，不能超过41|
|options.twepoch|number|1640966400000|开始计数的时间|
|options.workerIdBits|number|5|工作ID位的长度|
|options.workerId|number|0|工作ID|
|options.dataCenterIdBits|number|5|机器位的长度|
|options.dataCenterId|number|5|机器ID|
|options.sequenceBits|number|12|序列位长度|
|options.type|enum|auto|生成ID的类型，可选值：auto/string/bigint/number|

说明：
* dataCenterId - 该参数首先通过用户传入，若不传入，可以通过环境变量```SNOWFLAKE_DATACENTER_ID```读取，若环境变量也未配置，再取默认值。
* workerId - 该参数首先通过用户传入，若不传入，则判断是否是```worker```模式下，若是```worker```模式，则读取```worker.id```，若不是，则取默认值。

## 生成ID

```nextId()```的返回值类型与构造函数中的参数```type```相关。

```javascript
snowflake.nextId();
```

## 查看ID的相关数据

主要用于辅助，方便查看生成ID的相关数据。

```javascript
snowflake.parse(98587758863454208n);
```
