基于本地文件锁实现的多进程snowflake算法

# 安装

```
npm install --save zsnowflake
```

# 使用

```javascript
const zsnowflake=require("zsnowflake");
const snowflake=zsnowflake.getSnowflakeSync(options);
//或
const snowflake=await zsnowflake.getSnowflake(options);
```

## 参数

options参数：

* lockerDir - 文件锁存储位置
* dataCenterId - 数据中心ID，默认值：0