/**
 * 自定义图片表格插件
 */
;(function(mui){
	// 图片表格插件构造器
	function imgGrid(ele,opts){
		this.container = this.ele = ele[0];
		this.options = mui.extend({},this.defaultOptions,opts);
		this._init();
		return this;
	}
	// 对象原型
	var imgGridPt = imgGrid.prototype; 
	// 默认参数选项（可覆盖）
	imgGridPt.defaultOptions = {
		data: '',                         // 表格数据
		showTitle: true,                  // 是否显示图片名称（标题），默认false，不显示
		idField: 'id',                    // ID唯一标示取值字段 
		titleField: 'name',               // 图片标题取值字段
		urlField: 'url',                  // 图片路径取值字段
		backUrlField: 'backUrl',          // 备用图片路径取值字段
		imgProps:{},                      // 自定义图片元素上的属性,key:自定义属性的名称,value:自定义属性的取值字段名,{'attrName':'valueField','p2':'v2'} 
		showEmptyMsg: true,               // 是否显示空数据的消息        
		onImgTap: function(){},           // 图片点击事件
		onImgLongTap: function(){},       // 图片长按屏幕事件
		onCheckStatusChange: function(){},// 表格中选中状态发生变化时
		onLoaded: function(datas){},      // 加载完成后 
		onOpenSelectMode: function(){},   // 打开选择模式后
		onCloseSelectModel: function(){}, // 关闭选择模式后
		onDataChange: function(){},       // 当表格中的数据变化时触发（增加、删除触发）
	};
	// 默认配置项（不可覆盖）
	imgGridPt.config = {
		'tableCls': 'ui-img-table',       // 表格容器元素类名
		'rowCls': 'ui-img-row',           // 表格行元素类名
		'cellCls': 'ui-img-cell',         // 表格列元素类名
		'cellCheckedCls': 'checked',      // 选中时添加的类名
		'cellOpenCheckCls': 'open-check', // 打开选择按钮的类名
		'imgTitleCls': 'title',           // 图片标题元素类名 
		'titleShowCellCls': 'show-title', // 显示标题时的列元素的类名,
		'itemIdPrefix': 'img_grid_id_',       // ID前缀
		'idDataName': 'data-id',          // ID值 
		'checkBtnCls': 'mui-icon app-icon icon-check3 check-btn',
		'completeFlagCls': 'mui-icon app-icon icon-wancheng1 complete',
		'completeFlagSelector': 'complete',
		'failFlagCls': 'mui-icon app-icon icon-shibai2 fail',
		'failFlagSelector': 'fail',
		'emptyContentCls': 'empty',       // 空表格的类名称
		'emptyContentText': '<div><i class="mui-icon app-icon icon-faceunhappy"></i><div>没有找到数据</div></div>',  
		'rowDataCacheName':'rowData',     // 行数据缓存名称
		'progressbarCls': 'ui-img-progressbar', // 进度条的类名
		'changeTypeAdd': 'add',                 // 数据改变类型:增加 
		'changeTypeRemove': 'remove',           // 数据改变类型:移除 
	};
	imgGridPt._ObjectDataHolder = {
	};
	// 初始化
	imgGridPt._init = function(){
		// 是否已经初始化过了
		var initialized = this.container.dataset.initialized;
		// 如果初始化过了，则需要销毁后重新初始化
		if(initialized){
			this.destory();
		}
		this.container.dataset.initialized = true;
		// 开始创建
		this._initGrid();
		// 缓存当前对象
		var key = new Date().getTime() + '_' + Math.random(100);
		this.container.dataset['ThisKey'] = key;
		imgGridPt._ObjectDataHolder = {};
		imgGridPt._ObjectDataHolder[key] = this;
	};
	imgGridPt._initGrid = function(){
		// 创建基础元素
		this._createBaseElements();
		// 创建数据体元素
		this._createBodyElements();
		// 绑定事件
		this._bindEvent();
	};
	imgGridPt._createBaseElements = function(){
		// 设置表格容器class
		this.container.classList.add(this.config.tableCls);
		var li = document.createElement('li');
		// 添加样式
		li.classList.add(this.config.rowCls);
		this.liElement = li;
		this.container.appendChild(li);
	};
	imgGridPt._createBodyElements = function(){
		var rows = this.options.data || [];
		this._createImgItemElements(this.options.data);
	};
	imgGridPt._createImgItemElements = function(rows){
		rows = rows || [];
		if((!rows || !rows.length) && this.options.showEmptyMsg){
			this._createEmptyContent();
		}else{
			for(var i=0;i<rows.length;i++)
			{
				this._createImgItemElement(rows[i],i); 
			}
		}
		// 触发onLoaded事件
		if(typeof this.options.onLoaded == 'function'){
			this.options.onLoaded.call(this,rows);
		}
		// 触发数据改变事件
		this._triggerDataRemoveChangeEvent(this.config.changeTypeAdd,rows);
	};
	imgGridPt._createEmptyContent = function(){
		var div = document.createElement('div');
		div.innerHTML = this.config.emptyContentText;
		div.classList.add(this.config.emptyContentCls);
		this.liElement.appendChild(div);
	};
	imgGridPt._createImgItemElement = function(row){
		var me = this,opts = this.options,cellEle,titleEle,imgEle,checkEle;
		// 1 创建列元素
		cellEle = document.createElement('div');	
		cellEle.classList.add(this.config.cellCls);
		// 如果要显示标题，则需要添加显示标题的类
		if(opts.showTitle){
			cellEle.classList.add(this.config.titleShowCellCls);
		}
		// 数据缓存
		cellEle.dataset[this.config.rowDataCacheName] = JSON.stringify(row);
		cellEle.setAttribute('id',me.config.itemIdPrefix + row[opts.idField]);
		cellEle.setAttribute(me.config.idDataName,row[opts.idField]);
		// 2 创建标题元素
		titleEle = document.createElement('div');
		titleEle.classList.add(this.config.imgTitleCls);
		titleEle.innerHTML = row[opts.titleField];
		// 3 创建图片元素
		imgEle = document.createElement('img');
		// 3.1 设置图片元素的属性
		this._setImgProperties(row,imgEle,opts);
		// 4 创建图片选择元素
		checkEle = document.createElement('span');
//		checkEle.classList.add(this.config.checkBtnCls);
		checkEle.className = this.config.checkBtnCls;
		// 5 添加到表格容器中
		// 如果要显示图片的标题时，则添加标题元素，否则不添加
		if(opts.showTitle){
			cellEle.appendChild(titleEle);
		}
		cellEle.appendChild(imgEle);
		cellEle.appendChild(checkEle);
		this.liElement.appendChild(cellEle);
		//6 绑定事件
		// 图片区域长按事件（如果是ios环境或android环境，则是长按事件，否则为双击事件）
		imgEle.addEventListener((mui.os.ios || mui.os.android) ? 'longtap' : 'dblclick',function(evt){
			me._onImgLongTapEvent(this);
		});
		// 选择按钮点击事件
		checkEle.addEventListener('tap',function(evt){
			// 切换选中状态
			this.parentNode.classList.toggle(me.config.cellCheckedCls);
			// 触发选择状态改变事件
			me._triggerCheckStatusChangeEvent(this);
		},false);
	};
	imgGridPt._setImgProperties = function(row,imgEle,opts){
		// 公共属性
		imgEle.setAttribute('src',row[opts.urlField]);
		imgEle.setAttribute('name',row[opts.titleField]);
		// 自定义属性
		for(var prop in opts.imgProps){
			if(!prop){
				return;
			}
			imgEle.setAttribute(prop,row[opts.imgProps[prop]]);
		}
	};
	imgGridPt._onImgLongTapEvent = function(imgEle){
		// 所有的列都显示选择按钮
		this.openSelectMode();
		// 选中自己
		imgEle.parentNode.classList.add(this.config.cellCheckedCls);
		// 触发选择状态改变事件
		this._triggerCheckStatusChangeEvent(imgEle);
		// 触发长按事件
		if(typeof this.options.onImgLongTap == 'function'){
			this.options.onImgLongTap.call(this,imgEle);
		}
	};
	imgGridPt._triggerCheckStatusChangeEvent = function(targetEle){
		if(typeof this.options.onCheckStatusChange == 'function'){
			this.options.onCheckStatusChange.call(this,targetEle);
		}
	};
	imgGridPt._bindEvent = function(){
	};
	imgGridPt._getDataByCells = function(cells){
		var rows = [];
		for(var i=0;i<cells.length;i++){
			rows.push(JSON.parse(cells[i].dataset[this.config.rowDataCacheName]));
		}
		return rows;
	};
	imgGridPt._getCellEles = function(){
		return this.container.querySelectorAll('.' + this.config.cellCls);
	};
	// 销毁表格
	imgGridPt.destory = function(){
		this.container.innerHTML = '';
		this.container.dataset.initialized = false;
		this.container.classList.remove(this.config.tableCls);
		this._ObjectDataHolder = {};
	};
	// 加载数据
	imgGridPt.loadData = function(rows){
		this.liElement.innerHTML = '';
		this._createImgItemElements(rows);
	};
	// 获取表格的所有数据
	imgGridPt.getRows = function(){
		var cells = this._getCellEles();
		return this._getDataByCells(cells);
	};
	// 获取选中的图片数据
	imgGridPt.getSelectedRows = function(){
		var cells = this.container.querySelectorAll('.' + this.config.cellCls 
			+ '.' + this.config.cellCheckedCls);
		return this._getDataByCells(cells);
	};
	// 添加多个条目
	imgGridPt.addItems = function(rows){
		rows = rows || [];
		this._createImgItemElements(rows);
	};
	// 添加单个条目
	imgGridPt.addItem = function(row){
		row = row || {};
		this._createImgItemElement(row);
	};
	// 删除选中
	imgGridPt.removeSelected = function(){
		var cells = this._getCellEles(),
			selRows = this.getSelectedRows();
		for(var i=0;i<cells.length;i++){
			if(cells[i].classList.contains(this.config.cellCheckedCls)){
				cells[i].remove();
			}
		}
		this._triggerDataRemoveChangeEvent(this.config.changeTypeRemove,selRows);
	};
	// 删除所有
	imgGridPt.removeAll = function(){
		var cells = this._getCellEles(),
			allRows = this.getRows();
		for(var i=0;i<cells.length;i++){
			cells[i].remove();
		}
		this._triggerDataRemoveChangeEvent(this.config.changeTypeRemove,allRows);
	};
	// 触发数据删除的变化事件
	imgGridPt._triggerDataRemoveChangeEvent = function(type,rows){
		if(typeof this.options.onDataChange == 'function'){
			this.options.onDataChange.call(this,type,rows);
		}
	};
	// 选中所有
	imgGridPt.selectAll = function(){
		var cells = this._getCellEles();
		for(var i=0;i<cells.length;i++){
			if(!cells[i].classList.contains(this.config.cellOpenCheckCls)){
				cells[i].classList.add(this.config.cellOpenCheckCls);
			}
			cells[i].classList.add(this.config.cellCheckedCls);
		}
	};
	// 取消所有选中
	imgGridPt.unSelectAll = function(){
		var cells = this._getCellEles();
		for(var i=0;i<cells.length;i++){
			cells[i].classList.remove(this.config.cellCheckedCls);
		}
	};
	// 打开选择模式
	imgGridPt.openSelectMode = function(){
		var cells = this._getCellEles();
		for(var i=0;i<cells.length;i++){
			cells[i].classList.add(this.config.cellOpenCheckCls);
		}
		// 触发事件
		if(typeof this.options.onOpenSelectMode == 'function'){
			this.options.onOpenSelectMode.call(this);
		}
	};
	// 关闭选择模式
	imgGridPt.closeSelectMode = function(){
		var cells = this._getCellEles();
		for(var i=0;i<cells.length;i++){
			cells[i].classList.remove(this.config.cellOpenCheckCls);
		}
		// 触发事件
		if(typeof this.options.onCloseSelectMode == 'function'){
			this.options.onCloseSelectMode.cal(this);
		}
	};
	// 获取当前的选择模式，true:打开,false:关闭
	imgGridPt.getSelectMode = function(){
		var cells = this._getCellEles();
		if(cells && cells.length){
			return cells[0].classList.contains(this.config.cellOpenCheckCls);
		}
		return false;
	};
	// 给指定条目增加进度条
	imgGridPt.addProgressbar = function(itemId){
		var item = this._getImageItemByItemId(itemId),
			progressEle = item.querySelector('p.' + this.config.progressbarCls);
		if(!progressEle){
			progressEle = document.createElement('p');
			progressEle.classList.add(this.config.progressbarCls); 
			progressEle.classList.add('mui-progressbar');
			progressEle.classList.add('mui-progressbar-infinite');
			item.appendChild(progressEle);
		}
	}; 
	// 移除指定的条目的进度条
	imgGridPt.removeProgressbar = function(itemId){
		var item = this._getImageItemByItemId(itemId);
		if(!item){
			return false;
		}
		var p = item.querySelector('p.' + this.config.progressbarCls);
		if(p){
			p.remove();
		}
	};
	// 移除所有进度条
	imgGridPt.removeAllProgressbar = function(){
		var cells = this.container.querySelector('.' + this.config.rowCls)
			.querySelectorAll('.' + this.config.cellCls);
		if(!cells || !cells.length){
			return false;
		}
		var bar;
		for(var i=0;i<cells.length;i++){ 
			p = cells[i].querySelector('p.' + this.config.progressbarCls);
			if(p){
				p.remove();
			}
		}
	};
	imgGridPt._getImageItemByItemId = function(itemId){
		return this.container.querySelector('.' + this.config.rowCls)
			.querySelector('#' + this.config.itemIdPrefix + itemId);
	};
	imgGridPt.addCompleteFlag = function(itemId){
		var item = this._getImageItemByItemId(itemId);
		if(!item){
			return false;
		}
		var failEle = item.querySelector('span.' + this.config.failFlagSelector);
		if(failEle){  // 添加完成标识时移除失败标识（如果有）
			failEle.remove();
		}
		var completeEle = item.querySelector('span.' + this.config.completeFlagSelector);
		if(!completeEle){
			completeEle = document.createElement('span');
			completeEle.className = this.config.completeFlagCls;
			item.appendChild(completeEle);
		}
	};
	imgGridPt.removeCompleteFlag = function(itemId){
		var item = this._getImageItemByItemId(itemId);
		if(!item){
			return false; 
		}
		var span = item.querySelector('span.' + this.config.completeFlagSelector);
		if(span){ 
			span.remove();
		}
	};
	imgGridPt.addFailFlag = function(itemId){
		var item = this._getImageItemByItemId(itemId);
		if(!item){
			return false;
		}
		var completeEle = item.querySelector('span.' + this.config.failFlagSelector);
		if(completeEle){  // 添加失败标识时移除完成标识（如果有）
			completeEle.remove();
		}
		var failEle = item.querySelector('span.' + this.config.failFlagSelector);
		if(!failEle){
			failEle = document.createElement('span');
			failEle.className = this.config.failFlagCls;
			item.appendChild(failEle);
		}
	};
	imgGridPt.removeFailFlag = function(itemId){
		var item = this._getImageItemByItemId(itemId);
		if(!item){
			return false; 
		}
		var span = item.querySelector('span.' + this.config.failFlagSelector);
		if(span){ 
			span.remove();
		}
	};
	// 扩展mui的方法
	mui.fn.imgGrid = function(args){
		if(typeof args == 'string' 
			&& args.indexOf('_') != 0
			&& imgGridPt[args]  
			&& typeof imgGridPt[args] == 'function'){
			var key = this[0].dataset.ThisKey;
			var THIS = imgGridPt._ObjectDataHolder[key];
			if(!THIS)
			{
				return;
			}	
			if(!this[0].dataset.initialized){
				throw '表格插件还没有被初始化，请先初始化后再调用方法，初始化方法如：mui("#table").imgGrid(options)';
			}
			return imgGridPt[args].apply(THIS,Array.prototype.slice.call(arguments, 1));
		}else if(typeof args == 'object'){
			return new imgGrid(this,args);
		}else{
			throw "img grid not support the arguments:" + args;
		}
	};
})(mui);
