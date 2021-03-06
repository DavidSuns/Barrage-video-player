# Barrage-video-player
A powerful html5 barrage video player, with rich features, beautiful UI, and easy using.

## Online Demo
[`https://davidsuns.github.io/Barrage-video-player/`](https://davidsuns.github.io/Barrage-video-player/)

##Features Introduction
### Video Features
* Video play, stop.
* Switch to next video.
* Video time show, progress bar drag and drop.
* Setting for video volume, mute.
* Video fullscreen and cancel fullscreen.
* Video quality show and switch.

> Player shows the current video quality, if this video has multi-quality, player support switching them. The default video quality is 'high'.

* Keyboard support.

> * Play － space (video pause status).
> * Pause － space (video play status).
> * Fast forward － left.
> * Rewind － right.
> * Volume up － up (video fullscreen status).
> * Volume down － down (video fullscreen status).
> * Cancel fullscreen － esc (video fullscreen status).

* Video play in mobile device.

>Video player also support playing in mobile device, including IOS and Android.

* Multi-video sources support.

> For long time videos, for example movies, sometimes it provides Multi-video sources, every source only provides a part of whole video, in this situation player also works well.

### Barrage Features
* Barrage play and cancel.
* Setting for barrage play speed.
* Setting for barrage opacity.
* Setting for max barrage number in screen.
* Setting for barrage border-width.
* Sending barrage.
* Setting for sending barrage color.
* Setting for sending barrage font size.
* Setting for sending barrage play mode.

## API
[API document](doc/api.md)

## Develop Environment

1. Dependencies install
```shell
npm install
```

2. Use gulp to watch files change
```shell
gulp
```

3. Running
```shell
node server.js
```

4. See it in `http://localhost:8080/demo/videoDemo.html`.


# Barrage-video-player 中文文档
一款强大的视频弹幕播放器，拥有丰富的功能，优美的UI，使用简单方便。

## 在线Demo
[`https://davidsuns.github.io/Barrage-video-player/`](https://davidsuns.github.io/Barrage-video-player/)

##功能介绍
### 视频功能介绍
* 视频播放，暂停。
* 视频的下一集切换。
* 视频时间显示，进度条拖拽。
* 视频音量调节，静音。
* 视频全屏，取消全屏功能。
* 视频清晰度显示及切换。

> 播放器提供视频当前清晰度的显示，如果该视频拥有多种清晰度，那么可以在不同清晰度之间切换；如果视频只提供一种清晰度选择，则只提供当前清晰度显示，图标变灰，切换功能失效。系统默认的清晰度显示为高清。

* 视频控制的快捷键支持。

> 播放器的快捷键功能，支持的操作有：
> * 播放 － 暂停状态下space
> * 暂停 － 播放状态下space
> * 快进 － left
> * 快退 － right
> * 音量加 － up，仅在全屏状态下可用
> * 快进 － down，仅在全屏状态下可用
> * 退出全屏 － esc，仅在全屏状态下可用

* 视频的移动端播放。

>播放器也支持在移动端的播放，包括IOS和Android客户端。

* 多段视频源支持。

>播放器也对分段视频进行支持，对于播放时间较久的视频，例如电影等，有时会有多段视频出现，每一段视频只是整个视频的一部分，对于这种情况，本播放器也能很好的支持。

### 弹幕功能介绍
* 弹幕的播放取消。
* 弹幕发送速度调节。
* 弹幕透明度调节。
* 同屏最大弹幕数调节。
* 弹幕描边宽度调节。
* 发送弹幕。
* 发送弹幕颜色调节。
* 发送弹幕字体大小调节。
* 发送弹幕运动模式调节。

## API
[API 文档](doc/api-cn.md)

## 开发环境

1. 安装依赖
```shell
npm install
```

2. 使用gulp监听文件改动
```shell
gulp
```

3. 运行
```shell
node server.js
```

4. 浏览 `http://localhost:8080/demo/videoDemo.html`

##License
MIT
