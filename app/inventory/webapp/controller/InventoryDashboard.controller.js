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

            var sMaterialReqNo = this.byId("materialReqNoFilter").getValue();
            var sCategory = this.byId("categoryFilter").getSelectedKey();
            var sStatus = this.byId("statusFilter").getSelectedKey();
            var oDate = this.byId("dateFilter").getDateValue();

            if (sMaterialReqNo) {
                aFilters.push(new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.Contains, sMaterialReqNo));
            }

            if (sCategory) {
                aFilters.push(new sap.ui.model.Filter("Category", sap.ui.model.FilterOperator.EQ, sCategory));
            }

            if (sStatus) {
                aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, sStatus));
            }

            if (oDate) {
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});
                var sFormattedDate = oDateFormat.format(oDate);
                aFilters.push(new sap.ui.model.Filter("createdAt", sap.ui.model.FilterOperator.Contains, sFormattedDate));
            }

            oBinding.filter(aFilters);
        },
        
        onRefresh: function () {
            var oTable = this.byId("inventoryDataTable");
            oTable.setBusy(true);
            
            this.byId("materialReqNoFilter").setValue("");
            this.byId("dateFilter").setDateValue(null);
            this.byId("categoryFilter").setSelectedKey("");
            this.byId("statusFilter").setSelectedKey("");

            var oBinding = oTable.getBinding("items");

            oBinding.filter([]);

            setTimeout(function () {
                oTable.setBusy(false);
            }, 1000);
        },

        onViewPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext(); 
            var oSelectedData = oContext.getObject();
            var sMaterialCode = oSelectedData.MaterialCode;
            var sMaterialReqNo = oSelectedData.reqNo; 
        
            console.log("Material code =", sMaterialCode);
            console.log("Material req no =", sMaterialReqNo);

            let oModel = this.getView().getModel();
            let oBindList = oModel.bindList("/rqSubMaterial");

            var aFilters = [
                new sap.ui.model.Filter("Parent_MaterialCode", sap.ui.model.FilterOperator.EQ, sMaterialCode),
                new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, sMaterialReqNo)
            ];

            oBindList.filter(aFilters).requestContexts().then(function (aContexts) {
                if (aContexts.length > 0) {
                    let aFilteredData = aContexts.map(context => context.getObject());
                    let oSubCompModel = new sap.ui.model.json.JSONModel({ rqSubMaterial: aFilteredData });
                    this._oDialog.setModel(oSubCompModel);

                    this._oDialog.open();
                } else {
                    sap.m.MessageBox.information("No Sub Component found for this :"+ sMaterialCode);
                }
            }.bind(this)).catch(function (oError) {
                console.error("Error while requesting contexts:", oError);
            });
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("inventory.fragments.SubComponent", this);
                this.getView().addDependent(this._oDialog);
            }
        },

        handleValueHelpClose: function () {
            this._oDialog.close();
        },
        
        onDownloadPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oMaterialData = oContext.getObject();
            var sMaterialCode = oMaterialData.MaterialCode;
        
            var aExportData = [];

            var aColumns = [
                { label: "Material Req No", property: "MaterialReqNo" },
                { label: "Material Code", property: "MaterialCode" },
                { label: "Material Description", property: "MaterialDescription" },
                { label: "Category", property: "Category" },
                { label: "Status", property: "Status" },
                { label: "Created By", property: "CreatedBy" },
                { label: "Created On", property: "CreatedOn" },
                { label: "Sub Material Code", property: "SubMaterialCode" },
                { label: "Sub Description", property: "SubDescription" },
                { label: "Sub Category", property: "SubCategory" },
                { label: "Quantity", property: "Quantity" }
            ];

            var oListBinding = this.getView().getModel().bindList("/rqSubMaterial", null, null, 

            new sap.ui.model.Filter("Parent_MaterialCode", sap.ui.model.FilterOperator.EQ, sMaterialCode));
        
            oListBinding.requestContexts().then(function (aContexts) {
                aContexts.forEach(function (oContext) {
                    var oSubMaterialData = oContext.getObject();
                    aExportData.push({
                        MaterialReqNo: oMaterialData.reqNo,
                        MaterialCode: oMaterialData.MaterialCode,
                        MaterialDescription: oMaterialData.Description,
                        Category: oMaterialData.Category,
                        Status: oMaterialData.Status,
                        CreatedBy: oMaterialData.createdBy,
                        CreatedOn: oMaterialData.createdAt,
                        SubMaterialCode: oSubMaterialData.MaterialCode,
                        SubDescription: oSubMaterialData.Description,
                        SubCategory: oSubMaterialData.Category,
                        Quantity: oSubMaterialData.Quantity
                    });
                });

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
            }).catch(function (oError) {
                sap.m.MessageToast.show("Error fetching subcomponents.");
            });
        },
    });
});
