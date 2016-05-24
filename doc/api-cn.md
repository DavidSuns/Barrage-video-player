#API

## 公有方法
| 函数名    | 参数    | 返回值 |
| ------ | ------ | ------------------------------------------------------ |
| create | element, params | instance |

###参数说明
| 参数名   | 类型    | 说明 |
| ------ | ------ | ------------------------------------------------------ |
| element | object|string   | 可以传入包含弹幕播放器容器的jquery对象或是其id的string值 |
| params | object  | 弹幕播放器配置参数，详细说明见下 |

```javascript
  {
    "replaceMode":true,
    "width":512,  
    "height":384,
    "src":"",  //video source.
    "posterImg":"",   //for video tag poster attribute
    "isMobile": false,  //if set it to true, video player will change to mobile device.
    "videoQualityInfo":{    // setting for video quality
      currentVideoQuality: "high",  // current video quality.
      videoQualityDes: {   // video quality text
        high: "高清"    //text value
      }
    }
  }
```
