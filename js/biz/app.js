/**
 * 应用公共管理JS
 * author ltlwill
 */
;(function($){
	var App = window.App = {};
	// 应用启动标识
	App.lauchFlag = 'lauchFlag';
	// 应用主要webview成员
	App.webviews = {
		index: {id:'index',url:'index.html'},                       			// 应用入口
		main: {id:'main',url:'main.html'},                         				// 应用主页
		guide: {id:'pages/guide.html',url:'pages/guide.html'},      			// 应用指导页 
		home: {id:'pages/home.html',url:'pages/home.html'},            			// 应用首页
		search: {id:'pages/search.html',url:'pages/search.html'},               // 应用查询功能页
		searchList: {id:'pages/search_list.html',url:'pages/search_list.html'}, // 应用查询功能的子列表页
		upload: {id:'pages/upload.html',url:'pages/upload.html'},   			// 应用上传功能页
		uploadList: {id:'pages/upload_list.html',url:'pages/upload_list.html'}, // 应用上传功能的子列表页
		setting: {id:'pages/setting.html',url:'pages/setting.html'},			// 应用设置功能页 
		feedback: {id:'feedback.html',url:'feedback.html'},                     // 应用问题反馈功能页
		userDetail: {id:'userDetail.html',url:'userDetail.html'},               // 应用问题反馈功能页
		login: {id:'pages/login.html',url:'pages/login.html'},                  // 应用用户登录页
	};
	// 应用请求地址管理
	App.Server = {};
	App.Server.host = 'http://image.hengzhiyi.cn'; // 正式环境
	App.Server.contextPath = '';                   // 正式环境 
//	App.Server.host = 'http://192.168.2.34:8088';  // 测试环境
//	App.Server.contextPath = '/pic';               // 测试环境
	App.Server.address = App.Server.host + App.Server.contextPath + '/app'; 
	// 应用常量定义
	App.Constants = { 
		TOKEN_INVLID_CODE: '10001',   // token失效
		NETWORK_ERROR_CODE:'10002',   // 网络错误
		USER_OR_PWD_ERROR: '2002',    // 用户名密码错误
		NON_WORKIING_TIME: '2003',    // 非工作时间登录错误
		REQUEST_SUCCESS_RESULT_CODE: '0',    // 请求成功的结果码
		TOKEN_NAME:'app_user_token',  // 用户token
		USER: 'app_user', // 用户
		SYS_SETTINGS: 'sys_settings', // 系统设置
		IMAGE_GRID_SETTINGS: 'image_grid_settings', // 图片列表设置
	}; 
	// 创建URL（自动拼接当前的域名和上下文） 
	App.createUrl = function(url){
		url = url ? (url.indexOf('/') == 0 ? url : '/' + url) : '';
		return App.Server.address + url;
	};
	// 获取公共的请求参数（如token等信息）
	App.getCommonParams = function(){
		return {'token': App.getToken(),'deviceid': plus.device.uuid};
	};
	// 是否为移动终端
	App.isMobile = function(){
		if($.os.android || $.os.ios){
			return true;
		}
		return false;
	};
	// 获取token
	App.getToken = function(){
		return localStorage.getItem(App.Constants.TOKEN_NAME);
	};
	// 存储token
	App.setToken = function(token){
		localStorage.setItem(App.Constants.TOKEN_NAME,token);
	};
	// 清除token信息
	App.removeToken = function(){
		localStorage.removeItem(App.Constants.TOKEN_NAME);
	};
	// 存储图片列表设置 
	App.setImageGridSettings = function(settings){
		localStorage.setItem(App.Constants.IMAGE_GRID_SETTINGS,JSON.stringify(settings));
	};
	// 获取图片列表设置
	App.getImageGridSettigns = function(){ 
		var text = localStorage.getItem(App.Constants.IMAGE_GRID_SETTINGS);
		return JSON.parse(text || '{}');
	};
	// 保存用户信息
	App.setUserInfo = function(user){
		localStorage.setItem(App.Constants.USER,JSON.stringify(user || {}));
	};
	// 获取保存的当前用户
	App.getUserInfo = function(){
		var userStr = localStorage.getItem(App.Constants.USER);
		return JSON.parse(userStr || '{}');
	};
	// 更新token信息
	App.refreshTokenInfo = function(){
		$.doGet(App.createUrl('/refreshTokenInfo'),{},function(data){
			data = data || {};
			App.setUserInfo(data.user || {});
			App.setSysSettings(data.sysSettings || []);
			if(data.validateResult == false){
				mui.alert('非工作时间，不允许登录使用', '消息', function() {
					// 打开用户登录界面
					mui.fire(plus.webview.getLaunchWebview(),'openLogin',{'type':'loginout'});
				});
			}
		},function(){},{'silent':true});
	};
	// 获取系统设置
	App.getSysSettings = function (){
		var text = localStorage.getItem(App.Constants.SYS_SETTINGS);
		return JSON.parse(text || '[]');
	},
	// 设置系统设置
	App.setSysSettings = function(setings){
		localStorage.setItem(App.Constants.SYS_SETTINGS,JSON.stringify(setings || []));
	},
	// 请求系统设置
	App.requestSysSettings = function(callback){
		mui.doGet(App.createUrl('/getSysSettings'),{},function(result){
			result = result || [];
			if(typeof result == 'string'){
				result = JSON.parse(result || '[]');
			}
			App.setSysSettings(result);
			if(typeof callback == 'function'){
				callback.call(this,result);
			}
		},function(){},{'silent':true});
	},
	// 升级APP
	App.checkOrUpdateApp = function(auto){
		mui.doGet(App.Server.host + '/appspace/update.json?_r' + Math.random(),{},function(result){
			result = (typeof result == 'string') ? JSON.parse(result || '{}') : (result || {});
			var desc = {},version;
			if(mui.os.ios){
				desc = result.ios || {};
			}else if(mui.os.android){
				desc = result.android || {};
			}
			version = desc.version || result.version;
			if((result.status && desc.status) && (version != plus.runtime.version)){
				/*plus.nativeUI.confirm(desc.note || result.note, function(evt) {
					if (0 == evt.index) {
						console.log('url:' + desc.url);
						plus.runtime.openURL(desc.url,function(){
							mui.toast('升级失败');
						});
					}
				}, desc.title || result.title || '发现新版本', ["立即更新", "取　　消"]);*/
				var btnArray = ['确定','取消'];
				mui.confirm(desc.note || result.note,desc.title || result.title || '发现新版本', btnArray, function(e) {
					if (e.index == 0) { // 更新
						// 非WIFI环境下提醒用户
						if(plus.networkinfo.getCurrentType() != plus.networkinfo.CONNECTION_WIFI){
							mui.confirm('您当前使用的是移动网络,可能会产生流量费,确定要更新吗?','',['确定','取消'],function(e1){
								if(e1.index == 0){
									App._doDownloadAppUpdateApplication(desc.url || '');
								}
							});
						}else{ // 直接下载升级
							App._doDownloadAppUpdateApplication(desc.url || '');
						}
					}
				});
			}else if(!auto){  // 如果是手动检查更新且已经是最新版本
				mui.toast('已经是最新版本');
			}
		},function(th,ex){
			!auto ? mui.toast('检查失败') : '';
		},{'silent':auto ? true : false,'dataType':'text'});
	};
	// 下载APP的升级程序
	App._doDownloadAppUpdateApplication = function(url){
		plus.runtime.openURL(url,function(){
			mui.toast('升级失败');
		});
	},
	// 沉浸式
	App.Immersed = {
		exec: function(){
			return (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
		},
		// 是否为沉浸式
		isImmersed: function(){
			var ms = this.exec();
			return ms && ms.length >= 3;
		},
		// 获取状态栏高度
		getStatusBarHeight: function(){
			var ms = this.exec();
			return (ms && ms.length >= 3) ? parseFloat(ms[2]) : 0;
		}
	};
	/**自定义数组工具***/
	$.Arrays = {
		// 判断是否包含在数组里
		contains: function(arr,key){
			arr = arr || [];
			for(var i=0;i<arr.length;i++){
				if(arr[i] == key){
					return true;
				}
			}
			return false;
		},
		// 数组复制（重新生成新的数组对象，不指向同一个内存地址）
		copy: function(srcArr){
			var destArr = [];
			srcArr = srcArr || [];
			for(var i=0;i<srcArr.length;i++){
				destArr.push(srcArr[i]);
			}
			return destArr;
		}
	};
	/*******自定义AJAX请求*******/
	// 定义doAjax请求
	$.doAjax = function(url,options,config){
		var opts = $.extend(true,{},$._ajaxDefaultOptions,options,config || {});
		$.ajax(url,{ 
			dataType:opts.dataType || 'json',
			type: opts.type || 'GET', 
			data: $.extend({},opts.data,App.getCommonParams()), 
			crossDomain: true,    
			async: (typeof opts.async == 'undefined') ? true : opts.async,
			timeout: (typeof opts.timeout == 'undefined' ? 5000 : opts.timeout),
			success: function(data,status,xhr){
				// 回调success函数
				if($.isFunction(opts.success)){
					opts.success(data,status,xhr);
				}
			},
			error: function(xhr,type,errorThrown){
				// 如果是用户验证失效
				if(xhr.responseText == App.Constants.TOKEN_INVLID_CODE){
					if(!opts.silent){  // 如果是静默请求，则不需要提示
						mui.alert('您的身份已失效，请重新登录', '消息', function() {
							// 打开用户登录界面
							mui.fire(plus.webview.getLaunchWebview(),'openLogin');
						});
					}
					return false;
				}
				// 回调error函数
				if($.isFunction(opts.error)){
					opts.error(xhr,type,errorThrown);
				}
			},
			beforeSend: function(xhr,options){
				if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE){
					mui.toast('网络不可用，请检查网络设置');
					return false;
				}
				if($.isFunction(opts.beforeSend)){
					opts.beforeSend(xhr,options);
				}
			},
			complete: function(xhr,status){
				if($.isFunction(opts.complete)){
					opts.complete(xhr,status);
				}
			}
		});
	};
	// 自定义get请求
	$.doGet = function(url,params,success,error,config){
		$.doAjax(url,{type:'GET',data:params || {},success:success,error:error},config);
	};
	// 自定义post请求
	$.doPost = function(url,params,success,error,config){
		$.doAjax(url,{type:'POST',data:params || {},success:success,error:error},config);
	};
	// 自定义ajax的默认设置(用于用户覆盖回调)
	$._ajaxDefaultOptions = {
		/**
		 * 请求成功回调函数
		 * @param {Object} data 返回的数据
		 * @param {Object} status 状态
		 * @param {Object} xhr 响应实体
		 */
		success: function(data,status,xhr){
		},
		/**
		 *  请求失败回调函数
		 * @param {Object} xhr 响应实体
		 * @param {Object} type 类型
		 * @param {Object} ex 错误信息
		 */
		error: function(xhr,type,ex){
		},
		/**
		 * 请求前回调函数
		 * @param {Object} xhr 响应实体
		 * @param {Object} options 选项
		 */
		beforeSend: function(xhr,options){
		},
		/**
		 * 请求结束（无论请求失败还是成功都执行）回调函数
		 * @param {Object} xhr 响应实体
		 * @param {Object} status 状态
		 */
		complete: function(xhr,status){
		}
	};
})(mui);
