/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
              Fritz Zaucker <fritz.zaucker@oetiker.ch?
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
************************************************************************ */

qx.Class.define("dbtoria.ui.form.DateField", {
    extend : qx.ui.form.DateField,

    /**
     * Create a customized DateField.
     *
     */
    construct : function() {
        this.base(arguments);
        this.set({allowGrowX : false});
    },

    members : {
        setter: function(value) {
            if (value == null) {
                this.setValue(value);
            }
            else {
                this.setValue(new Date(value));
            }
        }
    }

});