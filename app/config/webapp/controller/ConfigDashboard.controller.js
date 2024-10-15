sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("config.controller.ConfigDashboard", {
        onInit: function () {

        },
        onPressSloc: function(){
            const createP = this.getOwnerComponent().getRouter();
            createP.navTo("RoutecreateProfile");
        },
        onPressStatus: function(){
            const pathFuel = this.getOwnerComponent().getRouter();
            pathFuel.navTo("RoutepathFuel");
        },
        onPressMGroup: function(){
            const pathFuel = this.getOwnerComponent().getRouter();
            pathFuel.navTo("RoutepathFuel");
        },
    });
});
