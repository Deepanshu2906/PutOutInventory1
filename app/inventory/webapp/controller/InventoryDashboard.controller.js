sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet"
],
function (Controller, JSONModel, MessageToast,Fragment,Spreadsheet) {
    "use strict";

    return Controller.extend("inventory.controller.InventoryDashboard", {
        onInit: function () {
            
        },

        onGoFilter: function() {
            var oTable = this.byId("inventoryDataTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
        
            // Get filter values
            var sMaterialReqNo = this.byId("materialReqNoFilter").getValue();
            var sCategory = this.byId("categoryFilter").getSelectedKey();
            var sUsability = this.byId("usabilityFilter").getSelectedKey();
            var sStatus = this.byId("statusFilter").getSelectedKey();
            var oDate = this.byId("dateFilter").getDateValue();
        
            // Filter for Material Req No (works fine)
            if (sMaterialReqNo) {
                aFilters.push(new sap.ui.model.Filter("MaterialReqNo", sap.ui.model.FilterOperator.Contains, sMaterialReqNo));
            }
        
            // Filter for Category
            if (sCategory) {
                aFilters.push(new sap.ui.model.Filter("Category", sap.ui.model.FilterOperator.EQ, sCategory));
            }
        
            // Filter for Usability
            if (sUsability) {
                aFilters.push(new sap.ui.model.Filter("Usability", sap.ui.model.FilterOperator.EQ, sUsability));
            }
            console.log("Usability", sUsability )
        
            // Filter for Status (works fine)
            if (sStatus) {
                aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sStatus));
            }
        
            // Filter for Date
            if (oDate) {
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});
                var sFormattedDate = oDateFormat.format(oDate);
                
                aFilters.push(new sap.ui.model.Filter("CreatedOn", sap.ui.model.FilterOperator.EQ, sFormattedDate));
            }
        
            // Apply filters to the table binding
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
        },

        onViewPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oSelectedData = oContext.getObject();
        
            var sMaterialCode = oSelectedData.MaterialCode;
        
            var oModel = this.getView().getModel("invData");
            var oData = oModel.getData();
        
            var aSubComponents = oData.subComponentData ? oData.subComponentData.filter(function(item) {
                return item.MaterialCode === sMaterialCode;
            }) : [];
        
            console.log("Subcomp", aSubComponents);
        
            if (aSubComponents.length === 0) {
                sap.m.MessageBox.error("No subcomponents found for Material Code: " + sMaterialCode);
                return;
            }
        
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("inventory.fragments.SubComponent", this);
                this.getView().addDependent(this._oDialog);
            }
            var oSubComponentModel = new sap.ui.model.json.JSONModel();
            oSubComponentModel.setData({ subComponents: aSubComponents });
            
            this._oDialog.setModel(oSubComponentModel, "subCompData");
        
            this._oDialog.open();
        },

        handleValueHelpClose: function () {
            this._oDialog.close();
        },

        onDownloadPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("invData");
            var oMaterialData = oContext.getObject();
            var sMaterialCode = oMaterialData.MaterialCode; 
        
            var oModel = this.getView().getModel("invData");
            var aSubComponents = oModel.getProperty("/subComponentData");
        
            var aRelatedSubComponents = aSubComponents.filter(function (oSubComp) {
                return oSubComp.MaterialCode === sMaterialCode;
            });
            var aExportData = [{
                MaterialReqNo: oMaterialData.MaterialReqNo,
                MaterialCode: oMaterialData.MaterialCode,
                MaterialDescription: oMaterialData.Description,
                Category: oMaterialData.Category,
                Usability: oMaterialData.Usability,
                Status: oMaterialData.Status,
                CreatedBy: oMaterialData.CreatedBy,
                CreatedOn: oMaterialData.CreatedOn
            }];

            aRelatedSubComponents.forEach(function (oSubComp) {
                aExportData.push({
                    SubMaterialCode: oSubComp.SubMaterialCode,
                    SubDescription: oSubComp.Description,
                    SubCategory: oSubComp.Category,
                    Quantity: oSubComp.Quantity
                });
            });

            var aColumns = [
                { label: "Material Req No", property: "MaterialReqNo" },
                { label: "Material Code", property: "MaterialCode" },
                { label: "Material Description", property: "MaterialDescription" },
                { label: "Category", property: "Category" },
                { label: "Usability", property: "Usability" },
                { label: "Status", property: "Status" },
                { label: "Created By", property: "CreatedBy" },
                { label: "Created On", property: "CreatedOn" },
                { label: "Sub Material Code", property: "SubMaterialCode" },
                { label: "Sub Description", property: "SubDescription" },
                { label: "Sub Category", property: "SubCategory" },
                { label: "Quantity", property: "Quantity" }
            ];
            var oSpreadsheet = new sap.ui.export.Spreadsheet({
                workbook: {
                    columns: aColumns
                },
                dataSource: aExportData,
                fileName: "Material_Data.xlsx"
            });
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        }
        
        
        
 
    });
});
