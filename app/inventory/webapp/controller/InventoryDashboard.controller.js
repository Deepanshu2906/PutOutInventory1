sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/m/MessageToast",
],
function (Controller, JSONModel, MessageToast,Fragment) {
    "use strict";

    return Controller.extend("inventory.controller.InventoryDashboard", {
        onInit: function () {
            
        },

        onGoFilter: function() {
            var oTable = this.byId("inventoryDataTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sMaterialReqNo = this.byId("materialReqNoFilter").getValue();
            var sCategory = this.byId("categoryFilter").getSelectedKey();
            var sUsability = this.byId("usabilityFilter").getSelectedKey();
            var sStatus = this.byId("statusFilter").getSelectedKey();
        
            // Add filters
            if (sMaterialReqNo) {
                aFilters.push(new sap.ui.model.Filter("MaterialReqNo", sap.ui.model.FilterOperator.Contains, sMaterialReqNo));
            }
            if (sCategory) {
                aFilters.push(new sap.ui.model.Filter("Category", sap.ui.model.FilterOperator.EQ, sCategory));
            }
            if (sUsability) {
                aFilters.push(new sap.ui.model.Filter("Usability", sap.ui.model.FilterOperator.EQ, sUsability));
            }
            if (sStatus) {
                aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sStatus));
            }
            oBinding.filter(aFilters);
        },
        onRefresh: function () {
            var oTable = this.byId("inventoryDataTable");

            oTable.setBusy(true);

            this.byId("materialReqNoFilter").setValue("");
            this.byId("dateFilter").setDateValue(null);
            this.byId("categoryFilter").setSelectedKey("");
            this.byId("usabilityFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");

            var oBinding = oTable.getBinding("items");

            oBinding.filter([]);

            setTimeout(function () {
                oTable.setBusy(false);
            }, 1000);
        }
        
        
        
    });
});
