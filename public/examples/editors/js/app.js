/*
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Defines the startup sequence of the application.
 */

{

	/**
	 * Constructs a new application (returns an mxEditor instance)
	 */
	function createEditor(config) {
 
		var editor = null;
		var currentId = null;
		var targetCell = {};

		var hideSplash = function () {
			// Fades-out the splash screen
			var splash = document.getElementById('splash');
			// console.log(splash)
			if (splash != null) {
				try {
					mxEvent.release(splash);
					mxEffects.fadeOut(splash, 100, true);
				}
				catch (e) {
					splash.parentNode.removeChild(splash);
				}
			}
		};

		try {
			if (!mxClient.isBrowserSupported()) {
				mxUtils.error('Browser is not supported!', 200, false);
			}
			else {
				mxObjectCodec.allowEval = true;
				var node = mxUtils.load(config).getDocumentElement();

				editor = new mxEditor(node);
				mxObjectCodec.allowEval = false;

				// Adds active border for panning inside the container
				editor.graph.createPanningManager = function () {
					var pm = new mxPanningManager(this);
					pm.border = 30;

					return pm;
				};

				editor.graph.allowAutoPanning = true;
				editor.graph.timerAutoScroll = true;

				// Updates the window title after opening new files
				var title = document.title;
				var funct = function (sender) {
					document.title = title + ' - ' + sender.getTitle();
				};

				editor.addListener(mxEvent.OPEN, funct);

				// Prints the current root in the window title if the
				// current root of the graph changes (drilling).
				editor.addListener(mxEvent.ROOT, funct);
				funct(editor);

				// Displays version in statusbar
				editor.setStatus('mxGraph ' + mxClient.VERSION);
				console.log(editor.graph)

				// var keyHandler = new mxDefaultKeyHandler(editor);
				// keyHandler.bindAction(46, 'delete');



				editor.graph.addMouseListener(
					{
						cell: null,
						mouseDown: function (sender, me) {
							// alert('123')
						},
						mouseMove: function (sender, me) {
							var tmp = me.getCell();

							if (tmp != this.cell) {
								if (this.cell != null) {
									this.dragLeave(me.getEvent(), this.cell);
								}

								this.cell = tmp;

								if (this.cell != null) {
									this.dragEnter(me.getEvent(), this.cell);
								}
							}

							if (this.cell != null) {
								this.dragOver(me.getEvent(), this.cell);
							}
						},
						mouseUp: function (sender, me) { },
						dragEnter: function (evt, cell) {
							addFlag = setTimeout(function () {
								if (typeof targetCell.getId === 'undefined') {
									targetCell = cell;
								} else if (targetCell.getId() !== cell.getId()) {
									targetCell = cell;
								}

								showAdd(targetCell);
							}, 500)
							mxLog.debug('dragEnter', cell.value);
						},
						dragOver: function (evt, cell) {
							mxLog.debug('dragOver', cell.value);
						},
						dragLeave: function (evt, cell) {
							clearTimeout(addFlag);
							// document.querySelector('#add').style.display = 'none'
							mxLog.debug('dragLeave', cell.value);
						}
					});
				// Shows the application

				function showAdd(cell) {
					if (cell.getId() !== currentId && document.querySelector('#add').style.display !== 'block') {
						currentId = cell.getId();
						console.log('showAdd');
						document.querySelector('#add').style.display = 'block';
					}
				}

				document.querySelector('#addbtn').addEventListener('click', function () {
					// var list = document.createDocumentFragment();
					var _parent = document.querySelector('#clist')
					_parent.innerHTML = "";
					var temp = document.createElement('div');

					var template = editor.templates['symbol'];
					var clone = editor.graph.model.cloneCell(template);

					// console.log(clone)


					temp.addEventListener('click', function () {
						var userObject = new Object();
						var parent = editor.graph.getDefaultParent();
						var model = editor.graph.model;
						model.beginUpdate();
						try {

							var newCell = editor.graph.insertVertex(parent, null, clone, 20, 20, 32, 32, 'symbol;image=images/symbols/error.png');
							// editor.graph.insertVertex(parent, null, clone, 20, 20, 32, 32, 'symbol;image=images/symbols/error.png');
							// editor.graph.insertVertex(parent, null, clone, 20, 20, 32, 32, 'symbol;image=images/symbols/error.png');
							console.log(targetCell)
							var connect = editor.graph.insertEdge(parent, null, '', targetCell, newCell,'');
							console.log(connect)
						}
						finally {
							model.endUpdate();
							document.querySelector('#add').style.display = 'none';
						}
					})
					temp.innerHTML = '<img src="images/symbols/error.png" width="100%">'
					_parent.appendChild(temp);

					console.log(targetCell.getId())
				})
				hideSplash();
			}
		}
		catch (e) {
			hideSplash();

			// Shows an error message if the editor cannot start
			mxUtils.alert('Cannot start application: ' + e.message);
			throw e; // for debugging
		}

		return editor;
	}

}



