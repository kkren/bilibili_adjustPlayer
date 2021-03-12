// ==UserScript==
// @name        哔哩哔哩（bilibili.com）播放器调整R（ver.stardust）
// @namespace   stardust
// @author      kkren
// @license     GPL-3.0-or-later
// @homepageURL https://github.com/kkren/bilibili_adjustPlayer
// @include     http*://www.bilibili.com/video/av*
// @include     http*://www.bilibili.com/video/BV*
// @include     http*://www.bilibili.com/watchlater/*
// @include     http*://www.bilibili.com/medialist/play/*
// @include     http*://www.bilibili.com/bangumi/play/ep*
// @include     http*://www.bilibili.com/bangumi/play/ss*
// @include     http*://bangumi.bilibili.com/anime/*/play*
// @include     http*://bangumi.bilibili.com/movie/*
// @exclude     http*://bangumi.bilibili.com/movie/
// @description 调整B站播放器设置，增加一些实用的功能。原作者为mickey7q7。
// @version     2.10.9
// @grant       GM.setValue
// @grant       GM_setValue
// @grant       GM.getValue
// @grant       GM_getValue
// @grant       unsafeWindow
// @run-at      document-end
// ==/UserScript==

(function () {
	'use strict';
	var adjustPlayer = {
		autoWidescreen: function (set, fullscreen) {
			if (typeof set !== 'undefined') {
				var autoWidescreen = function () {
					var widescreenBtn = querySelectorFromIframe('.bilibili-player-video-btn-widescreen');
					if (widescreenBtn !== null) {
						var screenMode = sessionStorage.getItem("adjustPlayer_screenMode");
						if (screenMode !== "widescreen") {
							doClick(widescreenBtn);
						}
					}
				};
				autoWidescreen();
				if (typeof fullscreen !== 'undefined') {
					if (fullscreen === 'on') {
						function fullscreenEvent(e) {
							var element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
							if (typeof element === 'undefined') {
								autoWidescreen();
							}
						}
						document.addEventListener("fullscreenchange", fullscreenEvent);
						document.addEventListener("webkitfullscreenchange", fullscreenEvent);
						document.addEventListener("mozfullscreenchange", fullscreenEvent);
						document.addEventListener("MSFullscreenChange", fullscreenEvent);
					}
				}
			}
		},
		fixWidescreenFocusPlayer: function (setting, isReload, autoWidescreenCallback) {
			var timerCount = 0;
			var timer = window.setInterval(function () {
				if (timerCount >= 20) {
					clearInterval(timer);
				}
				timerCount++;
				if (typeof unsafeWindow.PlayerAgent !== 'undefined') {
					if (typeof unsafeWindow.PlayerAgent.player_widewin !== 'undefined') {
						//console.log(unsafeWindow.PlayerAgent.player_widewin);
						clearInterval(timer);
						fixWidescreenFocusPlayer();
					}
				}
			}, 200);

			var fixWidescreenFocusPlayer = function () {
				var callback = function () {
					if (typeof autoWidescreenCallback === 'function') {
						if (isReload) {
							autoWidescreenCallback(true, setting.autoWidescreenFullscreen);
						} else {
							autoWidescreenCallback(setting.autoWidescreen, setting.autoWidescreenFullscreen);
						}
					}
				};

				if (setting.autoFocusPlayer) {
					//unsafeWindow.PlayerAgent.player_widewin = null;
					callback();
					//adjustPlayer.autoFocusPlayer(true, setting.autoFocusPlayerOffsetType, setting.autoFocusPlayerOffsetValue);
					return;
				} else if (setting.resizePlayer) {
					unsafeWindow.PlayerAgent.player_widewin = function () {
						adjustPlayer.autoFocusPlayer(true, setting.autoFocusPlayerOffsetType, setting.autoFocusPlayerOffsetValue);
					};
					callback();
					return;
				} else {
					callback();
				}
			};
		},
		autoFocusPlayer: function (set, offsetType, offsetValue, isShortcut) {
			if (typeof set !== 'undefined') {
				try {
					var focusPlayer = function () {
						setTimeout(function () {
							var playerWrapper;
							var scrollToY;
							if (matchURL.isVideoAV()) {
								playerWrapper = document.querySelector('#playerWrap');
								scrollToY = playerWrapper.offsetTop;
							}
							if (typeof offsetValue !== 'undefined' && typeof offsetType !== 'undefined') {
								if (offsetType === "add") {
									scrollToY += offsetValue;
								} else if (offsetType === "sub") {
									scrollToY -= offsetValue;
								}
							}
							if (typeof offsetValue === 'undefined') {
								scrollToY -= 10;
							}
							var currentScrollToY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
							var playerHeight = playerWrapper.offsetHeight;
							var playerOffsetTop = playerWrapper.offsetTop;
							if (currentScrollToY >= (playerHeight + playerOffsetTop) && isShortcut !== true) {
								return;
							} else {
								unsafeWindow.scrollTo(0, scrollToY);
							}
						}, 200);
					};
					var timerCount = 0;
					var timer = window.setInterval(function () {
						if (timerCount >= 20) {
							clearInterval(timer);
						}
						timerCount++;

						var screenMode = sessionStorage.getItem("adjustPlayer_screenMode");
						if (screenMode == 'widescreen') {
							var widescreenReady = document.querySelector('.player-mode-widescreen')
							if (widescreenReady !== null) {
								if (isShortcut) {
									unsafeWindow.scrollTo(0, 0);
									focusPlayer();
								} else {
									focusPlayer();
								}
								clearInterval(timer);
							}
						} else {
							if (isShortcut) {
								unsafeWindow.scrollTo(0, 0);
								focusPlayer();
							} else {
								focusPlayer();
							}
							clearInterval(timer);
						}
					}, 200);
				} catch (e) {
					console.log('autoFocus：' + e);
				}
			}
		},
		autoPlay: function (set, video) {
			if (typeof set !== 'undefined' && video !== null) {
				if (video.play) {
					video.play();
				}
			}
		},
		// bilibili auto play by default
		startFromHistory: function (set, type) {
			if (typeof set !== 'undefined') {
				var timerCount = 0;
				var timer = window.setInterval(function () {
					var jumpBtn = querySelectorFromIframe('.bilibili-player-video-toast-item-jump');
					if (timerCount >= 10 || jumpBtn !== null) {
						doClick(jumpBtn);
						clearInterval(timer);
					}
					timerCount++;
				}, 200);
			}
		},
		hideDanmuku: function (set, type) {
			if (typeof set !== 'undefined') {
				var hideDanmuku = function () {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-sendbar .bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-switch > input');
					if (controlBtn !== null) {

						createMouseoverAndMouseoutEvent('show', controlBtn);
						createMouseoverAndMouseoutEvent('hide', controlBtn);

						var chooseDanmaku = querySelectorFromIframe('.bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-switch .choose_danmaku');
						if (chooseDanmaku.innerHTML === "关闭弹幕") {
							doClick(controlBtn);
							console.log("hide danmu");
						}
					}
				};

				if (typeof type !== 'undefined') {
					if (type === "all") {
						hideDanmuku();
					} else if (type === "bangumi") {
						if (matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
							hideDanmuku();
						}
					}
				} else {
					hideDanmuku();
				}
			}
		},
		hideDanmukuFilterType: function (set, type) {
			if (typeof set !== 'undefined') {
				var hideDanmukuFilterType = function (ftype) {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-danmaku-setting-left-block-content .bilibili-player-block-filter-type[ftype=' + ftype + ']');
					if (controlBtn !== null) {
						doClick(controlBtn);
						if (controlBtn.getAttribute("data-name") === "ctlbar_danmuku_" + ftype + "_on") {
							doClick(controlBtn);
						}
					}
				};

				if (typeof type !== 'undefined') {
					return new Promise(function (resolve, reject) {
						var danmakuSettingLitePanel = querySelectorFromIframe('.bilibili-player-video-sendbar .bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-setting .bp-svgicon');
						createMouseoverAndMouseoutEvent('show', danmakuSettingLitePanel).then(function () {
							if (type === 'topAndbottom') {
								hideDanmukuFilterType('top');
								hideDanmukuFilterType('bottom');
							} else {
								hideDanmukuFilterType(type);
							}
						});
						createMouseoverAndMouseoutEvent('hide', danmakuSettingLitePanel);
						resolve('hideDanmukuFilterType done');
					});
				}
			}
		},
		danmukuPreventShade: function (set, type) {
			if (typeof set !== 'undefined' && typeof type !== 'undefined') {
				try {
					var isDanmukuPreventShadeCheckboxSelected = function (ftype) {
						var elem = querySelectorFromIframe('.bilibili-player-video-danmaku-setting-left-preventshade-box .bui-checkbox-label .bui-checkbox-icon-selected');
						var theCSSprop = window.getComputedStyle(elem, null).getPropertyValue("display");
						if (theCSSprop === 'block') {
							return true;
						} else {
							return false;
						}
					};
					var danmukuPreventShade = function () {
						var controlBtn = querySelectorFromIframe('.bilibili-player-video-danmaku-setting-left-preventshade input[type="checkbox"]');
						if (controlBtn !== null) {
							return new Promise(function (resolve, reject) {
								doClick(controlBtn);
								resolve('danmukuPreventShade done');
							});
						}
					};
					var danmakuSettingLitePanel = querySelectorFromIframe('.bilibili-player-video-sendbar .bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-setting .bp-svgicon');
					createMouseoverAndMouseoutEvent('show', danmakuSettingLitePanel).then(function () {
						if (type === 'on') {
							if (!isDanmukuPreventShadeCheckboxSelected()) {
								danmukuPreventShade();
							}
						} else if (type === 'off') {
							if (isDanmukuPreventShadeCheckboxSelected()) {
								danmukuPreventShade();
							}
						}
					});
					createMouseoverAndMouseoutEvent('hide', danmakuSettingLitePanel);
				} catch (e) {
					console.log('danmukuPreventShade：' + e);
				}
			}
		},
		tabDanmulist: function (set) {
			if (typeof set !== 'undefined') {
				try {
					var timerCount = 0;
					var timer = window.setInterval(function callback() {
						if (timerCount >= 20) {
							clearInterval(timer);
						}
						timerCount++;
						var controlBtn = querySelectorFromIframe('#danmukuBox .bui-collapse-header');
						if (controlBtn !== null) {
							var isFolded = querySelectorFromIframe('#danmukuBox .bui-collapse-wrap-folded');
							if (isFolded !== null) {
								doClick(controlBtn);
								clearInterval(timer);
							}
						}
					}, 200);
				} catch (e) {
					console.log('tabDanmulist：' + e);
				}
			}
		},
		autoNextPlist: function (set) {
			if (typeof set !== 'undefined') {
				var video = querySelectorFromIframe('.bilibili-player-video > video:nth-child(1)')
				video.addEventListener("ended", function (e) {
					var paused = querySelectorFromIframe('.video-state-pause');
					var nextBtn = querySelectorFromIframe('.bilibili-player-video-btn-next');

					if (paused !== null && nextBtn !== null) {
						doClick(nextBtn);
					}
				})
			}
		},
		autoLoopVideo: function (set) {
			if (typeof set !== 'undefined') {
				var controlBtn = querySelectorFromIframe('.bilibili-player-video-btn-repeat');
				if (controlBtn !== null) {
					var dataText = controlBtn.querySelector('span.bilibili-player-iconfont-repeat').getAttribute("data-text");
					if (dataText !== '关闭洗脑循环') {
						doClick(controlBtn);
					}
				}
			}
		},
		autoWebFullScreen: function (set) {
			if (typeof set !== 'undefined') {
				var controlBtn = document.getElementsByClassName("bilibili-player-iconfont bilibili-player-iconfont-web-fullscreen-off player-tooltips-trigger")[0];
				if (controlBtn !== null) {
					var screenMode = document.getElementById("bofqi").className;
					if (screenMode !== "webfullscreen") {
						doClick(controlBtn);
					}
				}
			}
		},
		doubleClickFullScreen: function (set, delayed) {
			if (typeof set !== 'undefined' && typeof delayed !== 'undefined') {
				try {
					var fullScreenBtn = querySelectorFromIframe('.bilibili-player-video-btn-fullscreen');
					if (delayed === 0) {
						var video = querySelectorFromIframe('.bilibili-player-video video');
						video.addEventListener('dblclick', function () {
							if (fullScreenBtn !== null) {
								doClick(fullScreenBtn);
							}
						});
					} else {
						var videoParentNodeEvent = function () {
							var dblclickTimer = null;
							var videoParentNode = querySelectorFromIframe('.bilibili-player-video');
							videoParentNode.addEventListener('click', function () {
								clearTimeout(this.dblclickTimer);
								this.dblclickTimer = setTimeout(function () {
									var playPauseBtn = querySelectorFromIframe('.bilibili-player-video-btn-start');
									if (playPauseBtn !== null) {
										doClick(playPauseBtn);
									}
								}, delayed);
							});
							videoParentNode.addEventListener('dblclick', function () {
								clearTimeout(this.dblclickTimer);
								if (fullScreenBtn !== null) {
									doClick(fullScreenBtn);
								}
							});
						};

						var iframePlayer = document.querySelector('iframe.bilibiliHtml5Player');
						if (iframePlayer === null) {
							window.eval([
								'$(".bilibili-player-video").unbind("click");',
								'window.bilibiliPlayerVideoEvents = $(".bilibili-player-video").data("events")'
							].join(''));
						} else {
							iframePlayer.contentWindow.window.eval([
								'$(".bilibili-player-video").unbind("click");',
								'top.window.bilibiliPlayerVideoEvents = $(".bilibili-player-video").data("events")'
							].join(''));
						}

						//console.log(unsafeWindow.bilibiliPlayerVideoEvents);
						if (typeof unsafeWindow.bilibiliPlayerVideoEvents === 'undefined') {
							videoParentNodeEvent();
						} else {
							if (typeof unsafeWindow.bilibiliPlayerVideoEvents.click === 'undefined') {
								videoParentNodeEvent();
							} else {
								console.log('doubleClickFullScreen： unbind click event failed');
								return;
							}
							console.log('doubleClickFullScreen： unbind click event failed');
						}
					}
				} catch (e) {
					console.log('doubleClickFullScreen：' + e);
				}
			}
		},
		autoVideoSpeed: function (set, speed, video) {
			if (typeof set !== 'undefined' && video !== null) {
				try {
					var adjustPlayerVideoPlaybackRate = sessionStorage.getItem("adjustPlayer_videoPlaybackRate");
					if (adjustPlayerVideoPlaybackRate !== null) {
						video.playbackRate = parseFloat(adjustPlayerVideoPlaybackRate);
						return;
					}
					var timerCount = 0;
					var timer = window.setInterval(function () {
						if ((timerCount >= 20) || video.playbackRate == speed) {
							clearInterval(timer);
						}
						timerCount++;
						//clearInterval(timer);
						video.playbackRate = parseFloat(speed);
						console.log(speed);
					}, 200);
					//video.playbackRate = parseFloat(speed);
				} catch (e) {
					console.log('autoVideoSpeed：' + e);
				}
			}
		},
		autoLightOn: function (set, type, callback) {
			if (typeof set !== 'undefined') {
				try {
					var isActiveContextMenu = querySelectorFromIframe('.bilibili-player-context-menu-container.black');
					if (isActiveContextMenu !== null && isActiveContextMenu.getAttribute("class").search("active") !== -1) {
						return;
					}

					var clickLightOnOff = function (controlBtn) {
						if (controlBtn !== null) {
							var tipsText = null;
							var lightOnOffItem = null;
							var contextMenuItem = controlBtn.querySelectorAll('li > a'),
								i;
							for (i = 0; i < contextMenuItem.length; ++i) {
								if (contextMenuItem[i].innerHTML === "关灯" || contextMenuItem[i].innerHTML === "开灯") {
									var tipsText = contextMenuItem[i].innerHTML;
									lightOnOffItem = contextMenuItem[i];
									doClick(contextMenuItem[i]);
									return tipsText;
									break;
								}
							}
						}
						if (type === "ONOFF" && typeof callback === "function") {
							callback();
						}
					};

					var heimuDblclickEvent = function () {
						var heimu = document.querySelector('#heimu');
						var isDblclickEvent = heimu.getAttribute("heimuDblclick");
						if (isDblclickEvent === null) {
							heimu.addEventListener('dblclick', function () {
								heimu.setAttribute("style", "display: none;");
							});
							heimu.setAttribute("heimuDblclick", "true");
						}
					};

					var timerCount = 0;
					var timer = window.setInterval(function callback() {
						if (timerCount >= 20) {
							clearInterval(timer);
						}
						timerCount++;

						contextMenuClick(querySelectorFromIframe('.bilibili-player-area > .bilibili-player-video-wrap'));
						var status = clickLightOnOff(querySelectorFromIframe('.bilibili-player-context-menu-origin'));
						heimuDblclickEvent();
						if (type === "ON" || typeof type === 'undefined') {
							if (status === "关灯") {
								heimuDblclickEvent();
								clearInterval(timer);
							}
						} else if (type === "ONOFF") {
							if (status === "关灯" || status === "开灯") {
								heimuDblclickEvent();
								clearInterval(timer);
							}
						}

					}, 200);
				} catch (e) {
					console.log('autoLightOn：' + e);
				}
			}
		},
		resizePlayer: function (set, width, ratio, videoInfoAndUpInfoPosition, isAutohideControlbar) {
			if (typeof set !== 'undefined' && typeof width !== 'undefined') {
				try {
					var resizePlayer = function () {
						var screenMode = sessionStorage.getItem("adjustPlayer_screenMode");
						var playerCustomWidth = width + 'px';
						var playerNormalModeWidth = 'calc(' + playerCustomWidth + ' - 350px - 30px )';
						var playerMarginTop = 'calc(0px + 50px + 20px)';
						var playerBottomBarHeight = isAutohideControlbar && screenMode === 'widescreen' ? playerBottomBarHeight = '0px' : playerBottomBarHeight = '46px';
						var playerNormalModeHeight = 'calc( ' + playerNormalModeWidth + ' / calc(' + ratio + ') + ' + playerBottomBarHeight + ')';
						var videoInfoAndUpInfo = '';

						//videoInfoAndUpInfoPosition
						if (videoInfoAndUpInfoPosition === 'top') {
							playerMarginTop = 'calc(0px + 50px + 20px + 120px)';
							videoInfoAndUpInfo = '#viewbox_report,#v_upinfo { position: absolute !important; top: 70px !important;  }' +
								'#viewbox_report { max-width:calc(' + width + 'px - 384px - 20px ); }' +
								'#v_upinfo{ margin-left: calc(' + width + 'px - 384px); max-width:384px; } .up-info .u-info .desc { max-width:calc(350px - 30px); } .up-info .btn { margin-top: 50px; position: absolute; left: 64px; }';
						} else if (videoInfoAndUpInfoPosition === 'bottom') {
							videoInfoAndUpInfo = '';
						} else {
							videoInfoAndUpInfo = '';
						}

						var css = [''];
						if (screenMode === "normal") {
							css = [
								'@media (min-width: ' + playerCustomWidth + ' ) {',
								'#playerWrap:not(.mini-player) {',
								'    width: ' + playerCustomWidth + ' !important; ',
								'    height: ' + playerNormalModeHeight + ' !important; ',
								'    margin-left: 0 !important;',
								'    left: calc(50% - ' + playerCustomWidth + ' / 2) !important; ',
								'    top: ' + playerMarginTop + ' !important;',
								'    background: none !important;',
								'    pointer-events: none;',
								'    position: absolute !important;',
								'}',
								'#playerWrap:not(.mini-player) .player{',
								'    width: ' + playerNormalModeWidth + ' !important; ',
								'    height: ' + playerNormalModeHeight + ' !important; ',
								'    pointer-events: none;',
								'}',
								'#playerWrap { height: 0px !important; },',
								'.v-wrap  { width: ' + playerCustomWidth + ' !important; margin: 0 auto !important; }',
								'.v-wrap .l-con { width: calc(100% - 350px - 30px) !important; }',
								'.v-wrap .r-con { width: 350px !important; }',
								'.v-wrap .l-con , .v-wrap .r-con { margin-top:calc(' + playerNormalModeHeight + ' + ' + playerMarginTop + ' ) !important; }',
								'#danmukuBox { position: absolute !important; top: ' + playerMarginTop + ' !important; height: ' + playerNormalModeHeight + ' !important; }',
								'' + videoInfoAndUpInfo + '',
								'}'
							];
						} else if (screenMode === "widescreen") {
							css = [
								'@media (min-width: ' + playerCustomWidth + ' ) {',
								'#playerWrap:not(.mini-player) {',
								'    width: ' + playerCustomWidth + ' !important; ',
								'    height: calc( ' + playerCustomWidth + ' / calc(' + ratio + ') + ' + playerBottomBarHeight + ') !important; ',
								'    margin-left: 0 !important;',
								'    left: calc(50% - ' + playerCustomWidth + ' / 2) !important; ',
								'    top: ' + playerMarginTop + ' !important;',
								'    position: absolute !important;',
								'}',
								'#playerWrap { height:0px !important; },',
								'.v-wrap  { width: ' + playerCustomWidth + ' !important; margin: 0 auto !important; }',
								'.v-wrap .l-con { width: calc(100% - 350px - 30px) !important; }',
								'.v-wrap .r-con { width: 350px !important; }',
								'.v-wrap .l-con , .v-wrap .r-con { margin-top:calc(' + playerCustomWidth + ' / calc(' + ratio + ') + ' + playerBottomBarHeight + ' + ' + playerMarginTop + ' ) !important; }',
								'#danmukuBox { position: absolute !important; top: ' + playerMarginTop + ' !important; height: ' + playerNormalModeHeight + ' !important; visibility: hidden;}',
								'' + videoInfoAndUpInfo + '',
								'}'
							];
						}
						var node = document.createElement('style');
						node.type = 'text/css';
						node.id = 'adjustPlayerSize';
						var adjustMiniPlayerSizeCSS = document.querySelector('#adjustPlayerSize');
						if (adjustMiniPlayerSizeCSS !== null) {
							adjustMiniPlayerSizeCSS.remove();
						}
						node.appendChild(document.createTextNode(css.join('')));
						document.documentElement.appendChild(node);

						//修复高度不正确
						var evt = document.createEvent('Event');
						evt.initEvent('resize', true, true);
						querySelectorFromIframe('.bilibili-player-video video').dispatchEvent(evt);

						//普通模式下超过最小高度不调整
						if (screenMode === "normal") {
							var player = document.querySelector('#playerWrap:not(.mini-player)');
							if (player !== null) {
								if (player.offsetHeight <= 408) {
									var adjustMiniPlayerSizeCSS = document.querySelector('#adjustPlayerSize');
									if (adjustMiniPlayerSizeCSS !== null) {
										adjustMiniPlayerSizeCSS.remove();
									}
								}
							}
						}
					};
					var fixSwitchScreenMode = function () {
						var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
						var observer = new MutationObserver(function (records) {
							records.map(function (record) {
								var resizeTimer;
								resizeTimer = setTimeout(function () {
									clearTimeout(this.resizeTimer);
									resizePlayer();
								}, 200);
							});
						});
						observer.observe(document.querySelector('#playerWrap'), {
							attributes: true,
							childList: true
						});
					}
					var player = isPlayer();
					if (player === "html5Player") {
						setTimeout(function () {
							if (document.querySelector('#adjustPlayerSize') !== null) {
								fixSwitchScreenMode();
								return;
							} else {
								resizePlayer();
								fixSwitchScreenMode();
							}
						}, 200);
					}
				} catch (e) {
					console.log('resizePlayer：' + e);
				}
			}
		},
		resizeMiniPlayer: function (set, width, isResizable) {
			if (typeof set !== 'undefined' && typeof width !== 'undefined') {
				var resize = function () {
					var css = [
						'#playerWrap.mini-player, #playerWrap.mini-player:before , #playerWrap.mini-player .player { width: ' + width + 'px !important; height: calc(' + width + 'px / calc(16 / 9)) !important; }',
						'#adjust-player-miniplayer-resizable { width: ' + width + 'px ; height: calc(' + width + 'px / calc(16 / 9)) !important; position: absolute; top: 0px; z-index: 0; overflow: hidden; resize: both; min-height:100px; min-width:100px; }',
						'#adjust-player-miniplayer-resizable.show,#adjust-player-miniplayer-resizable.show .drag { display:block !important; }',
						'.newfloat #adjust-player-miniplayer-resizable, .mini-player #adjust-player-miniplayer-resizable { z-index: 10000; }'
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustMiniPlayerSize';
					node.appendChild(document.createTextNode(css.join('')));
					var adjustMiniPlayerSizeCSS = document.querySelector("#adjustMiniPlayerSize");
					if (adjustMiniPlayerSizeCSS !== null) {
						adjustMiniPlayerSizeCSS.remove();
					}
					document.documentElement.appendChild(node);
				};

				var resizable = function (initResize) {
					//console.log("resizable");
					var resizableElement = document.createElement('div');
					resizableElement.id = "adjust-player-miniplayer-resizable";
					resizableElement.innerHTML = '<div class="drag" style="width: 10px; height: 10px; position: absolute; bottom: 0px; right: 0; background: #fff; pointer-events: none;display:none;">↘</div>';

					var miniPlayerDiv = document.querySelector('.mini-player');
					if (miniPlayerDiv !== null) {
						var adjustMiniPlayerSizeResizable = document.querySelector("#adjust-player-miniplayer-resizable");
						if (adjustMiniPlayerSizeResizable === null) {
							miniPlayerDiv.appendChild(resizableElement);
						}

						var requestAnimationFrame = window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
						var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
						var requestId;
						var loopTimer;

						var dragEvent = function (width, height) {
							var css = [
								'#playerWrap.mini-player, #playerWrap.mini-player:before , #playerWrap.mini-player .player { width: ' + width + 'px !important; height: ' + height + 'px !important; }',
								'#adjust-player-miniplayer-resizable { position: absolute; top: 0; z-index: 1; overflow: hidden; resize: both; min-height:100px; min-width:100px;width: ' + width + 'px; height: ' + height + 'px; }',
								'#adjust-player-miniplayer-resizable.show,#adjust-player-miniplayer-resizable.show .drag { display:block !important; }',
								'.newfloat #adjust-player-miniplayer-resizable, .mini-player #adjust-player-miniplayer-resizable { z-index: 10000; }',
							];
							//console.log(resizableElementWidth + "\n" + resizableElementHeight);
							var node = document.createElement('style');
							node.type = 'text/css';
							node.id = 'adjustMiniPlayerSize';
							node.appendChild(document.createTextNode(css.join('')));
							var adjustMiniPlayerSizeCSS = document.querySelector("#adjustMiniPlayerSize");
							if (adjustMiniPlayerSizeCSS !== null) {
								adjustMiniPlayerSizeCSS.remove();
							}
							document.documentElement.appendChild(node);
							var player = document.querySelector("#bilibiliPlayer");
							player.classList.add("mode-miniscreen");
						};

						if (initResize) {
							dragEvent(width, Number(width / (16 / 9)).toFixed());
						}

						function loop() {
							requestId = undefined;
							dragEvent(resizableElement.clientWidth, resizableElement.clientHeight);
							start();
						}

						function start() {
							if (!requestId) {
								requestId = requestAnimationFrame(loop);
							}
						}

						function stop() {
							if (requestId) {
								cancelAnimationFrame(requestId);
								requestId = undefined;
							}
						}
						resizableElement.addEventListener("mouseup", function (e) {
							stop();
						}, false);
						resizableElement.addEventListener("mousedown", function (e) {
							if (e.buttons === 1) {
								if ((resizableElement.clientWidth - 10) < e.offsetX && (resizableElement.clientHeight - 10) < e.offsetY) {
									start();
									loopTimer = window.setTimeout(function () {
										clearTimeout(this.loopTimer);
										var resizableElementStyle = resizableElement.getAttribute('class');
										if (resizableElementStyle === 'show') {
											var fixUndersize = function () {
												clearTimeout(loopTimer);
												resizableElement.setAttribute('style', 'width:320px;height:180px;');
												start();
												loopTimer = window.setTimeout(function () {
													stop();
												}, 5000);
											};
											if (resizableElement.style === '') {
												fixUndersize();
											} else {
												var miniPlayerWidth = miniPlayerDiv.clientWidth;
												var miniPlayerHeight = miniPlayerDiv.clientHeight;
												if (matchURL.isWatchlater()) {
													miniPlayerHeight = miniPlayerHeight - 30;
												}
												if (miniPlayerWidth <= 100 || miniPlayerHeight <= 100) {
													fixUndersize();
												} else {
													resizableElement.setAttribute('style', 'width:' + miniPlayerWidth + 'px;height:' + miniPlayerHeight + 'px;');
													stop();
												}
											}
										} else {
											stop();
											miniPlayerHideShow('hide');
										}
									}, 3000);
								} else {
									doClick(document.querySelector('.bilibili-player-video'));
								}
							}
						}, false);
					}
				};

				var miniPlayerHideShow = function (type) {
					var scrollResizeTimer;
					var adjustMiniPlayerSizeResizable = document.querySelector("#adjust-player-miniplayer-resizable");
					if (type === "hide") {
						var player = document.querySelector("#bilibiliPlayer");
						player.classList.remove("mode-miniscreen");
						var adjustMiniPlayerSizeCSS = document.querySelector("#adjustMiniPlayerSize");
						if (adjustMiniPlayerSizeCSS !== null) {
							adjustMiniPlayerSizeCSS.remove();
						}
						if (adjustMiniPlayerSizeResizable !== null) {
							adjustMiniPlayerSizeResizable.classList.remove("show");
							adjustMiniPlayerSizeResizable.setAttribute('style', '');
						}
					} else if (type === "show") {
						if (adjustMiniPlayerSizeResizable !== null) {
							var miniPlayer = document.querySelector('.mini-player');
							if (miniPlayer !== null) {
								adjustMiniPlayerSizeResizable.classList.add("show");
							}
						}
					}
					scrollResizeTimer = window.setTimeout(function () {
						clearTimeout(this.scrollResizeTimer);
						var evt = document.createEvent('Event');
						evt.initEvent('resize', true, true);
						querySelectorFromIframe('.bilibili-player-video video').dispatchEvent(evt);
					}, 800);
				};

				var miniPlayerHideShowEvent = function () {
					var initResize = function (isMiniPlayer) {
						var player = isPlayer();
						if (player === "html5Player") {
							if (isMiniPlayer) {
								if (typeof window.isInitResize === 'undefined' || window.isInitResize === false) {
									if (typeof isResizable !== 'undefined' && isResizable === 'on') {
										resizable(isMiniPlayer);
									} else {
										resize();
									}
									miniPlayerHideShow('show');
									window.isInitResize = true;
								}
							} else {
								if (typeof window.isInitResize === 'undefined' || window.isInitResize === true) {
									miniPlayerHideShow('hide');
									window.isInitResize = false;
								}
							}
						} else {
							resize();
						}
					};

					var observerPlayerElement = document.querySelector('#playerWrap');
					if (matchURL.isNewBangumi()) {
						observerPlayerElement = document.querySelector('#bangumi_player .bangumi-player');
					} else if (matchURL.isWatchlater() === true) {
						observerPlayerElement = document.querySelector('#bilibiliPlayer .bilibili-player-video-wrap');
					}

					var isMiniPlayer;
					if (observerPlayerElement.getAttribute("class") !== null && observerPlayerElement.getAttribute("class").search("mini-player") !== -1) {
						isMiniPlayer = true;
					} else {
						isMiniPlayer = false;
					}
					initResize(isMiniPlayer);

					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
					var observer = new MutationObserver(function (records) {
						records.map(function (record) {
							if (record.target.getAttribute("class").search("mini-player") !== -1) {
								isMiniPlayer = true;
							} else {
								isMiniPlayer = false;
							}
							initResize(isMiniPlayer);
						});
					});
					observer.observe(observerPlayerElement, {
						attributes: true,
						attributeFilter: ['class']
					});
				};
				miniPlayerHideShowEvent();
			}
		},
		autoHideSendbar: function (set, focusDanmakuInput, video) {
			if (typeof set !== 'undefined') {
				try {
					if (querySelectorFromIframe('#adjustPlayerAutoHideSendbar')) {
						return;
					}

					//开启了“自动隐藏播放器控制栏”并设置了“定位到弹幕框的快捷键”之后，鼠标移动到弹幕框时不显示“弹幕框”
					var isFocusDanmakuInput = function () {
						var css = '';
						if (focusDanmakuInput) {
							css = '#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar { visibility: hidden; }';
						}
						return css;
					};

					var css = [
						//修改自 https://userstyles.org/styles/131642/bilibili-html5
						'#bilibiliPlayer.mode-widescreen .bilibili-player-video-bottom-area { position: absolute !important; width: 100% !important;  }',
						'#bilibiliPlayer.mode-widescreen .bilibili-player-video-info { color:hsla(0,0%,100%,.8); display: none !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-danmaku-setting-wrap, #bilibiliPlayer.mode-widescreen .bilibili-player-video-danmaku-setting-wrap { top: 46px !important; bottom: 0 !important; right: -240px !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-mode-selection-container, #bilibiliPlayer.mode-widescreen .bilibili-player-mode-selection-container { position: relative; bottom: 0; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar { background: rgba(33,33,33,.8) !important; opacity: 0; transition: all .2s ease-in-out; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-control-bottom-center { position: fixed; width: 100% !important; top: 0 !important; padding: 0 !important; left: 0 !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar { width: 100% !important; max-width: unset !important; }',
						'#bilibiliPlayer.mode-webfullscreen .bilibili-player-video-sendbar:hover, #bilibiliPlayer.mode-widescreen .bilibili-player-video-sendbar:hover { opacity: 1; }',
						isFocusDanmakuInput()
					];
					var node = document.createElement('style');
					node.type = 'text/css';
					node.id = 'adjustPlayerAutoHideSendbar';
					node.appendChild(document.createTextNode(css.join('')));
					querySelectorFromIframe('.player').appendChild(node);

				} catch (e) {
					console.log('adjustPlayerAutoHideSendbar：' + e);
				}
			}
		},
		videoSeekingShowSendbar: function (set, video) {
			if (typeof set !== 'undefined' && video !== null) {
				video.addEventListener("seeking", function () {
					var controlBar = querySelectorFromIframe('#bilibiliPlayer .bilibili-player-video-control-wrap');
					var controlMask = querySelectorFromIframe('#bilibiliPlayer .bilibili-player-video-control-mask');
					var visibleStyle = "opacity: 1; visibility: visible; ";
					if (controlBar !== null) {
						controlBar.style = visibleStyle;
						controlMask.style = visibleStyle;
						var timer = null;
						clearTimeout(this.timer);
						this.timer = setTimeout(function () {
							if (controlBar !== null) {
								controlBar.style = "";
								controlMask.style = "";
							}
						}, 3000);
					}
				}, true);
			}
		},
		skipSetTime: function (set, skipTime, video) {
			if (typeof set !== 'undefined' && video !== null) {
				var setTime = function () {
					var vLength = video.duration.toFixed();
					//console.log(skipTime);
					try {
						if (skipTime === 0) {
							video.currentTime = set;
						} else if (skipTime > vLength) {
							return;
						} else {
							video.currentTime += skipTime;
						}
					} catch (e) {
						console.log('skipSetTime：' + e);
					}
				};
				setTime();
			}
		},
		shortcuts: function (set) {
			var shortcut = {
				playPause: function () {
					var video = querySelectorFromIframe('.bilibili-player-video video');
					var button = querySelectorFromIframe('.bilibili-player-video-btn-start');
					if (video !== null) {
						if (!video.paused) {
							doClick(button);
							shortcut.shortcutsTips("播放/暂停", "暂停");
						} else {
							doClick(button);
							shortcut.shortcutsTips("播放/暂停", "播放");
						}
					}
				},
				videoFramerate: function (type) {
					var video = querySelectorFromIframe('.bilibili-player-video video');
					var framerate = 24;
					if (video !== null) {
						var contextMenu = querySelectorFromIframe('.bilibili-player-area > .bilibili-player-video-wrap');
						contextMenuClick(contextMenu);

						var controlBtn = querySelectorFromIframe('div.bilibili-player-context-menu-container:nth-child(4)');
						if (controlBtn !== null) {
							var contextMenuItem = controlBtn.querySelectorAll('li > a'),
								i;
							for (i = 0; i < contextMenuItem.length; ++i) {
								if (contextMenuItem[i].innerHTML === "视频统计信息") {
									doClick(contextMenuItem[i]);
									doClick(querySelectorFromIframe('a.bilibili-player-video-info-close'));
									var fps = querySelectorFromIframe('.bilibili-player-video-info-panel > div[data-name="fps"] .info-data');
									fps = parseFloat(fps.innerHTML);
									if (!isNaN(fps)) {
										framerate = fps;
									}
									break;
								}
							}
						}
						//var currentFrame = Math.floor(video.currentTime * framerate);
						if (!video.paused) {
							var button = querySelectorFromIframe('.bilibili-player-video-btn-start');
							doClick(button);
						}
						if (type === "prev") {
							video.currentTime -= 1 / framerate;
							shortcut.shortcutsTips("视频帧率", "快退一帧");
						} else if (type === "next") {
							video.currentTime += 1 / framerate;
							shortcut.shortcutsTips("视频帧率", "快进一帧");
						}
					}
				},
				showHideDanmuku: function () {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-sendbar .bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-switch > input');
					createMouseoverAndMouseoutEvent('show', controlBtn);
					createMouseoverAndMouseoutEvent('hide', controlBtn);
					setTimeout(function () {
						if (controlBtn !== null) {
							doClick(controlBtn);
							var tipsValue = function () {
								var chooseDanmaku = querySelectorFromIframe('.bilibili-player-video-danmaku-root .bilibili-player-video-danmaku-switch .choose_danmaku');
								if (chooseDanmaku.innerHTML === "关闭弹幕") {
									return "打开弹幕";
								} else {
									return "关闭弹幕";
								}
							};
							shortcut.shortcutsTips("弹幕", tipsValue());
						}
					}, 200);
				},
				videoSpeed: function (type) {
					var video = querySelectorFromIframe('.bilibili-player-video video');
					if (video !== null) {
						var videoSpeed = video.playbackRate;
						var speed = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8, 12, 16];
						switch (type) {
							case 'add':
								var addSpeed = Math.max(...speed);
								if (videoSpeed < addSpeed) {
									for (var i = 0; i < speed.length; i++) {
										if (addSpeed > speed[i] && videoSpeed < speed[i]) {
											addSpeed = speed[i];
										}
									}
									video.playbackRate = addSpeed;
								}
								shortcut.shortcutsTips("播放速度", video.playbackRate + "倍速");
								break;
							case 'sub':
								var subSpeed = Math.min(...speed);
								if (videoSpeed > subSpeed) {
									for (var i = 0; i < speed.length; i++) {
										if (subSpeed < speed[i] && videoSpeed > speed[i]) {
											subSpeed = speed[i];
										}
									}
									video.playbackRate = subSpeed;
								}
								shortcut.shortcutsTips("播放速度", video.playbackRate + "倍速");
								break;
							case 'reset':
								if (videoSpeed != 1) {
									video.playbackRate = 1;
								}
								shortcut.shortcutsTips("播放速度", video.playbackRate + "倍速");
								break;
							default:
								console.log("請不要把奇怪的東西插進來");
								break;
						}
						sessionStorage.setItem("adjustPlayer_videoPlaybackRate", video.playbackRate);
					}
				},
				playerWide: function () {
					var widescreenBtn = querySelectorFromIframe('.bilibili-player-video-btn-widescreen');
					if (widescreenBtn !== null) {
						doClick(widescreenBtn);
					}

					var tipsValue = function () {
						var screenMode = sessionStorage.getItem("adjustPlayer_screenMode");
						if (screenMode === "fullscreen") {
							return "全屏状态下无法使用";
						} else if (screenMode === "widescreen") {
							return "退出宽屏";
						} else {
							return "进入宽屏";
						}
					};
					shortcut.shortcutsTips("宽屏模式", tipsValue());
                    window.scrollTo(0,0);
				},
				fullscreen: function () {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-btn-fullscreen');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function () {
							if (isFullscreen()) {
								return "退出全屏";
							} else {
								return "进入全屏";
							}
						};

						shortcut.shortcutsTips("全屏", tipsValue());
					}
				},
				webfullscreen: function () {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-web-fullscreen');
					if (controlBtn !== null) {
						doClick(controlBtn);

						var tipsValue = function () {
							var screenMode = sessionStorage.getItem("adjustPlayer_screenMode");
							if (screenMode === "webfullscreen") {
								return "退出网页全屏";
							} else {
								return "进入网页全屏";
							}
						};

						shortcut.shortcutsTips("网页全屏", tipsValue());
					}
				},
				gotoPlist: function (type) {
					var video = querySelectorFromIframe('.bilibili-player-video video');
					if (video !== null) {
						var plist, nextPlist, prevPlist, curPage;
						if (matchURL.isVideoAV()) {
							plist = document.querySelector('#multi_page');
							curPage = document.querySelector('#multi_page .cur-list .on');
							if (curPage !== null) {
								nextPlist = curPage.nextElementSibling;
								prevPlist = curPage.previousElementSibling;
							}
						}
						if (type === "prev") {
							if (typeof plist !== 'undefined' && plist !== null) {
								if (matchURL.isVideoAV()) {
									if (prevPlist !== null) {
										prevPlist = prevPlist.querySelector('a[href]');
									} else {
										var prevPaging = document.querySelector('#multi_page .paging .on')
										if (prevPaging !== null) {
											prevPaging = prevPaging.previousElementSibling;
											if (prevPaging !== null) {
												doClick(prevPaging);
												setTimeout(function () {
													var curList = document.querySelector('#multi_page .cur-list li:last-child a[href]');
													doClick(curList);
												}, 200);
												return;
											}
										}
									}
								}
								var readyState = querySelectorFromIframe('.bilibili-player-video-panel').getAttribute('style');
								if (readyState !== null) {
									if (readyState.search("display: none;") !== -1) {
										doClick(prevPlist);
										if (prevPlist === null) {
											shortcut.shortcutsTips("分集切换", "没有上一集了");
										}
									} else {
										return;
									}
								}
							} else {
								shortcut.shortcutsTips("分集切换", "没有上一集了");
							}
						} else if (type === "next") {
							if (typeof plist !== 'undefined' && plist !== null) {
								if (matchURL.isVideoAV()) {
									if (nextPlist !== null) {
										nextPlist = nextPlist.querySelector('a[href]');
									} else {
										var nextPaging = document.querySelector('#multi_page .paging .on');
										if (nextPaging !== null) {
											nextPaging = nextPaging.nextElementSibling;
											if (nextPaging !== null) {
												doClick(nextPaging);
												setTimeout(function () {
													var curList = document.querySelector('#multi_page .cur-list li:first-child a[href]');
													doClick(curList);
												}, 200);
												return;
											}
										}
									}
								}
								var readyState = querySelectorFromIframe('.bilibili-player-video-panel').getAttribute('style');
								if (readyState !== null) {
									if (readyState.search("display: none;") !== -1) {
										doClick(nextPlist);
										if (nextPlist === null) {
											shortcut.shortcutsTips("分集切换", "没有下一集了");
										}
									} else {
										return;
									}
								}
							} else {
								shortcut.shortcutsTips("分集切换", "没有下一集了");
							}
						}
					}
				},
				videoMute: function () {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-btn-volume');
					if (controlBtn !== null) {
						doClick(controlBtn.querySelector('.bilibili-player-iconfont-volume'));

						var tipsValue = function () {
							if (controlBtn.className.search("video-state-volume-min") !== -1) {
								return "静音";
							} else {
								return "恢复静音";
							}
						};

						shortcut.shortcutsTips("静音", tipsValue());
					}
				},
				lightOnOff: function () {
					var isHeimuExist = function () {
						var flag = false;
						if (matchURL.isVideoAV() || matchURL.isWatchlater()) {
							var heimu = document.querySelector('#heimu');
							if (heimu !== null) {
								var heimuStyle = heimu.getAttribute("style");
								if (heimuStyle.search("display: block;") !== -1) {
									flag = true;
								}
							}
						} else {
							var heimu = document.querySelector('#heimu');
							if (heimu !== null) {
								var heimuStyle = heimu.getAttribute("style");
								if (heimuStyle !== null) {
									if (heimuStyle.search("display: block;") !== -1) {
										flag = true;
									}
								}
							}
						}
						return flag;
					};

					var tipsValue = function () {
						if (isHeimuExist()) {
							return "开灯";
						} else {
							return "关灯";
						}
					};

					adjustPlayer.autoLightOn(true, "ONOFF", shortcut.shortcutsTips("开/关灯", tipsValue()));
				},
				loopVideoOnOff: function () {
					var controlBtn = querySelectorFromIframe('.bilibili-player-video-btn-repeat');
					if (controlBtn !== null) {
						doClick(controlBtn);

						setTimeout(function () {
							var controllTooltip = querySelectorFromIframe('div.player-tooltips');
							if (controllTooltip !== null) {
								controllTooltip.style.display = "none";
							}
						}, 200);

						var tipsValue = function () {
							var dataText = controlBtn.querySelector('.bilibili-player-video-btn-repeat span.bilibili-player-iconfont-repeat').getAttribute("data-text");
							if (dataText !== '关闭洗脑循环') {
								return "关闭";
							} else {
								return "开启";
							}
						};
						shortcut.shortcutsTips("循环播放", tipsValue());
					}
				},
				focusPlayer: function () {
					var controlBtn = document.body.getAttribute("adjustPlayerScrollToY");
					if (controlBtn === null) {
						var scrollToY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
						document.body.setAttribute("adjustPlayerScrollToY", scrollToY);

						var setting = window.adjustPlayerSetting;
						var autoFocusOffsetType = setting.autoFocusPlayerOffsetType;
						var autoFocusOffsetValue = setting.autoFocusPlayerOffsetValue;
						adjustPlayer.autoFocusPlayer(true, autoFocusOffsetType, autoFocusOffsetValue, true);
						shortcut.shortcutsTips("定位", "到播放器顶端");

					} else {
						var scrollToY = document.body.getAttribute("adjustPlayerScrollToY");
						unsafeWindow.scrollTo(0, scrollToY);

						shortcut.shortcutsTips("定位", "回到之前位置");
						document.body.removeAttribute("adjustPlayerScrollToY");
					}
				},
				moveToPlayerFocus: function () {
					var videoFocus = querySelectorFromIframe('.bilibili-player-video-control');
					if (videoFocus !== null) {
						doClick(videoFocus);
					}
					shortcut.shortcutsTips("移动", "到播放器焦点");
				},
				focusDanmakuInput: function (e) {
					var controlBtn = querySelectorFromIframe("input.bilibili-player-video-danmaku-input");
					if (controlBtn !== null) {
						var adjustPlayerAutoHideControlBar = querySelectorFromIframe("#adjustPlayerAutoHideSendbar");
						if (adjustPlayerAutoHideControlBar !== null) {
							var playerVideoControl = querySelectorFromIframe(".bilibili-player-video-control-wrap");
							playerVideoControl.style = "opacity: 1; visibility: visible";

							var sendbar = querySelectorFromIframe(".bilibili-player-video-sendbar");
							sendbar.style = "opacity: 1 !important; visibility: visible !important; outline: none;";
							sendbar.setAttribute("tabindex", "-1");

							var sendbarBlurEvent = function (e) {
								controlBtn.focus();
								sendbar.removeEventListener('blur', sendbarBlurEvent, false);
							};
							var danmakuInputKeydownEvent = function (e) {
								if (e.keyCode == 9) {
									querySelectorFromIframe('.bilibili-player-video video').focus();
									querySelectorFromIframe(".bilibili-player-video-sendbar").style = "opacity: 1;";
									querySelectorFromIframe(".bilibili-player-video-control-wrap").style = "";
									e.preventDefault();
									controlBtn.removeEventListener('keydown', danmakuInputKeydownEvent, false);
								}
							};
							sendbar.addEventListener("blur", sendbarBlurEvent, false);
							controlBtn.addEventListener("keydown", danmakuInputKeydownEvent, false);
						}
						e.preventDefault();

						setTimeout(function () {
							controlBtn.focus();
						}, 200);

						shortcut.shortcutsTips("定位", "到弹幕框焦点");
					}
				},
				shortcutsTips: function (type, value) {
					try {
						var timeoutID;
						clearTimeout(this.timeoutID);

						var tips = querySelectorFromIframe('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap > #adjust-player-shortcuts-tips');
						if (tips === null) {
							var tipsElement = document.createElement('div');
							tipsElement.id = "adjust-player-shortcuts-tips";
							tipsElement.style = "display: block; width:auto; opacity: 0;";
							tipsElement.className = "bilibili-player-volumeHint";
							tipsElement.innerHTML = type + ":" + value;
							querySelectorFromIframe('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap ').appendChild(tipsElement);
							tipsElement.style = "display: block; width:auto; opacity: 1; margin-left:-" + (tipsElement.offsetWidth / 2) + "px";
						} else {
							tips.innerHTML = type + ":" + value;
							tips.style = "display: block; width:auto; opacity: 1; margin-left:-" + (tips.offsetWidth / 2) + "px";
						}

						this.timeoutID = setTimeout(function () {
							var adjustPlayerShortcutsTips = querySelectorFromIframe('#bilibiliPlayer > .bilibili-player-area > .bilibili-player-video-wrap > #adjust-player-shortcuts-tips');
							if (adjustPlayerShortcutsTips !== null) {
								adjustPlayerShortcutsTips.style = "display: block;width:auto;opacity: 0;";
							}
						}, 1000);
					} catch (e) {
						console.log('shortcutsTips：' + e);
					}
				},
				shortcutsEvent: function (type, kCode, event) {
					if (typeof kCode === 'undefined' || kCode === "" || kCode === null) {
						return;
					}

					var isCombinationKey = function () {
						var keys = kCode.split("+");
						if (keys.length > 1) {
							keys[1] = parseInt(keys[1]);
							return {
								CombinationKey: true,
								keys: keys
							};
						} else {
							return {
								CombinationKey: false,
								keys: parseInt(kCode)
							};
						}
					};

					var executeEvent = function () {
						switch (type) {
							case "playPause":
								shortcut.playPause();
								break;
							case "prevVideoFramerate":
								shortcut.videoFramerate("prev");
								break;
							case "nextVideoFramerate":
								shortcut.videoFramerate("next");
								break;
							case "showHideDanmuku":
								shortcut.showHideDanmuku();
								break;
							case "addVideoSpeed":
								shortcut.videoSpeed("add");
								break;
							case "subVideoSpeed":
								shortcut.videoSpeed("sub");
								break;
							case "resetVideoSpeed":
								shortcut.videoSpeed("reset");
								break;
							case "playerWide":
								shortcut.playerWide();
								break;
							case "fullscreen":
								shortcut.fullscreen();
								break;
							case "webfullscreen":
								shortcut.webfullscreen();
								break;
							case "prevPlist":
								shortcut.gotoPlist("prev");
								break;
							case "nextPlist":
								shortcut.gotoPlist("next");
								break;
							case "videoMute":
								shortcut.videoMute();
								break;
							case "lightOnOff":
								shortcut.lightOnOff();
								break;
							case "loopVideoOnOff":
								shortcut.loopVideoOnOff();
								break;
							case "focusPlayer":
								shortcut.focusPlayer();
								break;
							case "moveToPlayerFocus":
								shortcut.moveToPlayerFocus();
								break;
							case "focusDanmakuInput":
								shortcut.focusDanmakuInput(event);
								break;
							default:
								break;
						}
					};

					var k = isCombinationKey(kCode);
					if (k.CombinationKey) {
						if (event.ctrlKey || event.altKey || event.shiftKey) {
							if (k.keys[0] === "shift") {
								if (event.shiftKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							} else if (k.keys[0] === "ctrl") {
								if (event.ctrlKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							} else if (k.keys[0] === "alt") {
								if (event.altKey && event.keyCode === k.keys[1]) {
									executeEvent(type);
									return;
								}
							}
						}
					} else {
						if (event.ctrlKey || event.altKey || event.shiftKey) {
							return;
						} else {
							if (event.keyCode === k.keys) {
								executeEvent(type);
								return;
							}
						}
					}
				},
				init: function (set) {
					if (typeof set !== 'undefined') {
						try {
							if (typeof set.shortcutsHideTips !== 'undefined') {
								var css = [
									'#adjust-player-shortcuts-tips{display: none!important;}'
								];
								//console.log(resizableElementWidth + "\n" + resizableElementHeight);
								var node = document.createElement('style');
								node.type = 'text/css';
								node.id = 'showTips';
								node.appendChild(document.createTextNode(css.join('')));
								var showTipsCSS = document.querySelector("#showTips");
								if (showTipsCSS !== null) {
									showTipsCSS.remove();
								}
								node.appendChild(document.createTextNode(css.join('')));
								document.documentElement.appendChild(node);
							}
							if (set.shortcutsSwitch !== true) {
								return;
							}

							var shortcutsEventObj = {};
							for (var prop in set) {
								if (set.hasOwnProperty(prop)) {
									var KeyCode = prop.indexOf('KeyCode');
									if (KeyCode !== -1) {
										shortcutsEventObj[set[prop]] = prop.replace(/KeyCode/gi, '');
									}
								}
							}

							function bindEvent(event) {
								//console.log(event.target.classList);
								if (event.target.nodeName === "INPUT") {
									return;
								}
								if (event.target.nodeName === "TEXTAREA") {
									return;
								}
								if (event.target.classList.contains('ql-editor')) {
									return;
								}

								var focused = document.activeElement;
								if (focused.nodeName === "IFRAME") {
									window.top.focus();
								}

								if (set.shortcutsVolumeSeekingGlobal === true) {
									//arrowKeys
									if (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) {
										//event.stopPropagation();
										var videoFocus = function () {
											var videoControl = querySelectorFromIframe('.bilibili-player-video-control');
											if (videoControl !== null) {
												doClick(videoControl);
											}
										};
										videoFocus();
									}
								}

								if (event.shiftKey) {
									var shiftEventName = shortcutsEventObj['shift+' + event.keyCode];
									if (typeof shiftEventName !== 'undefined') {
										shiftEventName = shiftEventName.replace(/shift\+/gi, '');
										if (set[shiftEventName] === true) {
											shortcut.shortcutsEvent(shiftEventName, set[shiftEventName + 'KeyCode'], event);
											return;
										}
									}
								}
								if (event.ctrlKey) {
									var ctrlEventName = shortcutsEventObj['ctrl+' + event.keyCode];
									if (typeof ctrlEventName !== 'undefined') {
										ctrlEventName = ctrlEventName.replace(/ctrl\+/gi, '');
										if (set[ctrlEventName] === true) {
											shortcut.shortcutsEvent(ctrlEventName, set[ctrlEventName + 'KeyCode'], event);
											return;
										}
									}
								}
								if (event.altKey) {
									var altEventName = shortcutsEventObj['alt+' + event.keyCode];
									if (typeof altEventName !== 'undefined') {
										altEventName = altEventName.replace(/alt\+/gi, '');
										if (set[altEventName] === true) {
											shortcut.shortcutsEvent(altEventName, set[altEventName + 'KeyCode'], event);
											return;
										}
									}
								}

								var eventName = shortcutsEventObj[event.keyCode];
								if (typeof eventName !== 'undefined') {
									if (set[eventName] === true) {
										shortcut.shortcutsEvent(eventName, set[eventName + 'KeyCode'], event);
										return;
									}
								}
							}

							var iframe = document.querySelector('iframe.bilibiliHtml5Player');
							if (iframe !== null) {
								iframe.contentWindow.document.addEventListener("keydown", bindEvent, false);
							}
							document.addEventListener("keydown", bindEvent, false);
						} catch (e) {
							console.log('shortcuts：' + e);
						}
					}
				}
			};
			shortcut.init(set);
		},
		adjust: function (setting, isReload) {
			var video = querySelectorFromIframe('.bilibili-player-video video');
			//给老版本初始化“双击全屏延时”的默认值
			if (setting.doubleClickFullScreen === true && typeof setting.doubleClickFullScreenDelayed === 'undefined') {
				adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen, 0);
			} else {
				adjustPlayer.doubleClickFullScreen(setting.doubleClickFullScreen, setting.doubleClickFullScreenDelayed);
			}
			//初始化“迷你播放器尺寸”的默认值
			if (setting.resizePlayer === true && typeof setting.resizeMiniPlayer === 'undefined') {
				adjustPlayer.resizeMiniPlayer(true, 320);
			} else {
				adjustPlayer.resizeMiniPlayer(setting.resizeMiniPlayer, setting.resizeMiniPlayerSize, setting.resizeMiniPlayerSizeResizable);
			}
			//修复没开启“自动宽屏模式”自动关灯失效
			setTimeout(function () {
				adjustPlayer.autoLightOn(setting.autoLightOn);
			}, 200);

			//adjustPlayer.autoLoopVideo(setting.autoLoopVideo);
			adjustPlayer.tabDanmulist(setting.tabDanmulist);
			adjustPlayer.videoSeekingShowSendbar(setting.videoSeekingShowSendbar, video);
			adjustPlayer.autoHideSendbar(setting.autoHideSendbar, setting.shortcuts.focusDanmakuInput, video);
			adjustPlayer.autoPlay(setting.autoPlay, video);
			adjustPlayer.autoVideoSpeed(setting.autoVideoSpeed, setting.autoVideoSpeedValue, video);
			adjustPlayer.skipSetTime(setting.skipSetTime, setting.skipSetTimeValue, video);
			adjustPlayer.autoNextPlist(setting.autoNextPlist);
			adjustPlayer.startFromHistory(setting.startFromHistory);
			adjustPlayer.hideDanmuku(setting.hideDanmuku, setting.hideDanmukuType);
			adjustPlayer.hideDanmukuFilterType(setting.hideDanmukuFilterType, setting.hideDanmukuFilterType_Type);
			adjustPlayer.danmukuPreventShade(setting.danmukuPreventShade, setting.danmukuPreventShadeType);

			if (isReload) {
				var screenMode = sessionStorage.getItem("adjustPlayer_screenMode");
				setTimeout(function () {
					console.log(screenMode)
					if (screenMode === 'widescreen') {
						adjustPlayer.fixWidescreenFocusPlayer(setting, isReload, adjustPlayer.autoWidescreen);
						adjustPlayer.autoFocusPlayer(setting.autoFocusPlayer, setting.autoFocusPlayerOffsetType, setting.autoFocusPlayerOffsetValue);
					} else if (screenMode === 'webfullscreen') {
						adjustPlayer.autoWebFullScreen(true);
					} else if (screenMode === 'normal') {
						adjustPlayer.autoFocusPlayer(setting.autoFocusPlayer, setting.autoFocusPlayerOffsetType, setting.autoFocusPlayerOffsetValue);
					}
					adjustPlayer.resizePlayer(setting.resizePlayer, setting.resizePlayerWidth, setting.resizePlayerRatio, setting.resizePlayerVideoInfoAndUpInfoPosition, setting.autoHideSendbar);
				}, 800);
			} else {
				if (setting.autoWebFullScreen === true) {
					adjustPlayer.autoWebFullScreen(setting.autoWebFullScreen);
				} else {
					//开启“网页全屏”后，不加载的功能
					adjustPlayer.fixWidescreenFocusPlayer(setting, isReload, adjustPlayer.autoWidescreen);
					adjustPlayer.autoFocusPlayer(setting.autoFocusPlayer, setting.autoFocusPlayerOffsetType, setting.autoFocusPlayerOffsetValue);
					adjustPlayer.resizePlayer(setting.resizePlayer, setting.resizePlayerWidth, setting.resizePlayerRatio, setting.resizePlayerVideoInfoAndUpInfoPosition, setting.autoHideSendbar);
				}
				adjustPlayer.shortcuts(setting.shortcuts);
			}
		},
		init: function (firstrun, setting) {
			unsafeWindow.adjustPlayerTest = true;
			window.adjustPlayerSetting = setting;
			//修复后台打开视频页面脚本加载失效
			var documentState = document.visibilityState;
			if (documentState === "visible") {
				//初始化
				console.log('adjustPlayer(ver.stardust):\n' + 'loadPage:' + location.href);
				//显示帮助提示
				var isFirstrun = function () {
					if (firstrun) {
						config.setValue('player_firstrun', false);
						configWindow.help();
					}
				};
				//总计时器
				var timerCount = 0;
				var timer = window.setInterval(function callback() {
					var player = isPlayer();
					if (player === "flashPlayer") {
						configWindow.help();
						clearInterval(timer);
					} else if (player === "html5Player") {

						var trynewBtn = document.querySelector('.trynew-btn');
						var bangumiTrynewBtn = document.querySelector('.new-entry');
						if (trynewBtn !== null || bangumiTrynewBtn !== null) {
							clearInterval(timer);
							console.log('adjustPlayer(ver.stardust):\n旧版播放器页面不支持\n');
							return;
						}

						var readyState = querySelectorFromIframe('.bilibili-player-video-panel');
						var video = querySelectorFromIframe('.bilibili-player-video video');
						var sendbar = querySelectorFromIframe('.bilibili-player-video-sendbar');
						var isReload = false;
						if (video !== null && readyState !== null && sendbar.childNodes.length !== 0) {
							if (readyState.getAttribute('style') !== null && readyState.getAttribute('style').search("display: none;") !== -1) {
								try {
									createConfigBtn();
									isFirstrun();
									adjustPlayer.adjust(setting, isReload);
									reloadPList.init();
									console.log('adjustPlayer(ver.stardust):\nhtml5Player init success');
								} catch (e) {
									clearInterval(timer);
									console.log('adjustPlayer(ver.stardust):\nhtml5Player init error\n' + e);
								} finally {
									reloadPList.getScreenMode();
									clearInterval(timer);
								}
							}
						} else {
							//console.log(timerCount);
							timerCount++;
							if (timerCount >= 120) {
								timerCount = 0;
								clearInterval(timer);
								console.log('adjustPlayer(ver.stardust):\n html5Player init error: not find video');
							}
						}
					} else {
						//console.log(timerCount);
						timerCount++;
						if (timerCount >= 120) {
							timerCount = 0;
							clearInterval(timer);
							console.log('adjustPlayer(ver.stardust):\n html5Player init error: timeout');
						}
					}
				}, 800);
			} else if (documentState === "hidden") {
				//修复后台打开视频页面脚本加载失效
				var hidden, visibilityChange;
				if (typeof document.hidden !== "undefined") {
					hidden = "hidden";
					visibilityChange = "visibilitychange";
				} else if (typeof document.msHidden !== "undefined") {
					hidden = "msHidden";
					visibilityChange = "msvisibilitychange";
				} else if (typeof document.webkitHidden !== "undefined") {
					hidden = "webkitHidden";
					visibilityChange = "webkitvisibilitychange";
				}

				function visibilitychangeEvent() {
					if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
						console.log("adjustPlayer:\n nonsupport the Page Visibility API.");
					} else {
						if (document.visibilityState === "visible") {
							init();
							document.removeEventListener(visibilityChange, visibilitychangeEvent, false);
						}
					}
				}
				document.addEventListener(visibilityChange, visibilitychangeEvent, false);
			} else {
				console.log("adjustPlayer:\n nonsupport the Page Visibility API.");
			}
		},
		reload: function (setting) {
			//多P页面重加载
			console.log('adjustPlayer(ver.stardust):\n' + 'reloadPage:' + location.href);
			//总计时器
			var timerCount = 0;
			var timer = window.setInterval(function callback() {
				var player = isPlayer();
				if (player === "flashPlayer") {
					try {
						setTimeout(function () {
							createConfigBtn();
							configWindow.help();
						}, 1000);
						console.log('adjustPlayer(ver.stardust):\nflashPlayer init success');
					} catch (e) {
						clearInterval(timer);
						console.log('adjustPlayer(ver.stardust):\nflashPlayer init error\n' + e);
					} finally {
						clearInterval(timer);
					}
				} else if (player === "html5Player") {
					var readyState = querySelectorFromIframe('.bilibili-player-video-panel');
					var video = querySelectorFromIframe('.bilibili-player-video video');
					var sendbar = querySelectorFromIframe('.bilibili-player-video-sendbar');
					var isReload = true;
					if (video !== null && readyState !== null && sendbar.childNodes.length !== 0) {
						if (readyState.getAttribute('style') !== null && readyState.getAttribute('style').search("display: none;") !== -1) {
							try {
								createConfigBtn();
								adjustPlayer.adjust(setting, isReload);
								reloadPList.init();
								console.log('adjustPlayer(ver.stardust):\nhtml5Player reload success');
							} catch (e) {
								clearInterval(timer);
								console.log('adjustPlayer(ver.stardust):\nhtml5Player reload error\n' + e);
							} finally {
								reloadPList.getScreenMode();
								clearInterval(timer);
							}
						}
					} else {
						//console.log(timerCount);
						timerCount++;
						if (timerCount >= 120) {
							timerCount = 0;
							clearInterval(timer);
							console.log('adjustPlayer(ver.stardust):\n html5Player reload error: not find video');
						}
					}
				} else {
					//console.log(timerCount);
					timerCount++;
					if (timerCount >= 120) {
						timerCount = 0;
						clearInterval(timer);
						console.log('adjustPlayer(ver.stardust):\n html5Player reload error: timeout');
					}
				}
			}, 800);
		}
	};
	var reloadPList = {
		getPListId: function (href) {
			var id;
			if (typeof href !== 'undefined') {
				id = href.match(/p=\d*/g) || href.match(/#page=\d*/g) || href.match(/ep\d*/g) || href.match(/ss\d*#\d*/g) || href.match(/watchlater\/#\/av\d*\/p\d*/g) || href.match(/av\d*/g);
				if (id !== null) {
					id = id[0].replace(/\D/g, '');
				} else {
					id = '';
				}
			}
			return id;
		},
		getScreenMode: function () {
			var player = isPlayer();
			if (player === "html5Player") {
				var screenMode = 'normal';
				var player = querySelectorFromIframe('#bilibiliPlayer').getAttribute("class");
				if (player !== null) {
					if (player.search("mode-widescreen") !== -1) {
						screenMode = 'widescreen';
					} else if (player.search("mode-webfullscreen") !== -1) {
						screenMode = 'webfullscreen';
					} else if (player.search("mode-fullscreen") !== -1) {
						screenMode = 'fullscreen';
					} else {
						screenMode = 'normal';
					}
				}
				sessionStorage.setItem("adjustPlayer_screenMode", screenMode);
			}
		},
		init: function () {
			(function (history) {
				var pushState = history.pushState;
				history.pushState = function (state) {
					if (typeof history.onpushstate == "function") {
						history.onpushstate({
							state: state
						});
					}
					return pushState.apply(history, arguments);
				};
			})(window.history);

			var pListId = reloadPList.getPListId(location.href);
			window.adjustPlayerCurrentPListId = pListId;

			window.onpopstate = history.onpushstate = function (e) {
				var isReload = false;
				var reloadTimer = null;
				clearTimeout(this.reloadTimer);
				this.reloadTimer = window.setTimeout(function () {
					if (isReload === false) {
						var newPlistId, oldPListId;
						newPlistId = reloadPList.getPListId(location.href);
						oldPListId = window.adjustPlayerCurrentPListId;
						if (newPlistId !== oldPListId) {
							console.log('reloadPList:\nnewPlistId:' + newPlistId + "\noldPListId:" + oldPListId);
							isReload = true;
							if (typeof GM_getValue === 'function') {
								var setting = config.read();
								adjustPlayer.reload(setting);
							} else {
								var setting = config.read();
								setting.then(function (value) {
									adjustPlayer.reload(value);
								});
							}
						} else {
							reloadPList.getScreenMode();
						}
					} else {
						return;
					}
				}, 200);
			}
		}
	};
	var config = {
		storageType: function () {
			if (window.localStorage) {
				var type = localStorage.getItem('adjustPlayer_storageType');
				if (type === "localStorage") {
					return "localStorage";
				} else if (type === null || type === "extension") {
					return "extension";
				} else {
					return "unknown";
				}
			} else {
				console.log("adjustPlayer:获取设置失败，不支持localStorage");
			}
		},
		getValue: function (value, defalutValue) {
			var storageType = config.storageType();
			if (storageType === "localStorage") {
				var item;
				if (typeof defalutValue !== "undefined" && item === null) {
					item = localStorage.getItem('adjustPlayer_localStorage_' + value);
					localStorage.setItem('adjustPlayer_localStorage_' + value, defalutValue);
				} else {
					item = localStorage.getItem('adjustPlayer_localStorage_' + value);
				}
				item = JSON.parse(item);
				return item;
			} else if (storageType === "extension") {
				if (typeof GM_getValue === 'function') {
					var item;
					if (typeof defalutValue !== 'undefined') {
						item = GM_getValue(value, defalutValue);
					} else {
						item = GM_getValue(value);
					}
					return item;
				} else {
					if (typeof defalutValue !== 'undefined') {
						return GM.getValue(value, defalutValue);
					} else {
						return GM.getValue(value);
					}
				}
			} else {
				console.log("adjustPlayer:读取" + value + "失败，未知存储类型");
				item = null;
				return item;
			}
		},
		setValue: function (name, value) {
			var storageType = config.storageType();
			if (storageType === "localStorage") {
				value = JSON.stringify(value);
				localStorage.setItem('adjustPlayer_localStorage_' + name, value);
			} else if (storageType === "extension") {
				if (typeof GM_getValue === 'function') {
					GM_setValue(name, value);
				} else {
					GM.setValue(name, value);
				}
			} else {
				console.log("adjustPlayer:设置" + value + "失败，未知存储类型");
			}
		},
		read: function () {
			if (typeof GM_getValue === 'function') {
				var adjustPlayerSetting = config.getValue('player_adjustPlayer');
				if (typeof adjustPlayerSetting !== "undefined" && adjustPlayerSetting !== null) {
					return adjustPlayerSetting;
				} else {
					var defaultConfig = config.restore();
					if (defaultConfig !== null) {
						return defaultConfig;
					} else {
						console.log("adjustPlayer:读取设置失败");
					}
				}
			} else {
				return new Promise(function (resolve, reject) {
					var adjustPlayerSetting = config.getValue('player_adjustPlayer');
					adjustPlayerSetting.then(function (value) {
						if (typeof value !== "undefined" && value !== null) {
							resolve(value);
						} else {
							var defaultConfig = config.restore();
							defaultConfig.then(function (value) {
								if (value !== null) {
									resolve(value);
								} else {
									console.log("adjustPlayer:读取设置失败");
								}
							});
						}
					});
				});
			}
		},
		write: function (adjustPlayer) {
			config.setValue('player_adjustPlayer', adjustPlayer);
		},
		restore: function () {
			var defalutConfig = '{ "shortcuts": {} }';
			config.setValue('player_adjustPlayer', JSON.parse(defalutConfig));
			config.setValue('player_firstrun', true);
			if (typeof GM_getValue === 'function') {
				var item = config.getValue('player_adjustPlayer');
				return item;
			} else {
				return new Promise(function (resolve, reject) {
					var item = config.getValue('player_adjustPlayer');
					item.then(function (value) {
						resolve(value);
					});
				});
			}
		}
	};
	var dialog = {
		create: function (name, title, bar, content, isModal) {
			var isExist = document.querySelector('#adjust-player > #' + name);
			if (isExist === null) {
				var dialogElement = document.createElement('div');
				dialogElement.id = name;
				dialogElement.className = 'dialog';
				dialogElement.innerHTML = '<div class="title">' + title + '' + bar + '</div>' + content;
				if (isModal != null) {
					dialogElement.setAttribute("isModal", "true");
					dialogElement.setAttribute("modalParentId", isModal.getAttribute("id"));
					isModal.classList.add("modalWindow");
				}
				document.querySelector('#adjust-player').appendChild(dialogElement);
				dialog.eventBinding(dialogElement, name);
				//mask
				document.querySelector('#adjust-player .adjust-player-mask').setAttribute("style", "display: block;");
			}
		},
		close: function (element) {
			if (element.getAttribute('isModal') === "true") {
				var modalParent = document.querySelector('#' + element.getAttribute('modalParentId') + '');
				if (modalParent !== null) {
					modalParent.classList.remove("modalWindow");
				}
			}
			document.querySelector('#adjust-player').removeChild(element);
			//mask
			var adjustPlayer = document.querySelectorAll('#adjust-player > div.dialog').length;
			if (adjustPlayer < 1) {
				document.querySelector('#adjust-player .adjust-player-mask').removeAttribute("style");
			}
		},
		eventBinding: function (element, name) {
			element.addEventListener('mouseover', function (e) {
				var adjustPlayerTooltip = document.querySelector('#adjust-player-tooltip');
				var tooltip = e.target.getAttribute('tooltip');
				if (e.target && tooltip !== null) {
					var left = e.clientX;
					var top = e.clientY;
					if (adjustPlayerTooltip === null) {
						var tooltipElement = document.createElement('div');
						tooltipElement.id = "adjust-player-tooltip";
						tooltipElement.style = 'left: ' + left + 'px;top: ' + top + 'px;margin:10px 0 0 -80px;color: #222;font-size:12px;line-height: 16px;text-align: left;display: block;position: fixed;background: #fff;border-radius: 4px;box-shadow: 0px 0px 1px 0px;width: 200px;overflow-wrap: break-word;padding: 4px;z-index: 999999;';
						tooltipElement.innerHTML = tooltip.replace(/\n/g, "<br/>");
						document.querySelector('#adjust-player').appendChild(tooltipElement);
					} else {
						adjustPlayerTooltip.style = 'left: ' + left + 'px;top: ' + top + 'px;margin:10px 0 0 -80px;color: #222;font-size:12px;line-height: 16px;text-align: left;display: block;position: fixed;background: #fff;border-radius: 4px;box-shadow: 0px 0px 1px 0px;width: 200px;overflow-wrap: break-word;padding: 4px;z-index: 999999;';
						adjustPlayerTooltip.innerHTML = tooltip.replace(/\n/g, "<br/>");
					}
				} else {
					if (adjustPlayerTooltip !== null) {
						adjustPlayerTooltip.style = '';
						adjustPlayerTooltip.innerHTML = '';
					}
				}
			});
			element.addEventListener('click', function (e) {
				var action = e.target.getAttribute('action');
				if (e.target && action !== null) {
					if (name === "main") {
						switch (action) {
							case 'shortcuts':
								configWindow.shortcutsWindow(e);
								break;
							case 'adjustPlayerSize':
								configWindow.adjustPlayerSize();
								break;
							case 'restoreDef':
								configWindow.restore();
								break;
							case 'save':
								configWindow.save();
								break;
							case 'childElementDisabledEvent':
								configWindow.childElementDisabledEvent(e.target.getAttribute("name"), e.target.getAttribute("disabledchildelement"));
								break;
							case 'storageType':
								configWindow.storageTypeWindow(e);
								break;
							default:
								break;
						}
					} else if (name === "shortcutsSetting") {
						switch (action) {
							case 'clear':
								configWindow.shortcutsSettingClear();
								break;
							case 'save':
								configWindow.shortcutsSettingSave();
								break;
							case 'cancel':
								configWindow.shortcutsSettingCancel();
								break;
							default:
								break;
						}
					} else if (name === "storageType") {
						switch (action) {
							case 'save':
								configWindow.storageTypeSave();
								break;
							case 'cancel':
								dialog.close(this);
								break;
							default:
								break;
						}
					}
					switch (action) {
						case 'help':
							configWindow.help();
							break;
						case 'close':
							dialog.close(this);
							break;
						default:
							break;
					}
				}
			});
		}
	};
	var configWindow = {
		create: function () {
			var name = 'main';
			var title = '哔哩哔哩播放器调整';
			var bar = '<span class="btn" action="help">?</span><span class="btn" action="close">X</span>';
			var content = commentToString(function () {
				/*
         <form>
            <div class="wrapper">
            	<div class="left">
            		<fieldset class="shortcutsGroup">
            			<legend><label>快捷键</label></legend>
            			<div class="block">
            				<label>
            					<input name="shortcutsSwitch" type="checkbox" list="shortcuts" action="childElementDisabledEvent" disabledChildElement="div,shortcutsItem" ><span class="checkbox"></span>启用快捷键功能<span tooltip="使用帮助：&#10;1：快捷键的总开关，开启后“快捷键功能”才会生效" class="tipsButton">[?]</span>
            				</label>
            				<div class="shortcutsItem">
            					<label><input name="shortcutsVolumeSeekingGlobal" type="checkbox" list="shortcuts" ><span class="checkbox"></span>修改音量/快进退为全局<span tooltip="使用帮助：&#10;1：修改默认的快捷键行为，不用把当前焦点定位到播放器上也能生效。" class="tipsButton">[?]</span></label>
            					<label><input name="shortcutsHideTips" type="checkbox" list="shortcuts" ><span class="checkbox"></span>隐藏快捷键提示语</label>
            					<label>
            						<input name="playPause" type="checkbox" list="shortcuts"><span class="checkbox"></span>播放/暂停视频 <span class="tipsButton" action="shortcuts" typeName="playPause">[设置]</span>
            						<input type="text" name="playPauseKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="playPauseKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="showHideDanmuku" type="checkbox" list="shortcuts"><span class="checkbox"></span>显示/隐藏弹幕 <span class="tipsButton" action="shortcuts" typeName="showHideDanmuku">[设置]</span>
            						<input type="text" name="showHideDanmukuKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="showHideDanmukuKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="playerWide" type="checkbox" list="shortcuts"><span class="checkbox"></span>宽屏模式 <span class="tipsButton" action="shortcuts" typeName="playerWide">[设置]</span>
            						<input type="text" name="playerWideKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="playerWideKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="fullscreen" type="checkbox" list="shortcuts"><span class="checkbox"></span>全屏模式 <span class="tipsButton" action="shortcuts" typeName="fullscreen">[设置]</span>
            						<input type="text" name="fullscreenKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="fullscreenKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="webfullscreen" type="checkbox" list="shortcuts"><span class="checkbox"></span>网页全屏模式 <span class="tipsButton" action="shortcuts" typeName="webfullscreen">[设置]</span>
            						<input type="text" name="webfullscreenKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="webfullscreenKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="videoMute" type="checkbox" list="shortcuts"><span class="checkbox"></span>静音/恢复静音  <span class="tipsButton" action="shortcuts" typeName="videoMute">[设置]</span>
            						<input type="text" name="videoMuteKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="videoMuteKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="lightOnOff" type="checkbox" list="shortcuts"><span class="checkbox"></span>播放器关灯/开灯  <span class="tipsButton" action="shortcuts" typeName="lightOnOff">[设置]</span>
            						<input type="text" name="lightOnOffKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="lightOnOffKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
									<del>
            						<input name="loopVideoOnOff" type="checkbox" list="shortcuts" disabled><span class="checkbox"></span>循环播放  <span class="tipsButton" action="shortcuts" typeName="loopVideoOnOff">[设置]</span>
            						<input type="text" name="loopVideoOnOffKeyName" readOnly="true" list="shortcuts">
									<input type="hidden" name="loopVideoOnOffKeyCode" list="shortcuts" KeyCode="true">
									</del>
            					</label>
								<label>
            						<input name="focusPlayer" type="checkbox" list="shortcuts"><span class="checkbox"></span>定位到播放器<span tooltip="使用帮助：&#10;1：具体位置根据“功能调整” - “自动定位到XXX顶端” 设置的值来定位&#10（没设置“功能调整” - “自动定位到XXX顶端”功能的话，默认定位到播放器顶端）&#10;2：按下后会在“播放器位置”，和“之前浏览的位置”进行切换" class="tipsButton">[?]</span>
									<span class="tipsButton" action="shortcuts" typeName="focusPlayer">[设置]</span>
            						<input type="text" name="focusPlayerKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="focusPlayerKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="focusDanmakuInput" type="checkbox" list="shortcuts"><span class="checkbox"></span>定位到弹幕框<span tooltip="使用帮助：&#10;1：焦点在弹幕框时键盘按 Tab 键隐藏弹幕框&#10;2：开启了“自动隐藏弹幕栏”并设置了“定位到弹幕框的快捷键”之后，请用快捷键来显示弹幕框" class="tipsButton">[?]</span>
									<span class="tipsButton" action="shortcuts" typeName="focusDanmakuInput">[设置]</span>
            						<input type="text" name="focusDanmakuInputKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="focusDanmakuInputKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="moveToPlayerFocus" type="checkbox" list="shortcuts"><span class="checkbox"></span>焦点移到播放器
									<span class="tipsButton" action="shortcuts" typeName="moveToPlayerFocus">[设置]</span>
            						<input type="text" name="moveToPlayerFocusKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="moveToPlayerFocusKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="addVideoSpeed" type="checkbox" list="shortcuts"><span class="checkbox"></span>增加播放速度 <span class="tipsButton" action="shortcuts" typeName="addVideoSpeed">[设置]</span>
            						<input type="text" name="addVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="addVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="subVideoSpeed" type="checkbox" list="shortcuts"><span class="checkbox"></span>减少播放速度 <span class="tipsButton" action="shortcuts" typeName="subVideoSpeed">[设置]</span>
            						<input type="text" name="subVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="subVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="resetVideoSpeed" type="checkbox" list="shortcuts"><span class="checkbox"></span>重置播放速度 <span class="tipsButton" action="shortcuts" typeName="resetVideoSpeed">[设置]</span>
            						<input type="text" name="resetVideoSpeedKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="resetVideoSpeedKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="prevPlist" type="checkbox" list="shortcuts"><span class="checkbox"></span>上一个视频  <span class="tipsButton" action="shortcuts" typeName="prevPlist">[设置]</span>
            						<input type="text" name="prevPlistKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="prevPlistKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="nextPlist" type="checkbox" list="shortcuts"><span class="checkbox"></span>下一个视频 <span class="tipsButton" action="shortcuts" typeName="nextPlist">[设置]</span>
            						<input type="text" name="nextPlistKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="nextPlistKeyCode" list="shortcuts" KeyCode="true">
            					</label>
								<label>
            						<input name="prevVideoFramerate" type="checkbox" list="shortcuts"><span class="checkbox"></span>快退一帧  <span class="tipsButton" action="shortcuts" typeName="prevVideoFramerate">[设置]</span>
            						<input type="text" name="prevVideoFramerateKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="prevVideoFramerateKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            					<label>
            						<input name="nextVideoFramerate" type="checkbox" list="shortcuts"><span class="checkbox"></span>快进一帧 <span class="tipsButton" action="shortcuts" typeName="nextVideoFramerate">[设置]</span>
            						<input type="text" name="nextVideoFramerateKeyName" readOnly="true" list="shortcuts">
            						<input type="hidden" name="nextVideoFramerateKeyCode" list="shortcuts" KeyCode="true">
            					</label>
            				</div>
            			</div>
            		</fieldset>
            		<fieldset class="danmukuGroup">
            			<legend><label>弹幕</label></legend>
            			<div class="block">
            				<label fname="hideDanmuku">
            					<input name="hideDanmuku" type="checkbox"><span class="checkbox"></span>默认隐藏
            					<select name="hideDanmukuType">
            						<option value="all" selected="selected">所有</option>
            						<option value="bangumi">番剧</option>
            					</select>弹幕<span tooltip="使用帮助：&#10;1：选择默认隐藏“番剧”弹幕时，只隐藏 bangumi.bilibili.com 域名，www.bilibili.com/bangumi/play/ep 下视频的弹幕" class="tipsButton">[?]</span>
            				</label>
            				<label fname="hideDanmukuFilterType">
            					<input name="hideDanmukuFilterType" type="checkbox"><span class="checkbox"></span>默认隐藏
            					<select name="hideDanmukuFilterType_Type">
            						<option value="top">顶端</option>
            						<option value="bottom">底端</option>
									<option value="topAndbottom" selected="selected">顶端+底端</option>
									<option value="scroll">滚动</option>
            					</select>弹幕
            				</label>
							<label fname="danmukuPreventShade">
								<input name="danmukuPreventShade" type="checkbox"><span class="checkbox"></span>默认
								<select name="danmukuPreventShadeType">
            						<option value="on" selected="selected">开启</option>
            						<option value="off">关闭</option>
            					</select>防挡弹幕<span tooltip="使用帮助：&#10;1：“番剧”页面和普通页面的“防挡弹幕”默认设置竟然不一样？开启后设置让它一致 " class="tipsButton">[?]</span>
							</label>
							<label fname="tabDanmulist"><input name="tabDanmulist" type="checkbox"><span class="checkbox"></span>默认展开弹幕列表</label>
            		</div>
            	</fieldset>
            </div>
            <div class="right">
            	<fieldset class="modeGroup">
            		<legend><label>播放模式</label></legend>
            		<div class="block">
						<label fname="autoWidescreen" class="multiLine">
							<input name="autoWidescreen" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,autoWidescreenFullscreen" ><span class="checkbox"></span>自动宽屏
							<div class="newLine">退出全屏后
								<select name="autoWidescreenFullscreen" disabled="">
            						<option value="off" selected="selected">关闭</option>
            						<option value="on">开启</option>
            					</select>自动宽屏
								<span tooltip="使用帮助：&#10;1：开启“自动宽屏”功能后，退出全屏后是否开启宽屏" class="tipsButton">[?]</span>
							</div>
						</label>
            			<label fname="autoWebFullScreen"><input name="autoWebFullScreen" type="checkbox"><span class="checkbox"></span>自动网页全屏<span tooltip="使用帮助：&#10;1：按Esc键退出网页全屏&#10;3：开启此功能后，调整大小，自动宽屏，定位功能不会启用" class="tipsButton">[?]</span></label>
            			<label fname="doubleClickFullScreen" class="multiLine"><input name="doubleClickFullScreen" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,doubleClickFullScreenDelayed" ><span class="checkbox"></span>双击全屏<span tooltip="使用帮助：&#10;1：双击视频区域全屏" class="tipsButton">[?]</span>
						<div class="newLine">播放/暂停延时<input name="doubleClickFullScreenDelayed" type="number" min="0" max="500" placeholder="0" value="0" style="width: 45px;">毫秒<span tooltip="使用帮助：&#10;0：非常建议设置为0！！！！&#10;1：开启“双击全屏”功能后点击视频区域“播放/暂停”会增加延时，使全屏功能更流畅&#10;2：由于增加了延时，导致点击视频区域“播放/暂停”功能不是及时的，这时可以用键盘空格键暂停&#10;3：毫秒数设置为0，关闭延时&#10;4：由于电脑的性能，实际的延迟比设置的更高" class="tipsButton">[?]</span></div></label>
					</div>
            	</fieldset>
            	<fieldset class="playbackGroup">
            		<legend><label>播放视频</label></legend>
					<div class="block">
						<label fname="autoPlay"><input name="autoPlay" type="checkbox"><span class="checkbox"></span>自动播放视频</label>
						<label fname="startFromHistory"><input name="startFromHistory" type="checkbox"><span class="checkbox"></span>从"上次观看"位置开始播放</label>
						<label fname="autoNextPlist"><input name="autoNextPlist" type="checkbox"><span class="checkbox"></span>自动播放下一个视频<span tooltip="使用帮助：&#10;1：此选项启用后将无视“B站”HTML5播放器自带的“自动换P功能”&#10;2：自动跳过“承包榜”、“充电名单”" class="tipsButton">[?]</span></label>
            			<del><label fname="autoLoopVideo"><input name="autoLoopVideo" type="checkbox" disabled><span class="checkbox"></span>自动循环播放当前视频</label></del>
						<label fname="skipSetTime" class="multiLine"><input name="skipSetTime" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,skipSetTimeValueMinutes;skipSetTimeValueSeconds" ><span class="checkbox"></span>自动从指定时间开始播放
            			<div class="newLine">
            				<input name="skipSetTimeValueMinutes" type="number" min="0" max="60" placeholder="0" value="0" style="width: 45px;" disabled="">分钟
            				<input name="skipSetTimeValueSeconds" type="number" min="0" max="60" placeholder="0" value="0" style="width: 45px;" disabled="">秒
            				<input type="hidden" name="skipSetTimeValue">
            			</div></label>
            			<label fname="autoVideoSpeed">
						    <input name="autoVideoSpeed" type="checkbox"><span class="checkbox"></span>修改默认播放速度
            				<select name="autoVideoSpeedValue">
            					<option value="0.5">0.5倍速</option>
            					<option value="0.75">0.75倍速</option>
            					<option value="1" selected="selected">正常</option>
            					<option value="1.25">1.25倍速</option>
            					<option value="1.5">1.5倍速</option>
            					<option value="2">2倍速</option>
            				</select>
            			</label>
            		</div>
            	</fieldset>
            	<fieldset class="functionGroup">
            			<legend><label>功能调整</label></legend>
            			<div class="block">
            				<label fname="autoFocusPlayer" class="multiLine"><input name="autoFocusPlayer" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,autoFocusPlayerOffsetType;autoFocusPlayerOffsetValue" ><span class="checkbox"></span>自动定位到播放器顶端
            				<div class="newLine">定位偏移
            					<select name="autoFocusPlayerOffsetType" disabled="">
            						<option value="sub" selected="selected">上移</option>
            						<option value="add">下移</option>
            					</select>
            					<input name="autoFocusPlayerOffsetValue" type="number" min="0" value="10" placeholder="10" style="width: 45px;" disabled="">像素
								<span tooltip="使用帮助：&#10;1：可以设置偏移位置，往上或往下移。" class="tipsButton">[?]</span>
            				</span>
            			</div></label>
            			<label fname="videoSeekingShowSendbar"><input name="videoSeekingShowSendbar" type="checkbox"><span class="checkbox"></span>快进退时显示进度条</label>
            			<label fname="autoHideSendbar"><input name="autoHideSendbar" type="checkbox"><span class="checkbox"></span>自动隐藏弹幕栏<span tooltip="使用帮助：&#10;1：需要开启“宽屏模式”或“网页全屏模式”才会生效&#10;2：鼠标移动到播放器顶部显示弹幕栏 &#10;3：如果发现画面出现“黑边”请开启“手动指定播放器大小”功能&#10; 并使用 [调整大小] 功能调整大小&#10;" class="tipsButton">[?]</span></label>
            			<label fname="resizePlayer" class="multiLine">
            				<input name="resizePlayer" type="checkbox"><span class="checkbox"></span>指定播放器大小
            				<span class="tipsButton" action="adjustPlayerSize" tooltip="使用帮助：&#10;1：点击[调整大小]进行调整">[调整大小]</span>
							<div class="newLine">
								视频信息&UP主位置
								<input name="resizePlayerVideoInfoAndUpInfoPosition" type="text" class="hide" readOnly="true" value="bottom" style="max-width:60px;">
							</div>
							<div class="newLine">宽度<input name="resizePlayerWidth" type="text" class="hide" readOnly="true" value="1024">
            					比例<input name="resizePlayerRatio" type="text" class="hide" readOnly="true" value="16/9">
							</div>
						</label>
            			<label fname="resizeMiniPlayer" class="multiLine">
            				<input name="resizeMiniPlayer" type="checkbox" action="childElementDisabledEvent" disabledChildElement="input,resizeMiniPlayerSize;resizeMiniPlayerSizeResizable" ><span class="checkbox"></span>迷你播放器宽度
            				<input name="resizeMiniPlayerSize" type="number" min="0" value="320" placeholder="320" style="width: 45px;" disabled="">像素
            				<span tooltip="使用帮助：&#10;1：调整评论处迷你播放器大小，输入合适的宽度后自动计算新大小&#10;   （新大小比例为 16：9）&#10;" class="tipsButton">[?]</span>
						<div class="newLine">
							迷你播放器
							<select name="resizeMiniPlayerSizeResizable" disabled="">
            					<option value="off" selected="selected">关闭</option>
            					<option value="on">开启</option>
            				</select>可调整大小
							<span tooltip="使用帮助：&#10;1：开启“修改迷你播放器宽度”后，拖动迷你播放器右下角调节按钮，可以调整大小。&#10;2：此功能是“实验功能”，部分页面可能不起作用" class="tipsButton">[?]</span>
						</div></label>
						<label fname="autoLightOn"><input name="autoLightOn" type="checkbox"><span class="checkbox"></span>自动播放器关灯<span tooltip="使用帮助：&#10;1：在视频区域内点击右键进行开，关灯操作&#10;2：双击黑暗区域开灯。" class="tipsButton">[?]</span></label>
            		</div>
            	</fieldset>
            </div>
        </div>
        <div class="info">
          	<span class="ver"></span>
			<span class="storageType">
          		<a href="javascript:void(0);" action="storageType" tooltip="脚本设置无法保存的，请点这里！">存储类型</a>
           	</span>
           	<span class="feedback">
          		<a href="https://github.com/kkren/bilibili_adjustPlayer/issues" target="_blank">反馈</a>
           	</span>
        </div>
        <div class="btns">
           	<div class="btn" action="restoreDef">恢复默认设置</div>
           	<div class="btn" action="save">保存</div>
           	<div class="btn btn-cancel" action="close">关闭</div>
        </div>
        </form>
        */
			});
			dialog.create(name, title, bar, content);
		},
		load: function (formData) {
			//loadData
			var form = document.querySelector('#adjust-player #main form');
			deserialize(form, formData);
			//fix clonenode select value
			form.onchange = function (e) {
				var node = e.target;
				var nodeName = node.nodeName;
				if (nodeName === "SELECT") {
					var options = node.options;
					for (var i = 0; i < options.length; i++) {
						if (i === options.selectedIndex) {
							node.options[node.selectedIndex].setAttribute("selected", "");
						} else {
							node.options[i].removeAttribute("selected");
						}
					}
				}
			};
			//init bindEvent
			configWindow.mainWindowResizeEvent();
			//childElementDisabledEvent
			var childElementDisabledEventActions = document.querySelectorAll('#adjust-player [action="childElementDisabledEvent"]'),
				i;
			for (i = 0; i < childElementDisabledEventActions.length; ++i) {
				var action = childElementDisabledEventActions[i];
				configWindow.childElementDisabledEvent(action.getAttribute("name"), action.getAttribute("disabledchildelement"));
			}
			//version
			try {
				var version = document.querySelector('#adjust-player form span.ver').innerHTML = "版本:" + GM_info.script.version;
			} catch (e) {
				var version = document.querySelector('#adjust-player form span.ver').innerHTML = "版本:无法获取";
			}
			//flashPlayer tips
			var player = isPlayer();
			if (player === "flashPlayer") {
				configWindow.help();
			}
		},
		save: function () {
			try {
				//clone form
				var newForm = document.createElement('form');
				//checked
				var func = document.querySelectorAll('#adjust-player #main form label[fname]'),
					i;
				for (i = 0; i < func.length; ++i) {
					var fname = func[i].getAttribute('fname');
					if (fname !== null) {
						var checkedFunc = func[i].querySelector('[type="checkbox"]:checked[name="' + fname + '"]');
						if (checkedFunc !== null) {
							var cloneNode = checkedFunc.parentNode.cloneNode(true);
							newForm.appendChild(cloneNode);
						}
					}
				}
				//shortcuts
				var shortcutsGroup = document.querySelector('#adjust-player #main form fieldset.shortcutsGroup');
				var shortcutsGroupCloneNode = shortcutsGroup.cloneNode(true);
				newForm.appendChild(shortcutsGroupCloneNode);

				//serialize
				var formData = serialize(newForm);

				//autoFocusPlayer
				if (formData.autoFocusPlayerOffsetType !== 'defalut' && formData.autoFocusPlayer === true) {
					var autoFocusPlayerOffsetValue = parseInt(formData.autoFocusPlayerOffsetValue.match(/^\+?[0-9]*$/g)[0]);
					if (!isNaN(autoFocusPlayerOffsetValue)) {
						formData.autoFocusPlayerOffsetValue = autoFocusPlayerOffsetValue;
					} else {
						formData.autoFocusPlayerOffsetValue = 0;
					}
				} else {
					delete formData.autoFocusPlayerOffsetType;
					delete formData.autoFocusPlayerOffsetValue;
				}
				//skipSetTime
				if (formData.skipSetTime === true) {
					var skipSetTimeValueMinutes = parseInt(formData.skipSetTimeValueMinutes.match(/^\+?[0-9]*$/g)[0]);
					var skipSetTimeValueSeconds = parseInt(formData.skipSetTimeValueSeconds.match(/^\+?[0-9]*$/g)[0]);
					if (!isNaN(skipSetTimeValueMinutes)) {
						formData.skipSetTimeValueMinutes = skipSetTimeValueMinutes;
						formData.skipSetTimeValue = skipSetTimeValueMinutes * 60;
					} else {
						delete formData.skipSetTimeValueMinutes;
					}
					if (!isNaN(skipSetTimeValueSeconds)) {
						formData.skipSetTimeValueSeconds = skipSetTimeValueSeconds;
						formData.skipSetTimeValue += skipSetTimeValueSeconds;
					} else {
						delete formData.skipSetTimeValueSeconds;
					}
				} else {
					delete formData.skipSetTimeValue;
					delete formData.skipSetTimeValueMinutes;
					delete formData.skipSetTimeValueSeconds;
				}
				//resizeMiniPlayer
				if (formData.resizeMiniPlayer === true) {
					var resizeMiniPlayerSize = parseInt(formData.resizeMiniPlayerSize.match(/^\+?[0-9]*$/g)[0]);
					if (!isNaN(resizeMiniPlayerSize)) {
						formData.resizeMiniPlayerSize = resizeMiniPlayerSize;
					} else {
						formData.autoFocusOffsetValue = 320;
					}
				} else {
					delete formData.resizeMiniPlayerSize;
				}
				//doubleClickFullScreenDelayed
				if (formData.doubleClickFullScreen === true) {
					var doubleClickFullScreenDelayed = parseInt(formData.doubleClickFullScreenDelayed.match(/^\+?[0-9]*$/g)[0]);
					if (!isNaN(doubleClickFullScreenDelayed)) {
						formData.doubleClickFullScreenDelayed = doubleClickFullScreenDelayed;
					} else {
						formData.doubleClickFullScreenDelayed = 0;
					}
				} else {
					delete formData.doubleClickFullScreenDelayed;
				}

				config.write(formData);
				console.log(formData);
				unsafeWindow.alert('保存设置成功');
				location.reload();
			} catch (e) {
				unsafeWindow.alert('保存设置失败');
				location.reload();
			}
		},
		restore: function () {
			var defaultConfig = config.restore();
			if (typeof defaultConfig !== 'undefined') {
				unsafeWindow.alert('恢复设置成功');
			} else {
				unsafeWindow.alert('恢复设置失败');
			}
			location.reload();
		},
		mainWindowResizeEvent: function () {
			var wrapper = document.querySelector('#adjust-player #main form .wrapper');
			var mainWindow = document.querySelector('#adjust-player #main');
			var mainWindowHeight = mainWindow.offsetHeight;
			mainWindow.style = 'margin-top:-' + (mainWindowHeight / 2).toFixed(0) + 'px;';
			var windowHeight = window.innerHeight;
			if (windowHeight < (mainWindowHeight + 200)) {
				wrapper.style = "max-height:" + (windowHeight - 200) + 'px; padding-right:10px;';
				mainWindow.style = 'margin-top:-' + (mainWindow.offsetHeight / 2) + 'px;';
			}
		},
		childElementDisabledEvent: function (parent, childAndType) {
			var childAndType = childAndType.split(",");
			var type = childAndType[0];
			var child = childAndType[1];
			var disabledEvent;

			if (type === "input") {
				var parentElement = document.querySelector('#adjust-player form input[name="' + parent + '"]');
				var childElements = child.split(";");
				var setDisabled = function (disabled) {
					for (var i = 0; i < childElements.length; ++i) {
						if (disabled) {
							document.querySelector('#adjust-player form [name="' + childElements[i] + '"]').setAttribute('disabled', '');
						} else {
							document.querySelector('#adjust-player form [name="' + childElements[i] + '"]').removeAttribute('disabled');
						}
					}
				};
				disabledEvent = parentElement.checked ? setDisabled(false) : setDisabled(true);
			} else if (type === "div") {
				var parentElement = document.querySelector('#adjust-player form input[name="' + parent + '"]');
				var childElement = document.querySelector('#adjust-player form div.' + child + '');
				disabledEvent = parentElement.checked ? childElement.classList.remove("disabled") : childElement.classList.add("disabled");
			}
		},
		adjustPlayerSize: function () {
			//init
			if (matchURL.isWatchlater() || matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
				if (window.confirm('调整大小功能不支持在\n【稍后观看页面】，【番剧页面】 中使用。\n点确定会跳转到测试页面，请在测试页面中重新调整\n取消放弃调整')) {
					window.top.location = "http://www.bilibili.com/video/av120040/";
					return;
				} else {
					return;
				}
			}
			document.querySelector('#adjust-player').setAttribute("style", "display: none;");
			unsafeWindow.scrollTo(0, 0);

			//tips
			var tips = document.createElement('div');
			tips.innerHTML = commentToString(function () {
				/*
            <div class="info">
              <p>当前宽度：<span class="width">1024</span> px</p>
              <p>当前高度：<span class="height">576</span> px</p>
			  <p>当前比例：<span class="ratio">16/9</span></p>
            </div>
            <div class="tips-text">
			  <p>调整后在页面可视区域宽度过小时，不会生效。</p>
			  <p>调整后的大小有宽度限制，最小宽度为740像素，最小高度为408像素。</p>
			  <p>调整后的大小在“普通模式”下会根据“播放器顶栏”、“弹幕栏”、“播放器控件”的大小自动计算出合适的尺寸。</p>
            </div>
            <div class="drag-arrow">
              <p style="color: red; font-size: 80px;">↘</p>
            </div>
            */
			});
			tips.id = "adjust-player-tips";
			tips.style = "width: 1024px; height:576px";

			//save
			var tipsSave = document.createElement('div');
			tipsSave.innerHTML = commentToString(function () {
				/*
            <div class="content">
              <p class="bold">使用帮助</p>
              <p>1.拖动右下角“外框”调整播放器大小（<span style="color: red;">↘</span> 处）。</p>
			  <p>2.当前灰色区域的大小，保存后就是播放器的新大小。</p>
              <p>3.调整到合适的大小，点击保存。</p>
              <div class="box custom-videoInfoAndUpInfoPosition">
                  <div style="text-align: left;">视频信息&UP主位置：</div>
                    <select name="customVideoInfoAndUpInfoPosition" style="width:100%;margin-top: 10px;">
						<option value="bottom" selected="selected">视频底部</option>
						<option value="top">视频顶部</option>
                    </select>
              </div>
              <div class="box custom-ratio">
                  <div style="text-align: left;">限制调整比例：</div>
                    <select name="customRatio" style="width:100%;margin-top: 10px;">
                        <option value="3/2">3 / 2</option>
                        <option value="4/3">4 / 3</option>
                        <option value="15/9">15 / 9</option>
						<option value="16/9" selected="selected">16 / 9</option>
						<option value="16/10">16 / 10</option>
                        <option value="18/9">18 / 9</option>
                        <option value="21/9">21 / 9</option>
                        <option value="32/9">32 / 9</option>
                     </select>
              </div>
              <div class="box custom-width">
                  <div style="text-align: left;">快速保存宽度为：</div>
				  <div class="btn b-btn" action="quickSave" customWidth="1153">1153px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="1280">1280px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="1580">1580px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="1920">1920px</div>
                  <div class="btn b-btn" action="quickSave" customWidth="2220">2220px</div>
              </div>
              <div class="btn b-btn" action="save" style="width:49%;float:left;" >保存</div>
              <div class="btn b-btn-cancel" action="cancel" style="width:49%;float:right;" >取消</div>
			  <div style="clear: both;"></div>
            </div>
            */
			});
			tipsSave.id = "adjust-player-tips-save";
			tipsSave.onclick = function (e) {
				var resizePlayerWidth = document.querySelector('#adjust-player form input[name="resizePlayerWidth"]');
				var resizePlayerRatio = document.querySelector('#adjust-player form input[name="resizePlayerRatio"]');
				var resizePlayerVideoInfoAndUpInfoPosition = document.querySelector('#adjust-player form input[name="resizePlayerVideoInfoAndUpInfoPosition"]');
				var resizePlayer = document.querySelector('#adjust-player form input[name="resizePlayer"]');

				var action = e.target.getAttribute('action');
				if (e.target && action !== null) {
					var customRatio = document.querySelector('#adjust-player-tips-save select[name="customRatio"]');
					var customVideoInfoAndUpInfoPosition = document.querySelector('#adjust-player-tips-save select[name="customVideoInfoAndUpInfoPosition"]');
					if (action === "save") {
						try {
							var minWidth = 724;
							var minHeight = 408;
							var adjustPlayerTips = document.querySelector('#adjust-player-tips');
							var width = parseInt(adjustPlayerTips.clientWidth);
							var height = parseInt(adjustPlayerTips.clientHeight);

							if (height <= minHeight) {
								unsafeWindow.alert('保存设置失败\n播放器高度调整后过小，不能少于408像素，请重新调整！');
								return;
							} else {
								if (width <= minWidth) {
									width = "724";
								} else {
									width = adjustPlayerTips.clientWidth;
								}
								resizePlayerWidth.value = width;
								resizePlayerRatio.value = customRatio.options[customRatio.selectedIndex].value;
								resizePlayerVideoInfoAndUpInfoPosition.value = customVideoInfoAndUpInfoPosition.options[customVideoInfoAndUpInfoPosition.selectedIndex].value;
								resizePlayer.checked = true;
								configWindow.save();
							}
						} catch (ex) {
							unsafeWindow.alert('保存设置失败');
							location.reload();
							console.log("adjustPlayer:\n adjustPlayerSize save error\n " + ex);
						}
					} else if (action === "cancel") {
						location.reload();
					} else if (action === "quickSave") {
						var customWidth = e.target.getAttribute('customWidth');
						var height = Number(customWidth / window.adjustPlayerTipsRatio).toFixed();
						resizePlayerWidth.value = customWidth;
						resizePlayerRatio.value = customRatio.options[customRatio.selectedIndex].value;
						resizePlayerVideoInfoAndUpInfoPosition.value = customVideoInfoAndUpInfoPosition.options[customVideoInfoAndUpInfoPosition.selectedIndex].value;
						resizePlayer.checked = true;
						configWindow.save();
					}
				}
			};
			tipsSave.onchange = function (e) {
				var name = e.target.getAttribute('name');
				if (e.target && name !== null) {
					if (name === "customRatio") {
						var customRatio = e.target.value;
						var ratio = customRatio.split("/");
						ratio = ratio[0] / ratio[1];
						window.adjustPlayerTipsRatio = ratio;

						var adjustPlayerTipsRatio = document.querySelector('#adjust-player-tips .info .ratio');
						adjustPlayerTipsRatio.innerHTML = customRatio;
					}
				}
			};

			//resize
			var playerContent = document.createElement('div');
			playerContent.id = 'adjust-Player-Size';
			playerContent.style = "position: absolute; width: 100%; min-height: 576px; top: 60px; z-index: 999999; height: 100%; margin: 0px auto; background: #fff;";
			playerContent.insertBefore(tips, playerContent.firstChild);
			playerContent.insertBefore(tipsSave, playerContent.firstChild);

			document.body.appendChild(playerContent);

			var adjustPlayerTipsSave = document.querySelector('#adjust-player-tips-save');
			var adjustPlayerTipsSaveContent = document.querySelector('#adjust-player-tips-save .content');
			adjustPlayerTipsSave.setAttribute("style", "position: absolute; z-index: 100000; left: calc(100% / 2 - calc(" + adjustPlayerTipsSaveContent.clientWidth + "px / 2));");

			//resize event
			window.adjustPlayerTipsRatio = 16 / 9;
			var adjustPlayerTips = document.querySelector('#adjust-player-tips');
			var adjustPlayerTipsW = document.querySelector('#adjust-player-tips .info .width');
			var adjustPlayerTipsH = document.querySelector('#adjust-player-tips .info .height');
			var adjustPlayerTipsDragArrow = document.querySelector('#adjust-player-tips .drag-arrow');

			var resizeEvent = function callback() {
				window.setTimeout(callback, 20);
				var width = adjustPlayerTips.clientWidth;
				var height = adjustPlayerTips.clientHeight;
				var newHeight = Number(width / window.adjustPlayerTipsRatio).toFixed();
				adjustPlayerTips.setAttribute("style", "position: relative; z-index:10000; margin:0 auto; width: " + width + "px; height:" + newHeight + "px; min-width:724px;");
				adjustPlayerTipsW.innerHTML = width;
				adjustPlayerTipsH.innerHTML = newHeight;
				adjustPlayerTipsDragArrow.setAttribute("style", "top:calc(" + height + "px - 80px);right:20px;");
			};

			window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

			var resizeEventID;
			resizeEventID = window.requestAnimationFrame(resizeEvent);

			//window.cancelAnimationFrame(resizeEventID);
		},
		shortcutsWindow: function (e) {
			//create
			var name = 'shortcutsSetting';
			var title = '快捷键设置';
			var bar = '<span class="btn" action="cancel">X</span>';
			var content = commentToString(function () {
				/*
			<p style="margin-bottom: 4px;font-size: 16px;">请在输入框内按下需要的按键设置快捷键：<span id="tips" style="text-align: left; color: #ff81aa; margin-top: 33px; right: 32px; position: absolute;"></span></p>
			<p>
			  <input type="text" name="keyName" placeholder="支持单个组合键ctrl，alt，shift" style="width: 574px;height:30px;font-size: 16px;text-align: center;padding:4px 0;border: 1px solid #ccd0d7;border-radius: 4px;" >
			  <input type="hidden" name="keyCode" >
			  <input type="hidden" name="typeName" >
			</p>
			<p class="tips-box">
			  <span style="padding: 0 10px;font-weight: bold;">* 请不要在意英文的按键名称。<br/></span>
			  <span style="padding: 0 10px;font-weight: bold;">* 请关闭输入法后设置。<br/></span>
			  <span style="padding: 0 10px;font-weight: bold;">* 默认的快捷键（已知的）有：</span><br/><span style="margin-left: 27px; display: inline-block;">空格 （播放/暂停）<br/>方向键上、下 （音量+/音量-）<br/>方向键左、右 （后退/快进） <br/>最好避开这些按键，和浏览器默认的快捷键，脚本没有阻止默认行为。</span>
			</p>
			<div class="btns" style="text-align: center;">
               <div class="btn" action="clear">清除此快捷键</div>
               <div class="btn" action="save">设置</div>
               <div class="btn btn-cancel" action="cancel">取消</div>
			</div>
			*/
			});
			var isModal = e.target.offsetParent.offsetParent;
			dialog.create(name, title, bar, content, isModal);

			//onkeydown
			var tips = document.querySelector('#shortcutsSetting #tips');
			var kName = document.querySelector('#shortcutsSetting input[name="keyName"]');
			var kCode = document.querySelector('#shortcutsSetting input[name="keyCode"]');
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			typeName.value = e.target.getAttribute('typeName');

			function keydownEvent(event) {
				if (!event.metaKey) {
					event.preventDefault();
				}
				tips.innerHTML = "";
				var keyCode = getkeyCode(event.keyCode);
				if (typeof keyCode !== 'undefined') {
					if (event.altKey && event.shiftKey || event.ctrlKey && event.shiftKey || event.ctrlKey && event.altKey) {
						return;
					}
					if (event.shiftKey && event.keyCode !== 16) {
						kName.value = "shift + " + keyCode;
						kCode.value = "shift" + '+' + event.keyCode;
					} else if (event.ctrlKey && event.keyCode !== 17) {
						kName.value = "ctrl + " + keyCode;
						kCode.value = "ctrl" + '+' + event.keyCode;
					} else if (event.altKey && event.keyCode !== 18) {
						kName.value = "alt + " + keyCode;
						kCode.value = "alt" + '+' + event.keyCode;
					} else {
						kName.value = keyCode;
						kCode.value = event.keyCode;
					}
				} else {
					tips.innerHTML = "按键无法被识别";
				}
			}
			kName.addEventListener("keydown", keydownEvent, false);

			//inputFocus
			function focusEvent(event) {
				document.removeEventListener("keydown", focusEvent, false);
				kName.focus();
				keydownEvent(event);
			}
			document.addEventListener("keydown", focusEvent, false);
			//console.log(e);
		},
		shortcutsSettingClear: function () {
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			var keyName = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="' + typeName.value + 'KeyName"]');
			var keyCode = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="' + typeName.value + 'KeyCode"]');
			var type = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="' + typeName.value + '"]');
			keyName.value = "";
			keyCode.value = "";
			type.checked = false;
			dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
		},
		shortcutsSettingSave: function () {
			try {
				var tips = document.querySelector('#shortcutsSetting #tips');
				var kName = document.querySelector('#shortcutsSetting input[name="keyName"]');
				var kCode = document.querySelector('#shortcutsSetting input[name="keyCode"]');
				var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
				var typeNameValue = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="' + typeName.value + 'KeyCode"]');

				if (kName.value !== "" && kCode.value !== "" && typeName.value !== "") {
					var keyCodes = document.querySelectorAll('#adjust-player #main form .shortcutsGroup input[KeyCode="true"]'),
						i;
					var isUsedkeyCode = false;
					for (i = 0; i < keyCodes.length; ++i) {
						if (kCode.value === keyCodes[i].value && kCode.value !== typeNameValue.value) {
							isUsedkeyCode = true;
							break;
						}
					}

					if (isUsedkeyCode) {
						tips.innerHTML = "按键冲突，已使用过的快捷键";
						kName.focus();
					} else if (kCode.value === "16" || kCode.value === "17" || kCode.value === "18") {
						tips.innerHTML = "按键不能为单个的 ctrl，alt，shift";
						kName.focus();
					} else {
						var shortcutsKeyName = document.querySelector('#adjust-player .shortcutsGroup input[name="' + typeName.value + 'KeyName"]');
						var shortcutsKeyCode = document.querySelector('#adjust-player .shortcutsGroup input[name="' + typeName.value + 'KeyCode"]');
						var shortcutsTypeName = document.querySelector('#adjust-player .shortcutsGroup input[name="' + typeName.value + '"]');

						shortcutsKeyName.value = kName.value;
						shortcutsKeyCode.value = kCode.value;
						shortcutsTypeName.checked = true;

						dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
					}

				} else {
					tips.innerHTML = "按键不能为空";
					kName.focus();
				}
			} catch (ex) {
				unsafeWindow.alert('设置失败');
				console.log("shortcutsSettingSave\n " + ex);
			}
		},
		shortcutsSettingCancel: function () {
			var typeName = document.querySelector('#shortcutsSetting input[name="typeName"]');
			var keyCode = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="' + typeName.value + 'KeyCode"]');
			var type = document.querySelector('#adjust-player #main form .shortcutsGroup input[name="' + typeName.value + '"]');
			if (keyCode.value !== "") {
				type.checked = true;
			} else {
				type.checked = false;
			}

			dialog.close(document.querySelector('#adjust-player > #shortcutsSetting'));
		},
		storageTypeWindow: function (e) {
			var name = 'storageType';
			var title = '更改脚本数据存储类型';
			var bar = '<span class="btn" action="close">X</span>';
			var content = commentToString(function () {
				/*
			<p style="margin-bottom: 4px;font-size: 16px;">请选择脚本数据存储类型：<span id="tips" style="text-align: left; color: #ff81aa; margin-top: 33px; right: 22px; position: absolute;"></span></p>
			<p style="margin: 10px;font-size: 16px; text-align:center;">
			   <input type="radio" id="extension" name="storageType" value="extension" checked>
			      <label for="extension">extension（油猴扩展存储）</label>
			   <input type="radio" id="localStorage" name="storageType" value="localStorage">
			      <label for="localStorage">localStorage（浏览器存储）</label>
			</p>
			<ol class="tips-box" style="padding: 20px 20px 20px 40px;">
			   <li style="list-style: decimal;"><span style="font-weight: bold;color:red;">如果没有出现“无法保存脚本数据”的情况，请无视这个设置！</span></li>
			   <li style="list-style: decimal;"><span style="font-weight: bold;">出现“无法保存脚本数据”的情况，请把“存储类型” 更改为 “localStorage（浏览器存储）”</span></li>
			   <li style="list-style: decimal;"><span style="font-weight: bold;">如果更改为 “localStorage（浏览器存储）” www.bilibili.com 和 bangumi.bilibili.com 的设置不会同步，需要手动重新设置。</span></li>
			   <li style="list-style: decimal;">使用 Greasemonkey、Tampermonkey 扩展来安装脚本的用户，一般请不要修改，请保持默认的“extension（油猴扩展存储）” 。</li>
			   <li style="list-style: decimal;">如果更改为 “localStorage（浏览器存储）” 那么删除脚本的时候，脚本设置不会被清除，想清除的话请使用浏览器的“清除浏览数据”功能来清除。</li>
			   <li style="list-style: decimal;">两种存储类型不会自动同步设置，更换存储类型后请重新设置。</li>
			</ol>
			<div class="btns" style="text-align: center;">
               <div class="btn" action="save">设置</div>
               <div class="btn btn-cancel" action="cancel">取消</div>
			</div>
			*/
			});
			var isModal = e.target.parentNode.parentNode.offsetParent;
			dialog.create(name, title, bar, content, isModal);

			var setStorageTypeValue = localStorage.getItem('adjustPlayer_storageType');
			if (setStorageTypeValue !== null) {
				var storageType = document.querySelectorAll('#storageType input[name="storageType"]'),
					i;
				for (i = 0; i < storageType.length; ++i) {
					if (storageType[i].value === setStorageTypeValue) {
						storageType[i].checked = true;
						break;
					}
				}
			}
		},
		storageTypeSave: function () {
			var setStorageTypeValue = null;
			var storageType = document.querySelectorAll('#storageType input[name="storageType"]'),
				i;
			for (i = 0; i < storageType.length; ++i) {
				if (storageType[i].checked === true) {
					setStorageTypeValue = storageType[i].value;
					break;
				}
			}
			if (setStorageTypeValue !== null) {
				localStorage.setItem('adjustPlayer_storageType', setStorageTypeValue);
				var getStorageType = localStorage.getItem('adjustPlayer_storageType');
				if (getStorageType === setStorageTypeValue) {
					alert("更改设置成功");
					location.reload();
				} else {
					alert("更改设置失败");
					location.reload();
				}
			}
		},
		help: function () {
			var name = 'help';
			var title = '哔哩哔哩播放器调整';
			var bar = '<span class="btn" action="close">X</span>';
			var content = commentToString(function () {
				/*
			<h2 style="font-weight: bold;font-size: 16px;">小提示：</h2>
			<ol style="padding: 0 0 0 20px;margin:10px 0;">
			   <li style="list-style: disc;">播放器调整设置按钮在<span style="font-weight: bold;">页面最右侧。</span></li>
			   <li style="list-style: disc;">播放器调整设置窗口中，鼠标移动到<span style="font-size: 12px; color: #00a1d6; cursor: pointer;margin:0 10px;"tooltip="查看帮助">[?]</span>上，查看此功能的使用帮助。</li>
			</ol>
			<div class="btns" style="text-align: center;"><div class="btn" action="close">关闭</div></div>
			*/
			});

			var player = isPlayer();
			if (player === "flashPlayer") {
				content = commentToString(function () {
					/*
				<h2 style="font-weight: bold;font-size: 16px;">小提示：</h2>
				<ol style="padding: 0 0 0 20px;margin:10px 0;">
				   <li style="list-style: disc;"><span style="font-weight: bold;">此脚本现已不再支持 flash 播放器</span></li>
				   <li style="list-style: disc;"><span style="font-weight: bold;">需要开启“HTML5 播放器”。</span></li>
				</ol>
				<h2 style="font-weight: bold;font-size: 16px;">开启“HTML5播放器”步骤：</h2>
				<ol style="padding: 0 0 0 20px;margin:10px 0;">
				   <li style="list-style: decimal;">打开<a href="https://www.bilibili.com/blackboard/html5playerhelp.html" rel="nofollow">https://www.bilibili.com/blackboard/html5playerhelp.html</a></li>
				   <li style="list-style: decimal;">选择试用HTML5播放器</li>
				</ol>
				<div class="btns" style="text-align: center;"><div class="btn" action="close">关闭</div></div>
				*/
				});
			}
			dialog.create(name, title, bar, content);
		},

		init: function () {
			configWindow.create();
			if (typeof GM_getValue === 'function') {
				var formData = config.read();
				configWindow.load(formData);
			} else {
				var formData = config.read();
				formData.then(function (value) {
					configWindow.load(value);
				});
			}
		}
	};

	function createConfigBtn() {
		var isExistAdjustPlayerMain = document.querySelector('#adjust-player');
		if (isExistAdjustPlayerMain === null) { //isExistAdjustPlayerMain === null
			var css = commentToString(function () {
				/*
				#adjust-player-config-btn{position:fixed;bottom:243px;right:6px;z-index:10;}
				#adjust-player-config-btn span{font-size:12px;display:block;padding:6px 0;text-align:center;line-height:17px;background:#fff;border:1px solid #e7e7e7;-webkit-box-shadow:0 6px 10px 0 hsla(0,0%,73%,.3);box-shadow:0 6px 10px 0 hsla(0,0%,73%,.3);border-radius:2px;color:#212121;width:46px;cursor:pointer;transition:color .3s}
				#adjust-player-config-btn span:hover {color: #00a1d6;border: 1px solid #00a1d6}
				.float-nav  {bottom:60px!important}
				.adjust-player-mask{display:none;position:fixed;top:0;left:0;z-index:100001;width:100%;height:100%;background:#000;opacity:.6;filter:alpha(opacity=60)}
				#adjust-player .title{font-size:16px;color:#222;text-align:center;font-weight:bold;margin-bottom:20px}
				#adjust-player .dialog{position:fixed;z-index:100002;top:50%;margin-top:-280px;left:50%;width:580px;margin-left:-320px;padding:20px;background-color:rgb(255,255,255);border-radius:6px;box-shadow:1px 1px 40px 0px rgba(0,0,0,0.6);display:block;font-size:14px;line-height:26px}
				#adjust-player .title span{font-size:12px;color:#fff;background-color:#00a1d6;display:inline-block;width:22px;height:22px;position:absolute;right:25px;border-radius:50%;line-height:22px;transition:.1s;transition-property:background-color;margin-top:2px}
				#adjust-player .title span:hover{background-color:#00b5e5;cursor:pointer}
				#adjust-player .title [action="help"]{right:52px}
				#adjust-player fieldset{border:1px solid #e5e9ef;border-radius:4px;padding:0 6px 6px;background-color:#f4f5f7;margin-bottom:10px}
				#adjust-player legend{width: unset;font-weight:bold;font-size:14px;margin-left:11px;border:1px solid #e5e9ef;background-color:#fff;padding:0 10px;border-radius:4px}
				#adjust-player legend label span{color:#6d757a;font-size:12px}
				#adjust-player input,#adjust-player select,#adjust-player option{-webkit-appearance:unset!important;-moz-appearance:unset!important;appearance:unset!important;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;vertical-align:middle;background-color:#fff;border:1px solid #99a2aa;border-radius:3px}
				#adjust-player input[type="number"]{-webkit-appearance:textfield!important;-moz-appearance:menulist!important;appearance:textfield!important}
				#adjust-player input[type="radio"]{-webkit-appearance:radio!important;-moz-appearance:radio!important;appearance:radio!important}
				#adjust-player select{-webkit-appearance:menulist!important;-moz-appearance:menulist!important;appearance:menulist!important}
				#adjust-player select,#adjust-player input[type="number"]{text-align-last:center;text-align:center;margin:0 2px;height:22px}
				#adjust-player input[type="checkbox"]{visibility:hidden;width:14px;height:14px}
				#adjust-player input[type="checkbox"]  + .checkbox{color:#99a2aa;border:1px solid #99a2aa;display:inline-block;width:14px;height:14px;background-color:#fff;border-radius:2px;content:" ";position:absolute;margin-top:5px;margin-left:-19px}
				#adjust-player input[type="checkbox"]:checked  + .checkbox::before{visibility:visible;color:#00a1d6;display:inline-block;border:0px;border-radius:2px;font-family:bilibili-iconfont;content:"\E629";font-size:16px;position:absolute;margin-top:-6px;margin-left:-1px}
				#adjust-player input[type="checkbox"]:checked  + .checkbox{visibility:hidden}
				#adjust-player input[readOnly="true"]{color:#99a2aa;width:80px;max-width:80px;border:0px;background:#f4f5f7}
				#adjust-player input[readOnly="true"].hide{ max-width: 47px; border: 1px #ccc solid; text-align-last: center; text-align: center; margin: 0 10px; height: 22px; }
				#adjust-player [disabled] {color:#99a2aa}
				#adjust-player .block{padding:5px 0}
				#adjust-player .block .bold{font-weight:bold}
				#adjust-player .block label{display:block;margin:2px 0 2px 19px;height:24px}
				#adjust-player .block label.multiLine {height:auto;}
				#adjust-player .block label.multiLine .newLine{margin-left:14px}
				#adjust-player .tipsButton{font-size:12px;color:#00a1d6;cursor:pointer;padding:0 2px}
				#adjust-player .left{float:left}
				#adjust-player .right{float:right}
				#adjust-player .left,#adjust-player .right{width:48%;vertical-align:top}
				#adjust-player .shortcutsItem{max-width:200px}
				#adjust-player .info{position:absolute;bottom:20px;border:1px solid #e5e9ef;border-radius:20px;padding:0 10px}
				#adjust-player .info .ver{font-weight:bold;padding-right:5px;color:#6d757a}
				#adjust-player a{outline:0;color:#00a1d6;text-decoration:none;cursor:pointer}
				#adjust-player .btns{text-align:right;width:100%;display:inline-block}
				#adjust-player .btn{margin:10px 0px 0px 10px;width:100px;height:28px;line-height:28px;font-size:14px;display:inline-block;color:#fff;cursor:pointer;text-align:center;border-radius:4px;background-color:#00a1d6;vertical-align:middle;border:1px solid #00a1d6;transition:.1s;transition-property:background-color,border,color;user-select:none}
				#adjust-player .btn:hover{color:#fff;background:#00b5e5;border-color:#00b5e5}
				#adjust-player .btn-cancel{display:inline-block;text-align:center;cursor:pointer;color:#222;border:1px solid #ccd0d7;background-color:#fff;border-radius:4px;transition:.1s;transition-property:background-color,border,color}
				#adjust-player .btn-cancel:hover{color:#00a1d6;border-color:#00a1d6;background:#fff}
				#adjust-player .tips-box{color: #99a2aa;border:1px solid #e5e9ef;background-color: #f4f5f7;border-radius: 10px;margin: 10px 0;padding: 20px}
				#adjust-player form .wrapper{overflow-x:hidden;white-space:nowrap;position:relative}
				#adjust-player .modalWindow{z-index:100000}
				#adjust-player .shortcutsItem.disabled > label{color:#99a2aa !important}
				#adjust-player-tips{width:100%;height:100%;line-height:16px;color:#333;overflow:auto;resize:horizontal;background:linear-gradient(135deg,#E6E7E8 0,#E6E7E8 99%,#fff 95%)}
				#adjust-player-tips p,#adjust-player-tips-save p{text-align:left}
				#adjust-player-tips-save .content{position:absolute;top:20px;width:414px;font-size:16px;line-height:24px;padding:20px;background:#fff;border:1px solid #eee;border-radius:4px;z-index:1}
				#adjust-player-tips-save .content .bold{font-weight:bold;font-size:18px;text-align:center;color:#333;padding-bottom:18px}
				#adjust-player-tips-save .content .btn{display:inline-block;margin-top:10px;padding:4px 0;width:120px;color:#fff;cursor:pointer;text-align:center;border-radius:4px;background-color:#00a1d6;vertical-align:middle;border:1px solid #00a1d6;transition:.1s;transition-property:background-color,border,color;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}
				#adjust-player-tips-save .content .btn:hover{background-color:#00b5e5;border-color:#00b5e5}
				#adjust-player-tips-save .content .btn.b-btn-cancel{text-align:center;cursor:pointer;color:#222;border:1px solid #ccd0d7;background-color:#fff;border-radius:4px;transition:.1s;transition-property:background-color,border,color}
				#adjust-player-tips-save .content .btn.b-btn-cancel:hover{color:#00a1d6;border-color:#00a1d6}
				#adjust-player-tips-save .content .btns{margin-top:10px}
				#adjust-player-tips-save .box{margin:10px 0;padding:10px;color:#222;border-radius:4px;border:1px solid #ccd0d7}
				#adjust-player-tips-save .custom-width .btn{display:inline-block;width:auto;padding:0 10px}
				#adjust-player-tips .info{position:relative;top:10px;margin-left:10px;font-weight:bold;z-index:10}
				#adjust-player-tips .info span{color:#333;font-size:12px;color:#fb7299}
				#adjust-player-tips .tips-text{position:absolute;bottom:10px;margin-left:10px;color:#99a2aa}
				#adjust-player-tips .drag-arrow{position:absolute;right:0}
				*/
			});
			var styleNode = document.createElement('style');
			styleNode.type = 'text/css';
			styleNode.id = 'adjustPlayerMainCss';
			styleNode.appendChild(document.createTextNode(css));
			document.documentElement.appendChild(styleNode);
			var adjustPlayer = document.createElement('div');
			adjustPlayer.id = 'adjust-player';
			document.body.appendChild(adjustPlayer);
			var adjustPlayerMask = document.createElement('div');
			adjustPlayerMask.className = 'adjust-player-mask';
			document.querySelector('#adjust-player').appendChild(adjustPlayerMask);
		}
		var isExistConfigBtn = document.querySelector('#adjust-player-config-btn');
		if (isExistConfigBtn === null) {
			var configButton = document.createElement('div');
			configButton.id = 'adjust-player-config-btn';
			configButton.innerHTML = '<span>播放器<br>调整</span>';
			configButton.onclick = function () {
				configWindow.init();
			};
			document.querySelector('body').appendChild(configButton);
			// document.querySelector('.float-nav').style.bottom = "70px"
		}
	}
	var matchURL = {
		isVideoAV: function () {
			if (location.href.match(/video\/(av(\d+)|BV(\S+))\d*/g) !== null) {
				return true;
			} else {
				return false;
			}
		},
		isOldBangumi: function () {
			if (location.hostname === 'bangumi.bilibili.com') {
				return true;
			} else {
				return false;
			}
		},
		isWatchlater: function () {
			if (location.href.match(/watchlater\/#\/(av(\d+)|BV(\S+))\d*\/p\d*/g) !== null) {
				return true;
			} else {
				return false;
			}
		},
		isBangumiMovie: function () {
			if (location.href.match(/bangumi.bilibili.com\/movie\/\d*/g) !== null) {
				return true;
			} else {
				return false;
			}
		},
		isNewBangumi: function () {
			if (location.href.match(/bangumi\/play\/(ep|ss)\d*/g) !== null) {
				return true;
			} else {
				return false;
			}
		},
		isMedialist: function () {
			if (location.href.match(/medialist\/play\/(ml)\d*/g) !== null) {
				return true;
			} else {
				return false;
			}
		}
	};

	function querySelectorFromIframe(obj) {
		var iframePlayer = null;
		if (matchURL.isOldBangumi() || matchURL.isNewBangumi()) {
			iframePlayer = document.querySelector('iframe.bilibiliHtml5Player');
		}
		if (matchURL.isMedialist()) {
			iframePlayer = document.querySelector('iframe#media-player')
		}
		if (iframePlayer !== null) {
			return iframePlayer.contentWindow.document.body.querySelector(obj);
		} else {
			return document.querySelector(obj);
		}

	}

	function isPlayer() {
		var flashPlayer = querySelectorFromIframe('#playerWrap object');
		var html5Player = querySelectorFromIframe('.bilibili-player-video video');
		if (flashPlayer !== null) {
			return "flashPlayer";
		} else if (html5Player !== null) {
			return "html5Player";
		} else {
			return "unknownPlayer";
		}
	}

	function isFullscreen() {
		var element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		if (typeof element === 'undefined') {
			return false;
		} else {
			return true;
		}
	}

	function createMouseoverAndMouseoutEvent(type, element) {
		if (typeof type !== 'undefined' && typeof element !== 'undefined') {
			return new Promise(function (resolve, reject) {
				var createEvent = function (type) {
					var evt = document.createEvent('Event');
					if (type === "show") {
						evt.initEvent('mouseover', true, true);
						element.dispatchEvent(evt);
					} else if (type === "hide") {
						evt.initEvent('mouseout', true, true);
						element.dispatchEvent(evt);
					}
				};
				createEvent(type);
				resolve(type);
			});
		}
	}

	function doClick(obj) {
		if (obj !== null) {
			if (obj.click) {
				obj.click();
			} else {
				var evt = document.createEvent('Event');
				evt.initEvent('click', true, true);
				obj.dispatchEvent(evt);
			}
		}
	}

	function contextMenuClick(element) {
		var ev;
		if (document.createEvent) {
			/*
			console.log(element);
			var clientX = element.offsetLeft;
			var clientY = element.offsetTop + element.offsetHeight;
			*/
			ev = new MouseEvent("contextmenu", {
				screenX: 10,
				screenY: 10,
				clientX: 10,
				clientY: 10,
				button: 2
			});
			element.dispatchEvent(ev);
		} else {
			ev = document.createEventObject();
			ev.screenX = 10;
			ev.screenY = 10;
			ev.clientX = 10;
			ev.clientY = 10;
			ev.button = 2;
			document.fireEvent('contextmenu', ev);
		}
	};

	function commentToString(f) {
		var s = f.toString().replace(/^[\s\S]*\/\*.*/, '').replace(/.*\*\/[\s\S]*$/, '').replace(/\r\n|\r|\n/g, '\n');
		return s;
	}

	function serialize(e) {
		if (e && "FORM" === e.nodeName) {
			var t, s, n, l = {},
				a = [];
			var list = {};
			for (t = e.elements.length - 1; t >= 0; t -= 1) {
				if ("" !== e.elements[t].name) {
					var listName = e.elements[t].getAttribute("list");
					switch (e.elements[t].nodeName) {
						case "INPUT":
							switch (e.elements[t].type) {
								case "hidden":
								case "text":
								case "password":
								case "number":
									if (listName !== null) {
										if (typeof e.elements[t].name !== "undefined" && e.elements[t].value !== "") {
											list[e.elements[t].name] = e.elements[t].value
										}
										break
									}
									l[e.elements[t].name] = e.elements[t].value;
									break;
								case "checkbox":
								case "radio":
									if (listName !== null) {
										if (typeof e.elements[t].name !== "undefined" && e.elements[t].value !== "") {
											e.elements[t].checked && (n = "on" === e.elements[t].value ? n = !0 : field.value, list[e.elements[t].name] = n);
											l[listName] = list
										}
										break
									}
									e.elements[t].checked && (n = "on" === e.elements[t].value ? n = !0 : field.value, l[e.elements[t].name] = n)
							}
							break;
						case "TEXTAREA":
							if (listName !== null) {
								if (typeof e.elements[t].name !== "undefined" && e.elements[t].value !== "") {
									list[e.elements[t].name] = e.elements[t].value
								}
								break
							}
							l[e.elements[t].name] = e.elements[t].value;
							break;
						case "SELECT":
							switch (e.elements[t].type) {
								case "select-one":
									if (listName !== null) {
										if (typeof e.elements[t].name !== "undefined" && e.elements[t].value !== "") {
											list[e.elements[t].name] = e.elements[t].value
										}
										break
									}
									l[e.elements[t].name] = e.elements[t].value;
									break;
								case "select-multiple":
									if (listName !== null) {
										if (typeof e.elements[t].name !== "undefined" && e.elements[t].value !== "") {
											for (s = e.elements[t].options.length - 1; s >= 0; s -= 1) {
												e.elements[t].options[s].selected && a.push(e.elements[t].options[s].value)
											}
											list[e.elements[t].name] = a.join()
										}
										break
									}
									for (s = e.elements[t].options.length - 1; s >= 0; s -= 1) {
										e.elements[t].options[s].selected && a.push(e.elements[t].options[s].value)
									}
									l[e.elements[t].name] = a.join()
							}
					}
				}
			}
			return JSON.parse(JSON.stringify(l))
		}
	};

	function deserialize(e, t) {
		if (e && "FORM" === e.nodeName) {
			var s, n, l, a, c, m = [];
			var isList;
			for (l in t) {
				for (s = e.elements.length - 1; s >= 0; s -= 1) {
					if (e.elements[s].name === l || e.elements[s].getAttribute("list") === l) {
						if ("" === e.elements[s].name) {
							continue
						}
						if (l === e.elements[s].getAttribute("list")) {
							var list = t[l][e.elements[s].name];
							if (typeof list !== "undefined") {
								isList = t[l][e.elements[s].name]
							} else {
								isList = ""
							}
						} else {
							isList = t[l]
						}
						switch (e.elements[s].nodeName) {
							case "INPUT":
								switch (e.elements[s].type) {
									case "hidden":
									case "text":
									case "password":
									case "number":
										e.elements[s].setAttribute("value", isList);
										break;
									case "checkbox":
									case "radio":
										!0 === isList && e.elements[s].setAttribute("checked", "true")
								}
								break;
							case "TEXTAREA":
								e.elements[s].setAttribute("value", isList);
								break;
							case "SELECT":
								switch (e.elements[s].type) {
									case "select-one":
										for (n = e.elements[s].options.length - 1; n >= 0; n -= 1) {
											c = e.elements[s].options[n], c.value === isList.toString() && c.setAttribute("selected", "true")
										}
										break;
									case "select-multiple":
										for (m = t[l].split(","), a = m.length - 1; a >= 0; a -= 1) {
											for (n = e.elements[s].options.length - 1; n >= 0; n -= 1) {
												c = e.elements[s].options[n], c.value === isList[m[a]].toString() && c.setAttribute("selected", "true")
											}
										}
								}
						}
					}
				}
			}
		}
	};

	function getkeyCode(k) {
		var keyCodes = {
			3: "break",
			8: "backspace / delete",
			9: "tab",
			12: "clear",
			13: "enter",
			16: "shift",
			17: "ctrl",
			18: "alt",
			19: "pause/break",
			20: "caps lock",
			27: "escape",
			28: "conversion",
			29: "non-conversion",
			32: "spacebar",
			33: "page up",
			34: "page down",
			35: "end",
			36: "home ",
			37: "left arrow ",
			38: "up arrow ",
			39: "right arrow",
			40: "down arrow ",
			41: "select",
			42: "print",
			43: "execute",
			44: "Print Screen",
			45: "insert ",
			46: "delete",
			48: "0",
			49: "1",
			50: "2",
			51: "3",
			52: "4",
			53: "5",
			54: "6",
			55: "7",
			56: "8",
			57: "9",
			58: ":",
			59: "semicolon (firefox), equals",
			60: "<",
			61: "equals (firefox)",
			63: "?",
			64: "@ (firefox)",
			65: "a",
			66: "b",
			67: "c",
			68: "d",
			69: "e",
			70: "f",
			71: "g",
			72: "h",
			73: "i",
			74: "j",
			75: "k",
			76: "l",
			77: "m",
			78: "n",
			79: "o",
			80: "p",
			81: "q",
			82: "r",
			83: "s",
			84: "t",
			85: "u",
			86: "v",
			87: "w",
			88: "x",
			89: "y",
			90: "z",
			91: "Windows Key / Left ? / Chromebook Search key",
			92: "right window key ",
			93: "Windows Menu / Right ?",
			96: "numpad 0 ",
			97: "numpad 1 ",
			98: "numpad 2 ",
			99: "numpad 3 ",
			100: "numpad 4 ",
			101: "numpad 5 ",
			102: "numpad 6 ",
			103: "numpad 7 ",
			104: "numpad 8 ",
			105: "numpad 9 ",
			106: "multiply ",
			107: "add",
			108: "numpad period (firefox)",
			109: "subtract ",
			110: "decimal point",
			111: "divide ",
			112: "f1 ",
			113: "f2 ",
			114: "f3 ",
			115: "f4 ",
			116: "f5 ",
			117: "f6 ",
			118: "f7 ",
			119: "f8 ",
			120: "f9 ",
			121: "f10",
			122: "f11",
			123: "f12",
			124: "f13",
			125: "f14",
			126: "f15",
			127: "f16",
			128: "f17",
			129: "f18",
			130: "f19",
			131: "f20",
			132: "f21",
			133: "f22",
			134: "f23",
			135: "f24",
			144: "num lock ",
			145: "scroll lock",
			160: "^",
			161: "!",
			163: "#",
			164: "$",
			165: "ù",
			166: "page backward",
			167: "page forward",
			169: "closing paren (AZERTY)",
			170: "*",
			171: "~ + * key",
			173: "minus (firefox), mute/unmute",
			174: "decrease volume level",
			175: "increase volume level",
			176: "next",
			177: "previous",
			178: "stop",
			179: "play/pause",
			180: "e-mail",
			181: "mute/unmute (firefox)",
			182: "decrease volume level (firefox)",
			183: "increase volume level (firefox)",
			186: "semi-colon / ?",
			187: "equal sign ",
			188: "comma",
			189: "dash ",
			190: "period ",
			191: "forward slash / ?",
			192: "grave accent / ? / ?",
			193: "?, / or °",
			194: "numpad period (chrome)",
			219: "open bracket ",
			220: "back slash ",
			221: "close bracket / ?",
			222: "single quote / ?",
			223: "`",
			224: "left or right ? key (firefox)",
			225: "altgr",
			226: "< /git >",
			230: "GNOME Compose Key",
			231: "?",
			233: "XF86Forward",
			234: "XF86Back",
			240: "alphanumeric",
			242: "hiragana/katakana",
			243: "half-width/full-width",
			244: "kanji",
			255: "toggle touchpad"
		};
		return keyCodes[k]
	}; // keycodes https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js
	function init() {
		if (typeof GM_getValue === 'function') {
			var firstrun = config.getValue('player_firstrun', true);
			var setting = config.read();
			adjustPlayer.init(firstrun, setting);
		} else {
			var firstrun = config.getValue('player_firstrun', true);
			var setting = config.read();
			Promise.all([firstrun, setting]).then(function (values) {
				adjustPlayer.init(values[0], values[1]);
			});
		}
	}
	init();
})();
