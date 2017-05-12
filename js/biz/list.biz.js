/**
 * 列表管理JS
 */
;(function($,window){
	var ListBiz = window.ListBiz = $.extend(true,window.Biz,{
		options: {
			subId: '',    // 子webview的ID
			subUrl: '',   // 子webview的URL
			pId: '',      // 父webview的ID
			pUrl: ''      // 父webview的URL
		},
		commonInit: function(){
			ListBiz._commonInitEles();
			ListBiz._commonBindEvent();
		},
		_commonInitEles: function(){
			// webview
			this.subWebview = null;
			this.pWebview = null;
			this.mainWebview = null;
			this.mask = mui.createMask();
			// 表格
			this.table = mui('#my_img_table');
			this.selAllStatus = false;
			// 按钮
			this.tableToolbar = mui('#grid_toolbar');     // 表格工具栏（长按图片时显示）
			this.selAllBtn = mui('#btn_select_all');      // 表格工具栏中的全选按钮
			this.delSelBtn = mui('#btn_del_selected');    // 表格工具栏中的删除按钮
			this.downloadSelBtn = mui('#btn_download_selected'); // 表格工具栏中的下载按钮
			this.closeToolbarBtn = mui('.back-toolbar');  // 关闭工具栏的按钮
		},
		_commonBindEvent: function(){
			var me = this;
			// 全选/取消全选按钮事件
			me.selAllBtn.on('tap','div',function(){
				mui.fire(me.getSubWebview(),'selOrUnSelImages');
			});
			// 删除选中按钮
			me.delSelBtn.on('tap','div',function(){
				mui.fire(me.getSubWebview(),'delSelected',{'confirm':true});
			});
			// 下载选中按钮
			me.downloadSelBtn.on('tap','div',function(){
				mui.fire(me.getSubWebview(),'downloadSelected');
			});
			// 关闭选择模式按钮事件
			me.closeToolbarBtn.on('tap','span',function(){
				mui.fire(me.getSubWebview(),'closeSelectMode');
				mui.fire(me.getSubWebview(),'unSelAllImages');
				me.setBackToolbarStatus('close'); // 关闭工具栏
			});
			// 更新全选/取消全选的字符信息
			window.addEventListener('updateSelText',function(evt){
				me.selAllBtn[0].querySelector('.mui-tab-label').innerText = evt.detail.text;
			});
			// 设置工具栏的状态（显示/不显示）
			window.addEventListener('setBackToolbarStatus',function(evt){
				var type = evt.detail.type;
				me.setBackToolbarStatus(type);
			});
			// 选中/取消选中事件
			window.addEventListener('selOrUnSelImages',function(evt){
				me.selOrUnSelImages();
			});
			// 删除选中事件
			window.addEventListener('delSelected',function(evt){
				me.delSelected();
			});
			// 下载选择事件
			window.addEventListener('downloadSelected',function(evt){
				me.downloadSelected();
			});
			// 关闭表格的选择模式事件
			window.addEventListener('closeSelectMode',function(evt){
				me.table.imgGrid('closeSelectMode');
			});
			// 选择所有事件
			window.addEventListener('selAllImages',function(evt){
				me.selAllImages();
			});
			// 取消选择所有事件
			window.addEventListener('unSelAllImages',function(evt){
				me.unSelAllImages();
			});
		},
		// 设置工具栏样式
		setBackToolbarStatus: function(type){
			if(type == 'show'){
				this.tableToolbar[0].classList.remove('none'); // 显示
			}else{
				this.tableToolbar[0].classList.add('none');    // 隐藏 
			}
		},
		// 全选/取消全选的处理方法
		selOrUnSelImages: function(ele){
			var me = this;
			if(me.selAllStatus){
				me.unSelAllImages(ele);
			}else{
				me.selAllImages(ele);
			}
		},
		// 全选的处理方法
		selAllImages: function(ele){
			this.table.imgGrid('selectAll');
			this.selAllStatus = true;
			mui.fire(this.getPWebview(),'updateSelText',{text:'取消全选'});
		},
		// 取消全选的处理方法
		unSelAllImages: function(ele){
			this.table.imgGrid('unSelectAll');
			this.selAllStatus = false;
			mui.fire(this.getPWebview(),'updateSelText',{text:'全选'});
		},
		// 删除选中的方法
		delSelected: function(){
		},
		// 下载选中
		downloadSelected: function(){
		},
		// 获取子webview
		getSubWebview: function(){
			if(this.subWebview){
				return this.subWebview;
			}else{
				return plus.webview.getWebviewById(this.options.subId);
			}
		},
		// 获取父webview
		getPWebview: function(){
			if(this.pWebview){
				return this.pWebview;
			}else{
				return plus.webview.getWebviewById(this.options.pId); 
			}
		},
		// 获取主webview
		getMainWebview: function(){
			if(this.mainWebview){
				return this.mainWebview;
			}else{
				return plus.webview.getWebviewById(App.webviews.main.id);
			}
		},
		onPreviewOpen: function(index){
			// 设置父webview的样式，使全屏预览
			plus.navigator.setFullscreen(true);
			ListBiz.getPWebview().setStyle({'top':'0','bottom':'0'});
			plus.webview.currentWebview().setStyle({'top':'0','bottom':'0'});
//			ListBiz.getPWebview().setStyle({'top':'0','bottom':'-51'});
//			plus.webview.currentWebview().setStyle({'top':'51','bottom':'0'});
		}, 
		onPreviewClose: function(index){
			// 设置父webview的样式，还原webview的样式
			plus.navigator.setFullscreen(false); 
			ListBiz.getPWebview().setStyle({'top':'44','bottom':'51'});
			plus.webview.currentWebview().setStyle({'top':'0','bottom':'38'});
//			ListBiz.getPWebview().setStyle({'top':'44','bottom':'102'});
//			plus.webview.currentWebview().setStyle({'top':'0','bottom':'38'});
		},
	}); 
})(mui,window);
