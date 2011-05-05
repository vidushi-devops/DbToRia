/* ************************************************************************

   Copyrigtht: OETIKER+PARTNER AG
   License:    GPL
   Authors:    Tobias Oetiker
               Fritz Zaucker

   Utf8Check:  äöü

   $Id: AdminEditor.js 333 2010-10-05 20:07:53Z oetiker $

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/16/actions/go-first.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-last.png)
************************************************************************ */

// FIX ME:
//   - documentation

/**
 * Popup window for editing a database record.
 */
qx.Class.define("dbtoria.module.database.RecordEdit", {
    extend : dbtoria.module.desktop.Window,

    construct : function(tableId, tableName, readOnly) {
        this.base(arguments);
        this.__tableId   = tableId;
        this.__tableName = tableName;
        this.__readOnly  = readOnly;

        var maxHeight = qx.bom.Document.getHeight() - 100;
        this.addListener("appear",  function(e) {
            var maxHeight = qx.bom.Document.getHeight() - 100;
            this.setHeight(maxHeight);
        }, this);

        this.set({
            showMinimize         : true,
            showClose            : true,
            contentPaddingLeft   : 20,
            contentPaddingRight  : 20,
            contentPaddingTop    : 20,
            contentPaddingBottom : 10,
            layout               : new qx.ui.layout.VBox(10),
            minWidth             : 400,
//             maxHeight           : maxHeight,
            height           : maxHeight,
            allowGrowX : true,
            allowGrowY : true
        });

        var scrollContainer = new qx.ui.container.Scroll();
        scrollContainer.set({
            allowGrowX: true,
            allowGrowY: true
        });
        this.__scrollContainer = scrollContainer;
        this.add(scrollContainer, { flex: 1 });

        this.__rpc = dbtoria.data.Rpc.getInstance();
        this.__rpc.callAsyncSmart(qx.lang.Function.bind(this._fillForm, this), 'getEditView', tableId);
        this.moveTo(300, 40);


        this.add(this.__createNavigation(readOnly));

        // this.addListener("close", function(e) {
        //      this.close();
        // }, this);

        this.addListener('keyup', function(e) {
            if (e.getKeyIdentifier() == 'Enter') {
                this.ok();
            }
            if (e.getKeyIdentifier() == 'Escape') {
                this.cancel();
            }
        },this);

    },

    events: {
        "saveRecord" : "qx.event.type.Data",
        "navigation"  : "qx.event.type.Data",
        "refresh"     : "qx.event.type.Data"
    }, // events

    members : {
        __formModel       : null,
        __form            : null,
        __scrollContainer : null,
        __tableId         : null,
        __tableName       : null,
        __recordId        : null,
        __rpc             : null,
        __readOnly        : null,

        cancel: function() {
            this.__form.setFormDataChanged(false); // abort, don't save afterwards
            this.close();
        },

        // __closeHandler: function(e) {
        //     var ret = e.getData();
        //     this.debug('__closeHandler(): ret='+ret);
        //     switch (ret) {
        //     case 'failed':
        //     case 'invalid':
        //         break;
        //     case 'succeeded':
        //         this.fireEvent('refresh');
        //     case null:
        //         this.close();
        //         break;
        //     }
        // },

        // close: function() {
        //     if (false) {
        //         this.base.close(arguments);
        //     }
        //     var that=this;
        //     var handler = function(arguments) {
        //         that.base(arguments);
        //     };
        //     var mbox = dbtoria.ui.dialog.MsgBox.getInstance();
        //     mbox.warn(this.tr('Unsaved data.'),
        //               this.tr('Do you really want to close the edit form and loose your changes?'),
        //               handler);
        // },

        __okHandler: function(e) {
            var ret = e.getData();
            this.debug('__okHandler(): ret='+ret+', recordId='+this.__recordId);
            switch (ret) {
            case 'failed':
            case 'invalid':
                break;
            case 'succeeded':
              this.fireDataEvent('refresh', this.__recordId);
            case null:
                this.close();
                break;
            }
        },

        ok: function() {
            this.addListenerOnce('saveRecord', qx.lang.Function.bind(this.__okHandler, this), this);
            this.saveRecord();
        },

        __applyHandler: function(e) {
            var ret = e.getData();
            this.debug('__applyHandler(): ret='+ret+', recordId='+this.__recordId);
            switch (ret) {
            case 'failed':
            case 'invalid':
                break;
            case 'succeeded':
                this.fireDataEvent('refresh', this.__recordId);
            case null:
                break;
            }
        },

        apply: function() {
            this.addListenerOnce('saveRecord', qx.lang.Function.bind(this.__applyHandler, this), this);
            this.saveRecord();
        },

        __createButton: function(icon, tooltip, target) {
            var btn = new dbtoria.ui.form.Button(null, icon, tooltip);
            btn.addListener('execute', function() {
                this.fireDataEvent('navigation', target);
            }, this);
            btn.setMinWidth(null);
            return btn;
        },

        __createNavigation: function(readOnly) {
            var btnFirst = this.__createButton("icon/16/actions/go-first.png",
                                               this.tr("Jump to first record"),  'first');
            var btnBack  = this.__createButton("icon/16/actions/go-previous.png",
                                               this.tr("Go to previous record"), 'back');
            var btnNext  = this.__createButton("icon/16/actions/go-next.png",
                                               this.tr("Go to next record"),     'next');
            var btnLast  = this.__createButton("icon/16/actions/go-last.png",
                                               this.tr("Jump to last record"),   'last');
            if (!readOnly) {
                var btnNew   = this.__createButton("icon/16/actions/help-about.png",
                                                   this.tr("Open new record"),       'new');
            }

            var btnRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
            btnRow.add(btnFirst);
            btnRow.add(btnBack);
            btnRow.add(btnNext);
            btnRow.add(btnLast);
            if (!readOnly) {
                btnRow.add(btnNew);
            }
            return btnRow;
        },

        /* TODOC
         *
         * @param record {var} TODOC
         * @return {void}
         */
        setRecord : function(recordId) {
            this.debug("setRecord(): recordId="+recordId);
            if (recordId == this.__recordId) { // nothing changed
                return;
            }
        },

        /**
         * TODOC
         *
         * @return {void}
         */
        __setFormData : function(recordId, action) {
            this.debug('Called __setFormData(): record='+recordId+', action='+action);
            this.setLoading(true);
            var that = this;
            var setFormDataHandler = function(data, exc, id) {
                if (exc) {
                    dbtoria.ui.dialog.MsgBox.getInstance().exc(exc);
                }
                else {
                    if (action == 'clone'){
                        that.__recordId = null;
                    }
                    else {
                        that.__recordId = recordId;
                    }
                    that.__form.setFormData(data);
                    that.__form.setFormDataChanged(false);
                }
                that.setLoading(false);
            };
            this.__rpc.callAsync(setFormDataHandler, 'getRecordDeref', this.__tableId, recordId);
         },

        /**
         * TODOC
         *
         * @param rules {var} TODOC
         * @return {void}
         */
        _fillForm : function(rules) {
            var form         = new dbtoria.ui.form.AutoForm(rules);
            if (this.__readOnly) {
                // only for readOnly forms, otherwise readOnly fields would get enabled
                form.setReadOnly(this.__readOnly);
            }
            this.__formModel = form.getFormData();
            var formControl  = new dbtoria.ui.form.renderer.Monster(form);
            this.__scrollContainer.add(formControl, {flex:1});
            this.__form = form;
        }
    }
});
