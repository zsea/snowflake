使用```mkdir```实现的进程锁，可在当前电脑上获取到一个锁。

# 使用方法

## 实例化对象

```javascript
var locker=new Locker(options);
```

options参数说明：

* dir:锁存放的目录

## 获取锁

```javascript
locker.lock(callback);
locker.lockSync();
```

callback：function(err);

## 释放锁

```javascript
locker.unlock(callback);
locker.unlockSync();
```

callback：function(err);