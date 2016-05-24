#API

## Public method
| method name    | params    | return value |
| ------ | ------ | ------------------------------------------------------ |
| create | element, params | instance |

###参数说明
| parameter name   | type    | description |
| ------ | ------ | ------------------------------------------------------ |
| element | object|string   | you could set jquery element object of container for video player, or its id in string type |
| params | object  | params for setting, details below |

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
