/**
 * 公共业务JS
 */
;(function($,Biz){
	// 配置项
	Biz.options = {
		defaultGridNum: '40',  // 默认表格数据条数
	};
	Biz.ready = function(){
		Biz._init(); // 自身初始化
		if(typeof Biz.commonInit == 'function'){
			Biz.commonInit();
		}
		if(typeof Biz.init == 'function'){
			Biz.init();
		}
	};
	// 子对象初始化（可覆盖）
	Biz.init = function(){
	};
	// 公共初始化
	Biz.commonInit = function(){
		this._initEles();
		this._bindEvent();
	};
	// 自身初始化
	Biz._init = function(){
	};
	// 初始化元素
	Biz._initEles = function(){
		
	}
	// 绑定事件
	Biz._bindEvent = function(){
		
	};
})(mui,window.Biz = {});
