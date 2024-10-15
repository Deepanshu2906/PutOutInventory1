sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("inventory.controller.App", {
        onInit: function() {
        },
        onPressBack: function () {
          window.history.back();
        },
      });
    }
  );
  