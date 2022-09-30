支持cluster的Snowflake算法。

# 安装

```
npm install --save @zsea/snowflake
```
# 环境限制

内部使用了```BigInt```来进行运算，所以你的```Nodejs```环境必须要能够支持```BigInt```。

# 使用

```javascript
const SNOWFLAKE=require("@zsea/snowflake");
const snowflake=new SNOWFLAKE({});
snowflake.nextId();
```

## 创建实例

使用```new```进行创建，也可使用```SNOWFLAKE.Short()```创建一个53位的ID生成器，以用于在没有BigInt的环境和前端JSON中使用。

> ```SNOWFLAKE.Short()```内部也是调用```new```来创建实例。

### 参数

|参数名|类型|默认值|描述|
|---|---|---|---|
|options|object| | 配置项|
|options.timestampBits|number|41|时间戳长度，不能超过41|
|options.twepoch|number|1640966400000|开始计数的时间|
|options.workerIdBits|number|5|工作ID位的长度|
|options.workerId|number|0|工作ID|
|options.dataCenterIdBits|number|5|机器位的长度|
|options.dataCenterId|number|0|机器ID|
|options.sequenceBits|number|12|序列位长度|
|options.type|enum|auto|生成ID的类型，可选值：auto/string/bigint/number|

说明：
* 所有参数均为可选参数。
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

# 实现原理

雪花算法使用二进制位来存储ID的相关数据，官方的算法将64位分为了四段：

1. 符号位，置0，共1位。就是说生成的ID是一个Long类型的数字。
2. 时间位，共41位，当前的时间值。这里的时间是当前的Unix时间戳减去设置的开始时间戳得出。
3. 机器位，共5位，当前服务器的ID，也叫数据中心位。
4. 工作位，共5位，当前算法在服务器上分配的ID号。
5. 序号位，共12位，在同一时间上，生成ID的序号。

在前端环境中，```Number```中整数的最大长度为53位，所以，我们需要设置相关值的位数，以减少长度，生成一个符合前端环境的ID。

雪花算法强依赖服务器时钟，如果服务器的时钟因为某些原因进行回拨，所产生的ID便有可能会重复，这里解决的思路是直接使用最后一次生成ID的时间。例如：当前时间位是10，如果检测到在生成ID时，时间位比10小，那么我们就用10做为时间位的值，再对序列号位加1。

序列号位的值也可能会溢出，这里的思路是向后借一个时间位，再把序列号位置0。例如：当前时间位是10，序列号位为4095，在生成ID时，时间位与最后时间相同，则需要在序列号位加1，加1后，值超过了序列号位的最大值，此时，我们把时间位的值加1，序列号位置0，表示使用了一个未来的时间来生成ID。

# K8S环境的支持

不提供对K8S环境的直接支持，你可以参考网上其它人的思路，使用```Redis```来存储```workerid```，然后将```workerid```直接做为参数传入进去。