/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü

************************************************************************ */

/**
 * Initialize an Rpc object which accesses a local cgi server when called from
 * the source version of the application
 */
qx.Class.define('dbtoria.data.Rpc', {
    extend : qx.io.remote.Rpc,
    type : "singleton",

    construct : function() {
        this.base(arguments);

        this.set({
            // 30 seconds max
            timeout     : 30000,
            url         : 'jsonrpc/',
            serviceName : 'DbToRia'
        });
    },

    members : {
        /**
         * A variant of the asyncCall method which pops up error messages
         * generated by the server automatically.
         *
         * Note that the handler method only gets a return value never an exception
         * It just does not get called when there is an exception.
         *
         * @param handler {Function} the callback function.
         * @param methodName {String} the name of the method to call.
         * @return {var} the method call reference.
         */
        callAsyncSmart : function(handler, methodName) {
            var origHandler = handler;

            var superHandler = function(ret, exc, id) {
                if (exc) {
                    dbtoria.ui.dialog.MsgBox.getInstance().exc(exc);
                } else {
                    origHandler(ret);
                }
            };

            arguments[0] = superHandler;
            this.callAsync.apply(this, arguments);
        },
        /**
         * A asyncCall handler which tries to
         * login in the case of a permission exception.
         *
         * @param handler {Function} the callback function.
         * @param methodName {String} the name of the method to call.
         * @return {var} the method call reference.
         */
        callAsync : function(handler, methodName) {
            var origArguments = arguments;
            var origThis = this;
            var origHandler = handler;

            var superHandler = function(ret, exc, id) {
                if (exc && exc.code == 6) {
                    var login = dbtoria.ui.dialog.Login.getInstance();
                    login.addListenerOnce('login', function(e) {
                        dbtoria.module.desktop.Toolbar.getInstance().setUsername(login.getUsername());
                        origArguments.callee.base.apply(origThis, origArguments);
                    });
                    login.open();
                    return;
                }
                origHandler(ret, exc, id);
            };

            if (methodName != 'login') {
                arguments[0] = superHandler;
            }

            arguments.callee.base.apply(this, arguments);
        }
    }

});
