var ABP = {
	"version":"1.0.0"
};

(function(){
	"use strict";
	if(!ABP) return;

	/* Utility functions */
	function _ (type, props, children, callback) {
		var elem = null;
		if (type === "text") {
			return $(document.createTextNode(props));
		} else {
			elem = $(document.createElement(type));
		}
		for(var n in props){
			if(n !== "style" && n !== "className"){
				elem.attr(n, props[n]);
			}else if(n === "className"){
				elem.addClass( props[n] );
			}else{
				var attrs = "";
				for(var x in props.style){
					elem.css(x, props.style[x]);
				}
			}
		}
		if (children) {
			for(var i = 0; i < children.length; i++){
				if(children[i] !== null)
					elem.append(children[i]);
			}
		}
		if (callback && typeof callback === "function") {
			callback(elem);
		}
		return elem;
	}

	ABP.create = function (element, params) {
		var playlist, instance;

		if (typeof element === "string") {
			element = $("#" + element);
		}

		this.parentElement = element;

		this.params = $.extend({},{
			"replaceMode":true,
			"width":512,
			"height":384,
			"src":"",
			"posterImg":"",
			"isMobile": false,
			"videoQualityInfo":{
				currentVideoQuality: "high",
				videoQualityDes: {
					high: "高清"
				}
			}
		},params);

		this.container = this._initContainer(element);
		playlist = this._initVideo();
		this._initHTML(this.container, playlist);
		this._initTextInfo();

		if(this.params.src !== "") {
			instance = this._bind();
		}

		if(this.params.isMobile) {
			this.changeToMobileLayout();
			this.changeToMobileBehavior(instance);
		}
		return instance;
	};

	ABP.setVideoSrc = function (sourceUrls) {
		var playList = [];

		this.params.src = sourceUrls;
		playList = this._initVideo();

		$(".abp-video").empty().append(playList);
	};

	ABP.setVideoQuality = function(curQuality, format_list) {
		$(".abp-settings").text(format_list[curQuality]);
		this.params.videoQualityInfo.currentVideoQuality = curQuality;
		this.params.videoQualityInfo.videoQualityDes = format_list;
		this._initVideoFormat();
	};

	ABP.reload = function() {
		var instance = this._bind();
		return instance;
	};

	/* Show error image when video can't play*/
	ABP.hasError = function() {
		$(".js-spinner").addClass("hide");
		$(".js-abp-play-btn").removeClass("icon-pause").addClass("icon-play");
		$(".abp-unit").append($("<div></div>").addClass("error-img"));
	};

	ABP.setNextUrl = function(nextUrl) {
		ABP.nextUrl = nextUrl;
	};

	ABP._initContainer = function(element) {
		var container, width, height;

		// 'element' is the parent container in which we create the player.
		if(!element.hasClass("abp-unit")){
			// Assuming we are injecting
			if(typeof this.params.width === "string" && this.params.width.match("%")) {
				width = this.params.width;
			} else {
				width = this.params.width + "px";
			}
			if(typeof this.params.height === "string" && this.params.height.match("%")) {
				height = this.params.height;
			} else {
				height = this.params.height + "px";
			}
			container = _("div", {
				"className": "abp-unit",
				"style":{
					"width": width,
					"height": height
				}
			});
			element.append(container);
		}else{
			container = element;
		}
		// Create the innards if empty
		if(container.children.length > 0 && this.params.replaceMode){
			container.html("");
		}
		return container;
	};

	ABP._initVideo = function() {
		var playlist = [];
		var srcs;

		if(typeof this.params.src === "string"){
			srcs = this.params.src.split('|');
		}else if(this.params.src.length){
			srcs = this.params.src;
		}
		for(var i=0; i<srcs.length; i++){
			if(i ===0) {
				playlist.push(_("video",{"preload":"metadata","src":srcs[i], "autoplay": "autoplay"}));
			} else {
				playlist.push(_("video",{"preload":"metadata","src":srcs[i]}));
			}
		}
		playlist.push(_("div", {
			"className":"abp-container"
		}));

		/*Set poster image to the video*/
		if(this.params.isMobile) {
			$(playlist[0]).attr("poster",this.params.posterImg);
		}
		return playlist;
	};

	ABP._initHTML = function(container, playlist) {
		/*Init player container*/
		container.append(_("div",{
				"className" : "abp-video",
				"tabindex" : "10"
			}, playlist));

		/* Init swap to next video info */
		container.append(_("div", {
				"className": "video-next-info"
			},[
				_("span", {
					"className": "second-count-text"
				},['3']),
				_("span", {
					"className": "video-next-text"
				},['秒后自动播放下一个视频…'])
		 ]));


		/*Init video control bars*/
		container.append(_("div", {
					"className":"abp-control  js-main-controls  js-abp-video-controls"
			},[
				_("i", {
						"className": "abp-control-button abp-play  iconfont  icon-pause  js-abp-play-btn"
				}),
				_("i", {
						"className": "abp-control-button abp-next  iconfont  icon-next  js-abp-next-btn"
				}),
				_("div", {
						"className": "abp-control-button abp-time"
				},[
					_("p", {
						"className": "text-style",
						"id" : "timeText"
					},[_("span",{"id":"currentTimeText"}), _("span",{"id":"totalTimeText"})])
				]),
				_("i", {
					"className": "abp-control-button abp-volume  iconfont  icon-volume  js-abp-volume"
				}),
				_("div", {
					"className": "ab-volume-bar  js-ab-volume-bar"
				},[
					_("div", {
						"className": "bar dark  js-volume-bar"
					}),
					_("div", {
						"className": "volume-bar-cursor js-volume-bar-cursor"
					}),
				]),
				_("i", {
					"className": "abp-control-button kaminari-show  iconfont  icon-kaminari-show  js-kaminari-show"
				}),
				_("span", {
					"className": "abp-control-button abp-settings js-abp-settings-btn"
				}),
				_("i", {
					"className": "abp-control-button abp-fullscreen  iconfont  icon-fullscreen  js-abp-fullscreen-btn"
				})
		]));

		/* Init progress bar */
		container.append(_("div", {
				"className": "ab-progress-bar  js-ab-progress-bar js-main-controls"
			},[
				_("div", {
					"className": "bar  js-bar-load"
				}),
				_("div", {
					"className": "bar dark  js-bar-time"
				}),
				_("div", {
					"className": "bar-cursor js-bar-cursor"
				})
		]));

		/* Init kaminari settings and send bar*/
		container.append(_("div", {
					"className":"abp-text  js-main-controls  js-abp-text-controls",
			},[
				_("i", {
					"className": "abp-text-button kaminari-setting iconfont  icon-kaminari-general-settings js-kaminari-setting-btn"
				}),
				_("i", {
					"className": "abp-text-button kaminari-color iconfont  icon-color  js-kaminari-color"
				}),
				_("div", {
					"className" : "kaminari-input-container"
				}, [
					_("input", {
						"type":"text",
						"placeholder":"来一发弹幕压压惊",
						"className" : "kaminari-input  js-kaminari-input"
					})
				]),
				_("div", {
					"className": "abp-text-button kaminari-send  js-kaminari-send"
				},[_("p", {
					"className": "kaminari-send-text  js-kaminari-send-text"
				})])
		]));

		/*Init kaminari color settings panel*/
		container.append(_("div", {
			"className" : "kaminari-color-panel  js-kaminari-color-panel"
		}, [
			_("h5", {
				"className" : "color-panel-title"
			}),
			_("div", {
				"className" : "color-block red-block",
				"value" : "red" //0xe60111
			}),
			_("div", {
				"className" : "color-block yellow-block",
				"value" : "yellow" //0xfef201
			}),
			_("div", {
				"className" : "color-block green-block",
				"value" : "green" //0x90c41f
			}),
			_("div", {
				"className" : "color-block rose-block",
				"value" : "rose" //0xe2037f
			}),
			_("div", {
				"className" : "color-block blue-block",
				"value" : "blue" //0x002e72
			}),
			_("div", {
				"className" : "color-block orange-block",
				"value" : "orange"//0xf0ac2a
			}),
			_("div", {
				"className" : "color-block purple-block",
				"value" : "purple" //0x683b7b
			}),
			_("div", {
				"className" : "color-block white-block",
				"value" : "white" //0xf1f1f1
			})
		]));

		/*Init kaminari settings panel*/
		container.append(_("div", {
			"className" : "kaminari-setting-panel  js-kaminari-setting-panel"
		},[
			_("h5", {
				"className" : "font-settings-title"
			}),
			_("div", {
				"className" : "font-settings-area  js-font-settings-area"
			},[
				_("span", {
					"className" : "font-setting-item font-first-item item-focus  js-font-first-item",
					"value" : 18
				}),
				_("span", {
					"className" : "font-setting-item font-second-item  js-font-second-item",
					"value" : 36
				})
			]),
			_("h5", {
				"className" : "show-mode-title"
			}),
			_("div", {
				"className" : "show-mode-item fir-item chosen",
				"value" : 1
			},[
				_("div", {
					"className" : "show-style-icon style-one icon-kaminari-setting-scroll"
				}),
				_("h6", {
					"className" : "show-style-text text-one"
				})
			]),
			_("div", {
				"className" : "show-mode-item sec-item",
				"value": 5
			},[
				_("div", {
					"className" : "show-style-icon style-two icon-kaminari-setting-top-fadeout"
				}),
				_("h6", {
					"className" : "show-style-text text-two"
				})

			]),
			_("div", {
				"className" : "show-mode-item thr-item",
				"value" : 4
			},[
				_("div", {
					"className" : "show-style-icon style-three icon-kaminari-setting-bottom-fadeout"
				}),
				_("h6", {
					"className" : "show-style-text text-three"
				})
			])
		]));

		/*Init general kaminari settings panel*/
		container.append(_("div", {
			"className" : "general-kaminari-settings"
		},[
			_("h5", {
				"className" : "general-kaminari-settings-title"
			}),
			_("div", {
				"className" : "setting-bar-area  opacity-area"
			}, [
				_("div", {
					"className" : "bar-cursor  js-opacity-cursor"
				},[
					_("p", {
						"className" : "bar-label  js-opacity-label"
					})
				]),
				_("div", {
					"className" : "base-bar js-opacity-bar",
					"value" : "opacityBar"
				},[
					_("div", {
						"className" : "value-bar  opacity-value-bar  js-opacity-value-bar",
						"value" : "opacityBar"
					})
				]),
				_("h6", {
					"className" : "bar-name js-opacity-bar-name"
				})
			]),
			_("div", {
				"className" : "setting-bar-area max-area"
			}, [
				_("div", {
					"className" : "bar-cursor  js-max-cursor"
				},[
					_("p", {
						"className" : "bar-label  js-max-label"
					})
				]),
				_("div", {
					"className" : "base-bar js-max-bar",
					"value" : "maxBar"
				},[
					_("div", {
						"className" : "value-bar  max-value-bar  js-max-value-bar",
						"value" : "maxBar"
					})
				]),
				_("h6", {
					"className" : "bar-name js-max-bar-name"
				})
			]),
			_("div", {
				"className" : "setting-bar-area  speed-area"
			}, [
				_("div", {
					"className" : "bar-cursor  js-speed-cursor"
				},[
					_("p", {
						"className" : "bar-label  js-speed-label"
					})
				]),
				_("div", {
					"className" : "base-bar  js-speed-bar",
					"value" : "speedBar"
				},[
					_("div", {
						"className" : "value-bar  speed-value-bar  js-speed-value-bar",
						"value" : "speedBar"
					})
				]),
				_("h6", {
					"className" : "bar-name  js-speed-bar-name"
				})
			]),
			_("div", {
				"className" : "setting-bar-area  border-area"
			}, [
				_("div", {
					"className" : "bar-cursor  js-border-cursor"
				},[
					_("p", {
						"className" : "bar-label  js-border-label"
					})
				]),
				_("div", {
					"className" : "base-bar  js-border-bar",
					"value" : "borderBar"
				},[
					_("div", {
						"className" : "value-bar  border-value-bar  js-border-value-bar",
						"value" : "borderBar"
					})
				]),
				_("h6", {
					"className" : "bar-name  js-border-bar-name"
				})
			])
		]));

		/*Init video format panel*/
		this._initVideoFormat();
		container.append(_("div", {
			"className" : "play-show-icon  js-play-show-icon"
		}, [
			_("i", {
				"className": "iconfont  icon-play-show"
			})
		]));

		/* Init loading cycle animation*/
		container.append(_("div",{
			"className": "spinner  js-spinner"
		},[
			_("div",{
				"className": "spinner-container container1"
			},[
				_("div",{
					"className": "circle1"
				}),
				_("div",{
					"className": "circle2"
				}),
				_("div",{
					"className": "circle3"
				}),
				_("div",{
					"className": "circle4"
				})
			]),
			_("div",{
				"className": "spinner-container container2"
			},[
				_("div",{
					"className": "circle1"
				}),
				_("div",{
					"className": "circle2"
				}),
				_("div",{
					"className": "circle3"
				}),
				_("div",{
					"className": "circle4"
				})
			]),
			_("div",{
				"className": "spinner-container container3"
			},[
				_("div",{
					"className": "circle1"
				}),
				_("div",{
					"className": "circle2"
				}),
				_("div",{
					"className": "circle3"
				}),
				_("div",{
					"className": "circle4"
				})
			])
		]));
	};

	ABP._initVideoFormat = function(container) {
		var count = 0;
		var format_list = this.params.videoQualityInfo.videoQualityDes;

		for(var code in format_list) {
			if(format_list.hasOwnProperty(code)) {
				count++;
			}
			this.params.videoQualityInfo.hasOneFormat = (count > 1) ? false : true;
		}

		if(!this.params.videoQualityInfo.hasOneFormat) {
			if(	$(".js-abp-settings-btn").hasClass("unable")) {
				$(".js-abp-settings-btn").removeClass("unable");
			}

			var format_list_dom = [];
			for(var code in format_list) {
					format_list_dom.push(_("li", {
							"className" : "settings-line-item  js-"+ code +"-quality",
							"value": code
					},[format_list[code]]));
			}
			format_list_dom.reverse();

			this.container.append(_("div", {
				"className" : "video-format-list"
			},[
				format_list_dom
			]));

			$(".settings-line-item[value="+ this.params.videoQualityInfo.currentVideoQuality +"]").addClass("current");
		} else {
			$(".js-abp-settings-btn").addClass("unable");
		}
	};

	ABP._initTextInfo = function() {
		var videoDes = this.params.videoQualityInfo;

		/*Titles in general kaminari settings panel*/
		$(".general-kaminari-settings-title").text("弹幕设置");
		$(".js-opacity-bar-name").text("弹幕透明度");
		$(".js-max-bar-name").text("同屏最大弹幕数");
		$(".js-speed-bar-name").text("弹幕速度");
		$(".js-border-bar-name").text("弹幕描边宽度");

		/*Title for send kaminari button*/
		$(".js-kaminari-send-text").text("发送");

		/*Title in send kaminari color panel*/
		$(".color-panel-title").text("弹幕颜色");

		/*Titles in send kaminari settings panel*/
		$(".font-settings-title").text("弹幕字号");
		$(".show-mode-title").text("弹幕模式");
		$(".js-font-first-item").text("A");
		$(".js-font-second-item").text("A");
		$(".text-one").text("滚动字幕");
		$(".text-two").text("顶部渐隐");
		$(".text-three").text("底部渐隐");

		$(".abp-settings").text(videoDes.videoQualityDes[videoDes.currentVideoQuality]);

		/** Init time show text **/
		$("#currentTimeText").html("00:00");
		$("#totalTimeText").html(" / 00:00");

		/* Init volume bar and cursor*/
		$(".js-volume-bar").css("width", "70%");
		$(".js-volume-bar-cursor").css("left", "70%");
	};

	ABP._bind = function (state) {
		var ABPInst = this._initABPInst(state);
		this._initABPInstControls(this.container, ABPInst);
		this._initCMManager(ABPInst);
		ABPInst._initFullscreenEvents();
		ABPInst._initVideoEvents();
		ABPInst._initPlayerUnitMouseEvent(this.container);
		ABPInst._initProgressBar();
		ABPInst._initVolumeBar();
		ABPInst._initVideoControlsEvents();
		ABPInst._initVideoSettingsPanel();
		ABPInst._initKaminariControlsEvents();

		if(ABPInst.videos.isBound !== true){
			ABPInst.swapVideo(ABPInst.videos);
		}

		/** Create a bound CommentManager if possible **/
		ABPInst.boundCommentManager(this.container);
		return ABPInst;
	};

	ABP._initABPInst = function (state) {
		var ABPInst = {
			videos:[],
			videoDuration: [],
			duration: 0,
			videoTimes: [0],
			currentVideoNum: 0,
			currentTime: 0,
			loaded: 0,
			readyNum: 0,
			bufIndex: 0,
			barAbPos: 0,
			vBarAbPos: 0,
			kShowStyle: 1,
			kFontSize: 18,
			scrollTop: 0,
			parentElement: this.parentElement,
			cmManager:null,
			divComment:null,
			barObj: null,
			valueBarObj: null,
			barCursor: null,
			barLabel: null,
			controlsTimeoutID: null,
			fullscreenCursorShow: true,
			fullscreenControlsShow : true,
			isKaminariShow: true,
			needChangeBuf: false,
			isColorPanelShow : false,
			isVideoPanelShow : false,
			onFormatList: false,
			isLoopChosen: false,
			isLoop: false,
			videosGetReady: false,
			isMobile: this.params.isMobile,
			// videoID: this.params.videoID,
			fullscreen : false,
			canPlay : false,
			isWaiting: false,
			onGenSettingsPanel: false,
			onKSettingsPanel: false,
			onKColorPanel: false,
			dragging : false,
			vDragging : false,
			kDragging : false,
			customType : false,
			state: $.extend({
				commentVisible: true,
				fullscreen: false,
				allowRescale: false,
				autosize: false
			}, state),
			cursorTimeoutID:"",
			priorityQuality: this.params.videoQualityInfo.currentVideoQuality,
			priorityQualityChosen: this.params.videoQualityInfo.currentVideoQuality,
			kaminariColor : "white",
			kFontType: "small",
			videoQuality: {},
			videoQualityDes: this.params.videoQualityInfo.videoQualityDes,
			isUserLogin: this.params.isUserLogin,
			originUrl: this.params.originUrl,
			defaults:{
				w:0,
				h:0
			},
			hexColors: {
				"red" : 0xe60111,
				"yellow" : 0xfef201,
				"green" : 0x90c41f,
				"rose" : 0xe2037f,
				"blue" : 0x002e72,
				"orange" : 0xf0ac2a,
				"purple" : 0x683b7b,
				"white" : 0xf1f1f1
			},

			videoFullscreen: function() {
				var video = this.videos[ABPInst.currentVideoNum].get(0);
				if (video.requestFullscreen) {
					video.requestFullscreen();
				} else if (video.mozRequestFullScreen) {
					video.mozRequestFullScreen();
				} else if (video.webkitRequestFullscreen) {
					video.webkitRequestFullscreen();
				} else {   // custom fullscreen for ie
					ABPInst.customType = true;
					ABPInst.customFullScreen();
				}
			},

			cancelVideoFullscreen: function() {
				if (document.cancelFullScreen) {
					document.cancelFullScreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				} else {  // custom cancel fullscreen for ie
					ABPInst.customType = false;
					ABPInst.customCancelFullScreen();
				}
			},

			customFullScreen: function() {
				ABPInst.fullscreen = !ABPInst.fullscreen;
				ABPInst.scrollTop = $(window).scrollTop();
				$(window).scrollTop(0);
				this.parentElement.addClass("container-custom-fullscreen")
				.parents().addClass("fullscreen-layout-change");

				$("body, .abp-unit, .abp-video").addClass("custom-fullscreen");
				$(".js-abp-video-controls, .js-abp-text-controls, .js-kaminari-color-panel, .ab-progress-bar, .js-kaminari-setting-panel, .general-kaminari-settings, .js-play-show-icon, .js-spinner .video-next-info").addClass("fullscreen");
				$(".js-abp-fullscreen-btn").removeClass("icon-fullscreen").addClass("icon-cancel-fullscreen");

				ABPInst.fullScreenBehavior();
			},

			customCancelFullScreen: function() {
				ABPInst.fullscreen = !ABPInst.fullscreen;
				this.parentElement.removeClass("container-custom-fullscreen")
				.parents().removeClass("fullscreen-layout-change");

				$("body, .abp-unit, .abp-video").removeClass("custom-fullscreen");
				$(".js-abp-video-controls, .js-abp-text-controls, .js-kaminari-color-panel, .ab-progress-bar, .js-kaminari-setting-panel, .general-kaminari-settings, .js-play-show-icon, .js-spinner").removeClass("fullscreen");
				$(".js-abp-fullscreen-btn").removeClass("icon-cancel-fullscreen").addClass("icon-fullscreen");

				$(window).scrollTop(ABPInst.scrollTop);

				ABPInst.cancelFullScreenBehavior();
			},

			fullScreenBehavior: function() {
				ABPInst.cursorTimeoutID = setTimeout(function(){
					ABPInst.divComment.addClass("cursor-hide");
					ABPInst.fullscreenCursorShow = false;
				}, 3000);

				ABPInst.controlsTimeoutID = setTimeout(function(){
					$("js-main-controls").addClass("controls-invisible");
					ABPInst.fullscreenControlsShow = false;
				}, 3000);
			},

			cancelFullScreenBehavior: function() {
				if(ABPInst.cursorTimeoutID) {
					clearTimeout(ABPInst.cursorTimeoutID);
				}
				if(ABPInst.controlsTimeoutID) {
					clearTimeout(ABPInst.controlsTimeoutID);
				}

				ABPInst.divComment.removeClass("cursor-hide");
				ABPInst.fullscreenCursorShow = true;

				$(".js-main-controls").removeClass("controls-invisible");
				ABPInst.fullscreenControlsShow = true;
			},

			cmManagerRescale: function() {
				if(this.cmManager) {
					this.cmManager.setBounds();
				}

				if(!this.state.allowRescale) return;

				if(this.state.fullscreen){
					if(this.defaults.w >0){
						this.cmManager.def.scrollScale = playerUnit.offsetWidth / this.defaults.w;
					}
				}else{
					this.cmManager.def.scrollScale = 1;
				}
			},

			boundCommentManager: function(playerUnit) {
				if(typeof CommentManager !== "undefined"){
					if(this.state.autosize){
						var autosize = function(){
							if(ABPInst.video.videoHeight === 0 || ABPInst.video.videoWidth === 0){
								return;
							}
							var aspectRatio = video.videoHeight / video.videoWidth;
							// We only autosize within the bounds
							var boundW = playerUnit.outerWidth();
							var boundH = playerUnit.outerHeight();
							var oldASR = boundH / boundW;

							if(oldASR < aspectRatio){
								playerUnit.css({
									"width": ((boundH / aspectRatio) + "px"),
									"height": (boundH  + "px")
								});
							}else{
								playerUnit.css({
									"width": (boundW + "px"),
									"height": ((boundW * aspectRatio) + "px")
									});
							}

							ABPInst.cmManager.setBounds();
						};
						this.video.addEventListener("loadedmetadata", autosize);
						autosize();
					}
				}
			},

			handleVideoPlay: function() {
				if(this.videos[this.currentVideoNum].get(0).paused){
					this.videos[this.currentVideoNum].get(0).play();
					$(".js-abp-play-btn").removeClass("icon-play").addClass("icon-pause");
					$(".js-play-show-icon").removeClass("show");
				}else{
					this.videos[this.currentVideoNum].get(0).pause();
					$(".js-abp-play-btn").removeClass("icon-pause").addClass("icon-play");
				}
			},

			sendKaminari: function() {
				var message = $(".js-kaminari-input").val();
				var color = this.hexColors[this.kaminariColor];
				var fontSize = this.kFontSize;
				var showStyle = this.kShowStyle;
				var currentTime = this.video.get(0).currentTime.toFixed(3);
				var kaminariObject = {
					"mode": showStyle,
					"text": message,
					"size": fontSize,
					"color": color
				};

				if(message !== null) {
					this.cmManager.send(kaminariObject);
					$(".js-kaminari-input").val("");
				}

				//TODO send message info to the server.
			},

			durBarMove: function(element, bar, e, cursor) {
				var progressPos, cursorPos;
				this.barAbPos = bar.offset().left;
				progressPos = ((e.pageX - this.barAbPos) * 100 / element.outerWidth()) + "%";
				bar.css("width", progressPos);
				if(cursor) {
					if((e.pageX - this.barAbPos) + cursor.width() >= element.outerWidth()) {
						cursorPos = (element.outerWidth() - cursor.width()) / element.outerWidth() * 100 + "%";
					} else {
						cursorPos = progressPos;
					}
					cursor.css("left", cursorPos);
				}
			},

			changeDuration : function(element, e, cmManager) {
				var lastVideoNum, newTime, i;

				lastVideoNum = this.currentVideoNum;
				this.barAbPos = element.offset().left;
				newTime = ((e.pageX - this.barAbPos) / element.outerWidth()) * this.duration;

				if(newTime < 0) {
					newTime = 0;
				} else if(newTime > this.duration) {
					newTime = this.duration - 1;
				}

				if((Math.abs(newTime - this.currentTime) > 4) && cmManager){
					cmManager.clear();
				}

				this.currentTime = newTime;

				for(i=0; i<this.videos.length; i++) {
					if(newTime < this.videoTimes[i]) {
						break;
					}
				}
				this.currentVideoNum = i - 1;
				this.videos[this.currentVideoNum].get(0).currentTime = newTime - this.videoTimes[this.currentVideoNum];
				if(lastVideoNum !== this.currentVideoNum) {
					var isPaused = this.videos[lastVideoNum].get(0).paused;
					this.videos[lastVideoNum].get(0).pause();
					this.videos[lastVideoNum].css("display", "none");
					if(!isPaused) {
						this.videos[this.currentVideoNum].get(0).play();
					}
					this.videos[this.currentVideoNum].css("display", "inline-block");
				}
				this.needChangeBuf = true;
			},

			volBarMove: function (element, bar, e, cursor) {
				var volumePos, cursorPos;

				volumePos = (e.pageX - this.vBarAbPos) * 100 / element.outerWidth();
				if((e.pageX - this.vBarAbPos) + cursor.width() / 2 >= element.outerWidth()) {
					cursorPos = ((element.outerWidth() - cursor.width() / 2) / element.outerWidth() * 100) + "%";
				} else if((e.pageX - this.vBarAbPos) - cursor.width() / 2 <= 0 ) {
					cursorPos = 0;
				} else {
					cursorPos = volumePos + "%";
				}
				cursor.css("left", cursorPos);

				if(volumePos > 100) {
					volumePos = 100;
				}
				volumePos = volumePos + "%";
				bar.css("width", volumePos);
				this.changeVolume(element, e);
			},

			changeVolume: function(element, e) {
				this.vBarAbPos = element.offset().left;
				var newVolume = ((e.pageX - this.vBarAbPos) / element.outerWidth());
				if(newVolume > 1) {
					newVolume = 1;
				}
				else if(newVolume > 0.009) {
					  element.prev().addClass("icon-volume").removeClass("icon-mute");
				}
				else if(newVolume <= 0.009) {
						element.prev().addClass("icon-mute").removeClass("icon-volume");
						newVolume = 0;
				}

				for(var i=0; i< this.videos.length; i++) {
					this.videos[i].get(0).volume = newVolume;
				}
			},

			cursorMove: function(cursor, bar, e) {
				var barAbPos, xPos, offset, labelPos;

				barAbPos = bar.offset().left;
				xPos = e.pageX - barAbPos;
				offset = cursor.outerWidth() / 2;
				if(xPos > bar.outerWidth()) {
					xPos = bar.outerWidth();
				} else if(xPos < 0) {
					xPos = 0;
				}
				labelPos = xPos - offset;
				cursor.css("left", (labelPos + "px"));
			},

			cursorLabelChange: function(cursorLabel, bar, barType, e) {
				if(barType) {
					var labelNum, width;
					width = (parseInt(this.valueBarObj.css("width")) > 100) ? 100 : parseInt(this.valueBarObj.css("width"));

					switch(barType) {
						case "opacityBar" :
							labelNum = (width / 100).toFixed(1);
							break;
						case "maxBar" :
							var maxNum = 80;
							labelNum = parseInt(maxNum * (width / 100));
							if(labelNum === 0) {
								labelNum = "无限";
							}
							break;
						case "speedBar" :
							var minSpeedFactor = 1;
							var maxIncreaseFactor = 2.5;
							labelNum = (minSpeedFactor + (maxIncreaseFactor * (width / 100) )).toFixed(1);
							break;
						case "borderBar" :
							var minWidth = 0.5;
							var maxIncreaseWidth = 1.5;
							labelNum = parseFloat((minWidth + (maxIncreaseWidth * (width / 100))).toFixed(1));
							break;
						default :
							break;
					}
					cursorLabel.html(labelNum);
				}
			},

			setKCurrentSettingBar : function (bar, valueBar, cursor, label){
				this.barObj = bar;
				this.valueBarObj = valueBar;
				this.barCursor = cursor;
				this.barLabel = label;
			},

			changeKSettingsBehaviour : function(barType, e){
				this.durBarMove(this.barObj, this.valueBarObj, e);
				this.cursorMove(this.barCursor, this.barObj, e);
				this.cursorLabelChange(this.barLabel, this.valueBarObj, barType, e);
			},

			setVideoPriorityQuality : function() {
				var currentVideo, time, isPlay, videoVolume, videoMutedState, i, j, k, l, m, n, z;

				currentVideo = this.videos[this.currentVideoNum].get(0);
				videoVolume = currentVideo.volume;
				videoMutedState = currentVideo.muted;

				if (currentVideo.src === this.videoQuality[this.priorityQualityChosen][this.currentVideoNum]) {
					return;
				}

				$(".abp-settings").text(this.videoQualityDes[this.priorityQualityChosen]);

				isPlay = (currentVideo.paused) ? false : true;

				if(this.videos.length === this.videoQuality[this.priorityQualityChosen].length) {
					time = currentVideo.currentTime;

					for(i = 0; i < this.videos.length; i++) {
						this.videos[i].attr("src", this.videoQuality[this.priorityQualityChosen][i]);
					}

					currentVideo.currentTime = time;
				} else {
					/* Get and remember current time*/
					time = 0;
					for(j=0; j< this.currentVideoNum; j++) {
						time += this.videos[j].get(0).duration;
					}
					time += currentVideo.currentTime;

					/* Change video elements number and src */
					var videoLength, videoQualityLength;
					videoLength = this.videos.length,
					videoQualityLength = this.videoQuality[this.priorityQualityChosen].length;

					/* current video element is more than video srcs */
					if(videoLength > videoQualityLength) {
						for(i = 0; i < videoLength; i++) {
							if(i < videoQualityLength) {
								this.videos[i].attr("src", this.videoQuality[this.priorityQualityChosen][i]);
							} else {
								this.videos[i].remove();
							}
						}
						this.videos.splice(videoQualityLength - 1, videoLength - videoQualityLength);
					} else {  /* current video element is less than video srcs */
						for(i = 0; i < videoQualityLength; i++) {
							if(i < videoLength) {
								this.videos[i].attr("src", this.videoQuality[this.priorityQualityChosen][i]);
							} else {
								var videoPart = _("video",{"preload":"metadata","src":this.videoQuality[this.priorityQualityChosen][i]});
								this.videos.push(videoPart);
								$(".abp-container").after(videoPart);
							}
						}
						this.swapVideo(this.videos);
					}
					}
					/* reset current time for video */
					var videosReady = [];
					var readyState = false;
					var me = this;
					for(k=0; k< me.videos.length; k++) {
						videosReady[k] = false;
					}

					var breakSeed = setInterval(function(){
						for(z= 0; z< me.videos.length; z++) {
							if(me.videos[z][0].readyState > 0) {
								videosReady[z] = true;
							}
						}

						for(l= 0; l< videosReady.length; l++) {
							if(!videosReady[l]) {
								readyState = false;
								break;
							}
							readyState = true;
						}

						if(readyState) {
							clearInterval(breakSeed);
							for(m= 0; m< me.videos.length; m++) {
								time -= me.videos[m].get(0).duration;
								if(time <= 0) {
									me.currentVideoNum = m;
									currentVideo = me.videos[me.currentVideoNum].get(0);
									currentVideo.currentTime = time + currentVideo.duration;
									break;
								}
							}

							me.videoTimes = [];
							var videoTimeSegment = 0;
							for(n=0; n< me.videos.length; n++) {
								me.videoTimes[n] = videoTimeSegment;
								videoTimeSegment += me.videos[n].get(0).duration;
								if(n !== me.currentVideoNum) {
									me.videos[n].css("display","none");
								} else {
									me.videos[n].css("display","inline-block");
								}

								me.videos[n].muted = videoMutedState;
								me.videos[n].volume = videoVolume;
							}

							if(isPlay) {
								currentVideo.play();
							}
						}
					},300);
			},

			_initVideoEvents: function() {
				$(document).bind("keydown", function(e) {
					var keynum, curVideo;
					var VIDEO_SKIP = 4;
					curVideo = ABPInst.videos[ABPInst.currentVideoNum].get(0);
					if(window.event) {  // IE
						keynum = e.keyCode;
					} else if(e.which) {  // Netscape/Firefox/Opera
						keynum = e.which;
					}
					if(keynum === 32 && (!$(".js-kaminari-input").is(":focus"))) {  // press space and input is not focus.
						e.preventDefault();
						ABPInst.handleVideoPlay();
					} else if(keynum === 37){  //press left
						if(curVideo.currentTime >= VIDEO_SKIP) {
							curVideo.currentTime -= VIDEO_SKIP;
						} else {
							if(ABPInst.currentVideoNum === 0) {
								curVideo.currentTime = 0;
							} else {
								var isPaused = curVideo.paused;
								ABPInst.currentVideoNum -= 1;
								var leftTime = VIDEO_SKIP - curVideo.currentTime;
								ABPInst.videos[ABPInst.currentVideoNum].get(0).currentTime = ABPInst.videos[ABPInst.currentVideoNum].get(0).duration - leftTime;
								ABPInst.videos[ABPInst.currentVideoNum].css("display", "inline-block");
								ABPInst.videos[ABPInst.currentVideoNum + 1].css("display", "none");
								curVideo.pause();
								if(!isPaused) {
									ABPInst.videos[ABPInst.currentVideoNum].get(0).play();
								}
							}
						}
					} else if(keynum === 39){  // press right
						if(curVideo.duration - curVideo.currentTime >= VIDEO_SKIP) {
							curVideo.currentTime += VIDEO_SKIP;
						} else {
							if(ABPInst.currentVideoNum !== ABPInst.videos.length - 1) {
								var isPaused = curVideo.paused;
								ABPInst.currentVideoNum += 1;
								var rightTime = curVideo.duration - curVideo.currentTime + VIDEO_SKIP;
								ABPInst.videos[ABPInst.currentVideoNum].get(0).currentTime = rightTime;
								ABPInst.videos[ABPInst.currentVideoNum].css("display", "inline-block");
								ABPInst.videos[ABPInst.currentVideoNum - 1].css("display", "none");
								curVideo.pause();

								if(!isPaused) {
									ABPInst.videos[ABPInst.currentVideoNum].get(0).play();
								}
							} else {
								curVideo.currentTime = curVideo.duration;
							}
						}
					}
				});
			},

			_initFullscreenEvents: function(){
				$(window).bind("webkitfullscreenchange mozfullscreenchange fullscreenchange", function(e){
					ABPInst.fullscreen = !ABPInst.fullscreen;
					$(".js-abp-video-controls, .js-abp-text-controls, .js-kaminari-color-panel, .ab-progress-bar, .js-kaminari-setting-panel, .general-kaminari-settings, .js-play-show-icon, .js-spinner, .video-next-info, .video-format-list").toggleClass("fullscreen");
					ABPInst.divComment.toggleClass("fullscreen");

					if(ABPInst.fullscreen) {
						ABPInst.scrollTop = $(window).scrollTop();
						$(window).scrollTop(0);
						$(".js-abp-fullscreen-btn").removeClass("icon-fullscreen").addClass("icon-cancel-fullscreen");
						ABPInst.fullScreenBehavior();
					} else {
						$(".js-abp-fullscreen-btn").removeClass("icon-cancel-fullscreen").addClass("icon-fullscreen");
						ABPInst.cancelFullScreenBehavior();
						$(window).scrollTop(ABPInst.scrollTop);
					}
				});

				$(".js-main-controls").bind("mouseover",function(e) {
					if(ABPInst.fullscreen) {
						if(!ABPInst.fullscreenControlsShow) {
							$(".js-main-controls").removeClass("controls-invisible");
							ABPInst.fullscreenControlsShow = true;
						}
						if(ABPInst.controlsTimeoutID) {
							clearTimeout(ABPInst.controlsTimeoutID);
						}
					}
				});

				$(".js-main-controls").bind("mouseout",function(e) {
					if(ABPInst.fullscreen) {
						if(ABPInst.controlsTimeoutID) {
							clearTimeout(ABPInst.controlsTimeoutID);
						}
						ABPInst.controlsTimeoutID = setTimeout(function(){
							$(".js-main-controls").addClass("controls-invisible");
							ABPInst.fullscreenControlsShow = false;
						}, 3000);
					}
				});

				$(document).bind("mousemove",function(e) {
					if(ABPInst.fullscreen) {
						if(!ABPInst.fullscreenCursorShow) {
							ABPInst.divComment.removeClass("cursor-hide");
							ABPInst.fullscreenCursorShow = true;
						}
						if(ABPInst.cursorTimeoutID) {
							clearTimeout(ABPInst.cursorTimeoutID);
						}
						ABPInst.cursorTimeoutID = setTimeout(function(){
							ABPInst.fullscreenCursorShow = false;
							ABPInst.divComment.addClass("cursor-hide");
						}, 3000);
					}
				});

				$(document).bind("keydown", function(e) {
					if(ABPInst.fullscreen) {
						var keynum, volume;
						if(window.event) {  // IE
							keynum = e.keyCode;
						} else if(e.which) {  // Netscape/Firefox/Opera
							keynum = e.which;
						}

						if(keynum === 38){  // press top
							volume = ABPInst.videos[ABPInst.currentVideoNum].get(0).volume;
							volume += 0.05;
							if(volume > 1) {
								volume = 1;
							}
							for(var i=0; i< ABPInst.videos.length; i++) {
								ABPInst.videos[i].get(0).volume = volume;
							}
							$(".js-volume-bar").css("width", ((volume * 100) + "%"));
							$(".js-volume-bar-cursor").css("left", ((volume * 100) + "%"));
						} else if(keynum === 40){  // bottom
							volume = ABPInst.videos[ABPInst.currentVideoNum].get(0).volume;
							volume = volume - 0.05;
							if(volume < 0) {
								volume = 0;
							}
							for(var j=0; j< ABPInst.videos.length; j++) {
								ABPInst.videos[j].get(0).volume = volume;
							}
							$(".js-volume-bar").css("width", ((volume * 100) + "%"));
							$(".js-volume-bar-cursor").css("left", ((volume * 100) + "%"));
						} else if (keynum === 27 && ABPInst.customType) {  //esc
							ABPInst.customCancelFullScreen();
						}
					}
				});
			},

			_initPlayerUnitMouseEvent: function(playerUnit) {
				playerUnit.bind("mousemove", function(e){
					e.preventDefault();
					if(ABPInst.dragging) {
						ABPInst.durBarMove($(".js-ab-progress-bar"), $(".js-bar-time"), e, $(".js-bar-cursor"));
					}
					if(ABPInst.vDragging) {
						ABPInst.volBarMove($(".js-ab-volume-bar"), $(".js-volume-bar"), e, $(".js-volume-bar-cursor"));
					}
				});

				playerUnit.bind("mouseup", function(e){
					if(ABPInst.dragging) {
						ABPInst.dragging = false;
						ABPInst.changeDuration($(".js-ab-progress-bar"), e, ABPInst.cmManager);
					}
					if(ABPInst.vDragging) {
						ABPInst.vDragging = false;
						ABPInst.changeVolume( $(".js-ab-volume-bar"), e);
					}
				});

				playerUnit.bind("mouseleave", function(e){
					if(ABPInst.dragging) {
						ABPInst.changeDuration($(".js-ab-progress-bar"), e, ABPInst.cmManager);
					}
					ABPInst.dragging = false;
					ABPInst.vDragging = false;
				});
			},

			_initProgressBar: function() {
				$(".js-bar-time").css("width", 0);
				$(".js-bar-cursor").css("left", 0);
				$(".js-ab-progress-bar").bind("mousedown", function(e){
					ABPInst.dragging = true;
				});

				$(".js-ab-progress-bar").bind("mouseup", function(e){
					ABPInst.dragging = false;
					ABPInst.changeDuration($(this), e, ABPInst.cmManager);
				});

				$(".js-ab-progress-bar").bind("mousemove", function(e){
					if(ABPInst.dragging){
						ABPInst.durBarMove($(this), $(".js-bar-time"), e, $(".js-bar-cursor"));
					}
				});
			},

			_initVolumeBar : function() {
				for(var i=0; i< ABPInst.videos.length; i++) {
					ABPInst.videos[i].get(0).volume = 0.7;
				}
				$(".js-ab-volume-bar").bind("mousedown",function(e){
					ABPInst.vDragging = true;
					$(".js-volume-bar").css("opacity", 1);
					$(".js-volume-bar-cursor").css("opacity", 1);
					if(ABPInst.videos[ABPInst.currentVideoNum].get(0).muted) {
						for(var j=0; j< ABPInst.videos.length; j++) {
							ABPInst.videos[j].get(0).muted = false;
						}
						$(".js-abp-volume").removeClass("icon-mute").addClass("icon-volume");
					}
				});

				$(".js-ab-volume-bar").bind("mouseup",function(e){
					ABPInst.vDragging = false;
					ABPInst.changeVolume($(this), e);
				});

				$(".js-ab-volume-bar").bind("mousemove",function(e){
					if(ABPInst.vDragging) {
						ABPInst.volBarMove($(this), $(".js-volume-bar"), e, $(".js-volume-bar-cursor"));
					}
				});

				$(".js-ab-volume-bar").bind("click",function(e){
					ABPInst.volBarMove($(this), $(".js-volume-bar"), e, $(".js-volume-bar-cursor"));
				});
			},

			_initVideoControlsEvents : function() {
				var me = this;
				$(".js-abp-play-btn").bind(ABPInst.isMobile ? "touchend" : "click", function(){
					if(ABPInst.canPlay) {
						ABPInst.handleVideoPlay();
					}
				});

				ABPInst.divComment.bind("click", function(){
					if(ABPInst.canPlay) {
						ABPInst.handleVideoPlay();
					}
				});

				$(".js-abp-settings-btn").hover(function(){
					if(!ABP.params.videoQualityInfo.hasOneFormat){
						$(this).addClass("focus");
					}
					$(".general-kaminari-settings").removeClass("show");
					$(".video-format-list").addClass("show");
				},function(){
					setTimeout(function(){
						if(!ABPInst.onFormatList) {
							$(".video-format-list").removeClass("show");
						}
					},300);
					$(this).removeClass("focus");
				});

				$(".js-abp-fullscreen-btn").bind(ABPInst.isMobile ? "touchend" : "click", function(){
					if(!ABPInst.fullscreen) {
						ABPInst.videoFullscreen();
					} else {
						ABPInst.cancelVideoFullscreen();
					}

					ABPInst.cmManagerRescale();
				});

				if (ABP.nextUrl) {
					$(".js-abp-next-btn").bind("click", function(){
						window.location = ABP.nextUrl;
					});
				} else {
					$(".js-abp-next-btn").css("opacity", '.5');
				}

				$(".js-abp-volume").bind("click", function(){
					var i;
					if(ABPInst.videos[ABPInst.currentVideoNum].get(0).muted){
						for(i=0; i< ABPInst.videos.length; i++) {
							ABPInst.videos[i].get(0).muted = false;
						}
						$(".js-volume-bar").css("opacity", 1);
						$(".js-volume-bar-cursor").css("opacity",1);
						$(this).removeClass("icon-mute").addClass("icon-volume");
					}else{
						for(i=0; i< ABPInst.videos.length; i++) {
							ABPInst.videos[i].get(0).muted = true;
						}
						$(".js-volume-bar").css("opacity", 0);
						$(".js-volume-bar-cursor").css("opacity",0);
						$(this).removeClass("icon-volume").addClass("icon-mute");
					}
				});
			},

			_initVideoSettingsPanel: function() {
				$(".video-format-list").bind("click", function(e) {
					if(e.target.attributes.value) {
						ABPInst.priorityQualityChosen = e.target.attributes.value.value;
						ABPInst.priorityQuality = ABPInst.priorityQualityChosen;
						if(ABPInst.videoQualityDes.hasOwnProperty(ABPInst.priorityQualityChosen)) {
							//get video url for new prioritu quality.
							$.post(
								"the url which can get new video sources",
								function(data){
									ABPInst.videoQuality[ABPInst.priorityQualityChosen] = data.source_urls;
									ABPInst.setVideoPriorityQuality();
								}
							);
						}

						var children = $(this).children();
						var length = children.length;
						for(var i = 0; i < length; i++) {
							if($(children[i]).attr("value") === ABPInst.priorityQualityChosen){
								$(children[i]).addClass("current");
							} else {
								$(children[i]).removeClass("current");
							}
						}

						ABPInst.onFormatList = false;
						$(this).removeClass("show");
						$(".js-abp-settings-btn").removeClass("focus");
					}
				});

				$(".video-format-list").bind("mouseover", function() {
					ABPInst.onFormatList = true;
				});

				$(".video-format-list").bind("mouseleave", function() {
					ABPInst.onFormatList = false;
					$(this).removeClass("show");
				});
			},

			_initKaminariControlsEvents: function() {
				$(".js-kaminari-show").bind("click", function(){
					if(ABPInst.isKaminariShow) {
						ABPInst.cmManager.display = false;
						ABPInst.cmManager.clear();
						ABPInst.cmManager.stopTimer();
						$(this).removeClass("icon-kaminari-show").addClass("icon-kaminari-hide");
						ABPInst.isKaminariShow = false;
						$(".general-kaminari-settings").removeClass("show");
					} else {
						ABPInst.cmManager.display = true;
						ABPInst.cmManager.startTimer();
						$(this).removeClass("icon-kaminari-hide").addClass("icon-kaminari-show");
						ABPInst.isKaminariShow = true;
						$(".general-kaminari-settings").addClass("show");
					}
				});

				$(".js-kaminari-show").bind("mouseover", function(){
					if(ABPInst.isKaminariShow) {
						$(".video-format-list").removeClass("show");
						$(".general-kaminari-settings").addClass("show");
					}
				});

				$(".js-kaminari-show").bind("mouseleave", function(){
					if(ABPInst.isKaminariShow) {
						var t = setInterval(function(){
							if(!ABPInst.onGenSettingsPanel) {
								$(".general-kaminari-settings").removeClass("show");
								clearInterval(t);
							}
						},400);
					}
				});

				$(".general-kaminari-settings").bind("mouseover", function(){
					ABPInst.onGenSettingsPanel = true;

					if(ABPInst.controlsTimeoutID && ABPInst.fullscreen) {
						clearTimeout(ABPInst.controlsTimeoutID);
					}
				});

				$(".general-kaminari-settings").bind("mouseleave", function(){
					ABPInst.onGenSettingsPanel = false;
					$(".general-kaminari-settings").removeClass("show");
					if(ABPInst.fullscreen) {
						ABPInst.controlsTimeoutID = setTimeout(function(){
							$(".js-main-controls").addClass("controls-invisible");
							ABPInst.fullscreenControlsShow = false;
						}, 3000);
					}
				});

				var kSettingsBarType = "";

				$(".general-kaminari-settings").bind("mousedown",function(e) {
					ABPInst.kDragging = true;
					if(e.target.attributes.value) {
						kSettingsBarType = e.target.attributes.value.value;
					} else {
						kSettingsBarType = "";
					}

					if(kSettingsBarType) {
						switch(kSettingsBarType) {
							case "opacityBar":
								ABPInst.setKCurrentSettingBar($(".js-opacity-bar"), $(".js-opacity-value-bar"), $(".js-opacity-cursor"), $(".js-opacity-label"));
								break;
							case "maxBar" :
								ABPInst.setKCurrentSettingBar($(".js-max-bar"), $(".js-max-value-bar"), $(".js-max-cursor"), $(".js-max-label"));
								break;
							case "speedBar" :
								ABPInst.setKCurrentSettingBar($(".js-speed-bar"), $(".js-speed-value-bar"), $(".js-speed-cursor"), $(".js-speed-label"));
								break;
							case "borderBar":
								ABPInst.setKCurrentSettingBar($(".js-border-bar"), $(".js-border-value-bar"), $(".js-border-cursor"), $(".js-border-label"));
								break;
							default:
								break;
						}

						ABPInst.barCursor.addClass("show");
						ABPInst.changeKSettingsBehaviour(kSettingsBarType, e);
					} else {
						ABPInst.barObj = null;
						ABPInst.valueBarObj = null;
					}
				});

				$(".general-kaminari-settings").bind("mousemove",function(e) {
					if(ABPInst.kDragging && ABPInst.barObj && ABPInst.valueBarObj) {
						ABPInst.changeKSettingsBehaviour(kSettingsBarType, e);
					}
				});

				$(".general-kaminari-settings").bind("mouseup mouseleave",function(e) {
					ABPInst.kDragging = false;
					if(kSettingsBarType) {
						switch(kSettingsBarType) {
							case "opacityBar":
								var opacity = (parseInt(ABPInst.valueBarObj.css("width")) / 100).toFixed(1);
								ABPInst.cmManager.options.scroll.opacity = opacity;
								break;
							case "maxBar" :
								var maxNum = 80;
								var num = parseInt(maxNum * (parseInt(ABPInst.valueBarObj.css("width")) / 100));
								if(num === maxNum) {
									ABPInst.cmManager.options.limit = -1;
								} else {
									ABPInst.cmManager.options.limit = num;
								}
								break;
							case "speedBar" :
								var minSpeedFactor = 1;
								var maxIncreaseFactor = 2.5;
								var speedFactor = minSpeedFactor + (maxIncreaseFactor * (parseInt(ABPInst.valueBarObj.css("width")) / 100) );
								ABPInst.cmManager.options.scroll.scale = speedFactor;
								break;
							case "borderBar":
								var minWidth = 0.5;
								var maxIncreaseWidth = 1.5;
								var width = parseFloat((minWidth + (maxIncreaseWidth * (parseInt(ABPInst.valueBarObj.css("width")) / 100))).toFixed(1));
								if(width === 0.5) {
									ABPInst.cmManager.options.global.className = "cmt shadow-small";
								} else if(width > 0.5 && width <1) {
									ABPInst.cmManager.options.global.className = "cmt shadow-medium";
								} else if(width > 1 && width < 1.5) {
									ABPInst.cmManager.options.global.className = "cmt shadow-big";
								} else {
									ABPInst.cmManager.options.global.className = "cmt shadow-large";
								}
								break;
							default:
								break;
						}
						ABPInst.barCursor.removeClass("show");
					}
				});

				/*Bind kaminari controls*/
				$(".js-kaminari-setting-btn").bind("mouseover", function(){
					$(".js-kaminari-setting-panel").addClass("show");
					$(".js-kaminari-color-panel").removeClass("show");
				});

				$(".js-kaminari-setting-btn").bind("mouseleave", function(){
					var t = setInterval(function(){
						if(!ABPInst.onKSettingsPanel) {
							$(".js-kaminari-setting-panel").removeClass("show");
							clearInterval(t);
						}
					},400);
				});

				$(".js-kaminari-setting-panel").bind("mouseover",function() {
					ABPInst.onKSettingsPanel = true;

					if(ABPInst.controlsTimeoutID  && ABPInst.fullscreen) {
						clearTimeout(ABPInst.controlsTimeoutID);
					}
				});

				$(".js-kaminari-setting-panel").bind("mouseleave",function() {
					ABPInst.onKSettingsPanel = false;
					$(".js-kaminari-setting-panel").removeClass("show");

					if(ABPInst.fullscreen) {
						ABPInst.controlsTimeoutID = setTimeout(function(){
							$(".js-main-controls").addClass("controls-invisible");
							ABPInst.fullscreenControlsShow = false;
						}, 3000);
					}
				});

				$(".js-font-settings-area").bind("click", function(){
					if(ABPInst.kFontType === "small") {
						ABPInst.kFontType = "big";
						$(".js-font-first-item").removeClass("item-focus");
						$(".js-font-second-item").addClass("item-focus");
						ABPInst.kFontSize = parseInt($(".js-font-second-item").attr("value"));
					} else {
						ABPInst.kFontType = "small";
						$(".js-font-first-item").addClass("item-focus");
						$(".js-font-second-item").removeClass("item-focus");
						ABPInst.kFontSize = parseInt($(".js-font-first-item").attr("value"));
					}
					setTimeout(function() {
						$(".js-kaminari-setting-panel").removeClass("show");
						ABPInst.onKSettingsPanel = false;
					}, 200);
				});

				$(".show-mode-item").bind("click", function(){
					$(this).addClass("chosen");
					ABPInst.kShowStyle = parseInt($(this).attr("value"));
					var length = $(".show-mode-item").length;
					for(var index= 0; index< length; index++) {
						if($(".show-mode-item")[index] !== this) {
							$($(".show-mode-item")[index]).removeClass("chosen");
						}
					}

					setTimeout(function() {
						$(".js-kaminari-setting-panel").removeClass("show");
						ABPInst.onKSettingsPanel = false;
					}, 200);
				});

				$(".js-kaminari-color").bind("mouseover", function(){
						$(".js-kaminari-color-panel").addClass("show");
						$(".js-kaminari-setting-panel").removeClass("show");
				});

				$(".js-kaminari-color").bind("mouseleave", function(){
					var t = setInterval(function(){
						if(!ABPInst.onKColorPanel) {
							$(".js-kaminari-color-panel").removeClass("show");
							clearInterval(t);
						}
					},400);
				});

				$(".js-kaminari-color-panel").bind("mouseover", function() {
					ABPInst.onKColorPanel = true;

					if(ABPInst.controlsTimeoutID && ABPInst.fullscreen) {
						clearTimeout(ABPInst.controlsTimeoutID);
					}
				});

				$(".js-kaminari-color-panel").bind("mouseleave", function() {
					ABPInst.onKColorPanel = false;
					$(".js-kaminari-color-panel").removeClass("show");

					if(ABPInst.fullscreen) {
						ABPInst.controlsTimeoutID = setTimeout(function(){
							$(".js-main-controls").addClass("controls-invisible");
							ABPInst.fullscreenControlsShow = false;
						}, 3000);
					}
				});

				$(".js-kaminari-color-panel").bind("click", function(e){
					if(e.target.attributes.value) {
						ABPInst.kaminariColor = e.target.attributes.value.value;
						ABPInst.onKColorPanel = false;
						$(".js-kaminari-color-panel").removeClass("show");
					}
				});

				$(".js-kaminari-input").bind("keyup", function(e) {
					var keynum;
					if(window.event) {  // IE
						keynum = e.keyCode;
					} else if(e.which) {  // Netscape/Firefox/Opera
						keynum = e.which;
					}
					if(keynum === 13 && (!$(".js-abp-text-controls, .js-abp-video-controls").hasClass("controls-invisible"))) {
						ABPInst.sendKaminari();
					}
				});

				$(".js-kaminari-send").bind("click", function(){
					ABPInst.sendKaminari();
				});

				$(".js-kaminari-send").bind("mousedown", function(){
					$(this).addClass("press");
				});

				$(".js-kaminari-send").bind("mouseup", function(){
					$(this).removeClass("press");
				});
			},

			swapVideo : function(videos) {
				videos.isBound = true;
				videos.forEach(function(video, index, videos) {
					if(index !== 0) {
						video.css("display", "none");
					}

					/** get total duration **/
					video.bind("durationchange", function(){
						ABPInst.videoDuration[index] = this.duration;
						ABPInst.readyNum += 1;
						if(ABPInst.readyNum == videos.length) {
							var count;
							while (!ABPInst.videosGetReady) {
								ABPInst.videosGetReady = true;
								for(count=0; count< ABPInst.videoDuration.length; count++) {
									if(!ABPInst.videoDuration[count]) {
										ABPInst.videosGetReady = false;
										break;
									}
								}
							}

							ABPInst.duration = 0;
							for(count=0; count< ABPInst.videoDuration.length; count++) {
								ABPInst.duration += ABPInst.videoDuration[count];
							}

							var time = 0, totalMin, totalSec, totalTime;
							totalMin = parseInt(ABPInst.duration / 60);
							if(totalMin < 10) {
								totalMin = "0" + totalMin;
							}
							totalSec = (parseInt(ABPInst.duration) % 60);
							if(totalSec < 10) {
								totalSec = "0" + totalSec;
							}
							totalTime = " / " + totalMin + ":" + totalSec;
							$("#totalTimeText").html(totalTime);
							for(var i=1;i<videos.length;i++) {
								time += ABPInst.videoDuration[i-1];
								ABPInst.videoTimes[i] = time;
							}

							$(".abp-video video:first").get(0).play();
						}
					});

					video.bind("webkitendfullscreen",function() {
						$(".js-play-show-icon").addClass("show");
					});

					video.bind("timeupdate", function(){
						var curTimeSec, curTimeMin, currentTime, progressPos, cursorPos;
						curTimeSec = parseInt(ABPInst.currentTime % 60);
						if(curTimeSec < 10) {
							curTimeSec = "0" + curTimeSec;
						}
						curTimeMin = parseInt(ABPInst.currentTime / 60);
						if(curTimeMin < 10) {
							curTimeMin = "0" + curTimeMin;
						}
						currentTime = curTimeMin + ":" + curTimeSec;

						if(!ABPInst.dragging && ABPInst.videos[ABPInst.currentVideoNum] && (this === ABPInst.videos[ABPInst.currentVideoNum].get(0))) {
							if(ABPInst.currentVideoNum === 0) {
								ABPInst.currentTime = this.currentTime;
							}
							else {
								ABPInst.currentTime = ABPInst.videoTimes[ABPInst.currentVideoNum] + this.currentTime;
							}
							progressPos = ((ABPInst.currentTime / ABPInst.duration) * 100);
							$(".js-bar-time").css("width", progressPos + "%");
							if(progressPos > ($(".js-ab-progress-bar").outerWidth() - $(".js-bar-cursor").width() - 2) / $(".js-ab-progress-bar").outerWidth() * 100) {
								cursorPos = ($(".js-ab-progress-bar").outerWidth() - $(".js-bar-cursor").width() - 2) / $(".js-ab-progress-bar").outerWidth() * 100 + "%";
							} else {
								cursorPos = progressPos + "%";
							}
							$(".js-bar-cursor").css("left", cursorPos);
							$("#currentTimeText").html(currentTime);
						}
					});

					video.bind("ended", function(){
						if(index === videos.length - 1) {
							if (ABP.nextUrl && !ABPInst.isLoop) {
								$('.video-next-info').show();
								$('#ABPlayer video').css('opacity',0);
								var countInterval = window.setInterval(function(){
                                    var counts = parseInt($('.video-next-info .second-count-text').text());
                                    $('.video-next-info .second-count-text').text(--counts);
                                    if(counts<=0)
                                    {
                                    	clearInterval(countInterval);
                                        window.location = ABP.nextUrl;
                                    }
								},1000);

							} else {
								ABPInst.currentVideoNum = 0;
								videos[ABPInst.currentVideoNum].get(0).currentTime = 0;

								if(ABPInst.isLoop) {
									videos[ABPInst.currentVideoNum].get(0).play();
								} else {
									$(".js-abp-play-btn").removeClass("icon-pause").addClass("icon-play");
									$(".js-bar-time").css("width", "100%");
									$(".js-bar-cursor").css("left", (($(".js-ab-progress-bar").outerWidth() - $(".js-bar-cursor").width()) / $(".js-ab-progress-bar").outerWidth() * 100 + "%"));
								}
							}
						} else {
							if(ABPInst.fullscreen) {
								ABPInst.cancelVideoFullscreen();
							}
							ABPInst.currentVideoNum += 1;
							videos[ABPInst.currentVideoNum].get(0).currentTime = 0;
							videos[ABPInst.currentVideoNum].get(0).play();
						}
						$(this).css("display", "none");
						videos[ABPInst.currentVideoNum].css("display", "inline-block");
					});

					video.bind("progress",function(){
						if(this.buffered !== null){
							var e, dur, perc;
							try{
								if(ABPInst.needChangeBuf) {
									for(var i= 0; i< this.buffered.length; i++ ) {
										if(this.currentTime >= this.buffered.start(i) && this.currentTime <= this.buffered.end(i)) {
											ABPInst.bufIndex = i;
											ABPInst.needChangeBuf = false;
											break;
										}
									}
								}
								e = this.buffered.end(ABPInst.bufIndex);
								if(ABPInst.currentVideoNum !== 0) {
									e = ABPInst.videoTimes[ABPInst.currentVideoNum] + e;
								}
								if(e > ABPInst.loaded) {
									ABPInst.loaded = e;
									dur = ABPInst.duration;
									perc = (e/dur) * 100;
									$(".js-bar-load").css("width", (perc + "%"));
								}
							}catch(err){
								return;
							}
						}
					});

					video.bind("loadedmetadata", function(){
						if(this.buffered !== null){
							try{
								var s = this.buffered.start(0);
								var e = this.buffered.end(0);
								var dur = this.duration;
								var perc = (e/dur) * 100;
								$(".js-bar-load").css("width", (perc + "%"));
							}catch(err){
								return;
							}
						}
					});

					video.bind("loadeddata", function(){
					});

					video.bind("play", function(){
						try{
							var e = this.buffered.end(ABPInst.bufIndex);
							var dur = this.duration;
							var perc = (e/dur) * 100;
							$(".js-bar-load").css("width", (perc + "%"));
						}catch(err){
							return err;
						}
					});

					video.bind("pause", function(){
						if(index === videos.length - 1 && ABPInst.videoDuration[index] === this.currentTime) {
							if(ABP.nextUrl) {
								$(".js-spinner").removeClass("hide");
							} else {
								$(".js-play-show-icon").addClass("show");
							}
						} else if(!ABPInst.isWaiting && !ABPInst.isMobile && (this.currentTime !== this.duration)) {
							$(".js-play-show-icon").addClass("show");
						}
					});

					video.bind("canplay", function(){
						ABPInst.canPlay = true;
						$(".js-spinner").addClass("hide");
					});

					/* IOS will not preload the video so the 'canplay' event will never triggered.
					 * We should change the status of video player when player init.
					*/
					if(/iPad/i.test(navigator.userAgent)) {
						ABPInst.canPlay = true;
						$(".js-spinner").addClass("hide");
						$(".js-play-show-icon").addClass("show");
					}

					video.bind("waiting", function(){
						ABPInst.isWaiting = true;
						$(".js-spinner").removeClass("hide");
					});

					video.bind("playing",function(){
						ABPInst.isWaiting = false;
						$(".js-play-show-icon").removeClass("show");
						$(".js-spinner").addClass("hide");
					});
				});

				if(ABPInst.cmManager){
					ABPInst.cmManager.clear();

					if(window){
						window.addEventListener("resize", function(){
							//Notify on resize
							ABPInst.cmManager.setBounds();
						});
					}

					var lastPosition = 0;
					videos.forEach(function(video, index, videos) {

						video.bind("progress", function(){
							if(lastPosition == ABPInst.currentTime){
								videos.hasStalled = true;
								ABPInst.cmManager.stopTimer();
							}else
								lastPosition = ABPInst.currentTime;
						});

						video.bind("timeupdate", function(){
							if(ABPInst.cmManager.display === false) return;
							if(videos.hasStalled){
								ABPInst.cmManager.startTimer();
								videos.hasStalled = false;
							}
							ABPInst.cmManager.time(Math.floor(ABPInst.currentTime * 1000));
						});

						video.bind("play", function(){
							ABPInst.cmManager.startTimer();
						});

						video.bind("ratechange", function(){
							if(ABPInst.cmManager.def && ABPInst.cmManager.def.globalScale !== null){
								if(this.playbackRate !== 0){
									ABPInst.cmManager.def.globalScale = (1 / this.playbackRate);
									ABPInst.cmManager.rescale();
								}
							}
						});

						video.bind("pause", function(){
							ABPInst.cmManager.stopTimer();
						});

						video.bind("waiting", function(){
							ABPInst.cmManager.stopTimer();
						});

						video.bind("playing",function(){
							ABPInst.cmManager.startTimer();
						});
					});
				}
			}
		};

		return ABPInst;
	};

	ABP._initABPInstControls = function (playerUnit, ABPInst) {
		if(playerUnit === null) return;
		ABPInst.defaults.w = playerUnit.outerWidth();
		ABPInst.defaults.h = playerUnit.outerHeight();
		var _v = playerUnit.children(".abp-video");
		if(_v.length <= 0) return;
		var vChildren = _v.children();
		for(var i=0; i< vChildren.length; i++)	{
			if(vChildren[i].tagName !== null &&
				vChildren[i].tagName.toUpperCase() === "VIDEO"){
				ABPInst.videos.push($(vChildren[i]));
			}
		}

		if(ABPInst.videos.length === 0) return;
		ABPInst.video = ABPInst.videos[0];

		ABPInst.divComment = _v.children(".abp-container");
	};

	ABP._initCMManager = function(ABPInst) {
		/** Create a commentManager if possible **/
		if(typeof CommentManager !== "undefined"){
			ABPInst.cmManager = new CommentManager(ABPInst.divComment.get(0));
			ABPInst.cmManager.display = true;
			ABPInst.cmManager.init();
			ABPInst.cmManager.clear();
			if(window){
				window.addEventListener("resize", function(){
					//Notify on resize
					ABPInst.cmManager.setBounds();
				});
			}
		}
	};

	ABP.changeToMobileLayout = function() {
		/* invisible kaminari controls bar */
		$("video").attr("controls", "controls");
		$(".js-abp-text-controls").css("display", "none");
		$(".js-ab-progress-bar ").css("display", "none");

		/* adjust video container layout*/
		$(".abp-video").css("bottom", 0);

		/* adjust video controls bar layout*/
		$(".js-abp-video-controls").css({
			"background": "rgba(0,0,0,.5)",
			"bottom": 0,
			"border-top": "0px "
		});
		$(".js-abp-video-controls, .abp-next, .abp-volume, .js-ab-volume-bar, .js-kaminari-show, .js-abp-settings-btn, .js-spinner").css("display", "none");
		$(".abp-unit .abp-control-button").css({
			"background-color" : "initial",
			"color": "#fff"
		});
		$(".abp-unit .abp-control .abp-time").css("left", 40);
		$(".abp-unit .abp-control .abp-time .text-style").css("color", "#fff");
		$(".js-ab-progress-bar").css({
			"left" : "130px",
			"right": "70px"
		});

		/*adjust play icon*/
		$(".icon-play-show").css("color", "#fff");
		$(".play-show-icon").css({
			"top" : "50%",
			"left": "50%",
			"margin-top" : "-25px",
			"margin-left": "-25px"
		});
		$(".icon-play-show").addClass("moblie");
	};

	ABP.changeToMobileBehavior = function(instance) {
		var timeoutID;
		$(".abp-container").unbind("click");
		$(".js-play-show-icon").addClass("show");
		$(".abp-container").bind("touchend",function() {
		});
	};
})();
