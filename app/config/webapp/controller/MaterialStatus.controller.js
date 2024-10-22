sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/Fragment',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
],
function (Controller,JSONModel,Fragment,MessageBox,MessageToast) {
    "use strict";
    let oBusyDialog;

    return Controller.extend("config.controller.MaterialStatus", {
        onInit: function () {    
        },

        onCreate: function () {
            var oView = this.getView();
            const addStatusData = {
                StatusCode: "",
                Description:""
            };
            const addMaterialStatusModel = new JSONModel(addStatusData);
            oView.setModel(addMaterialStatusModel, "addMaterialStatusModel");
            if (!this._oDialogItem) {
                this._oDialogItem = sap.ui.xmlfragment("config.fragments.AddMaterialStatus", this);
                oView.addDependent(this._oDialogItem);
            }
            this._oDialogItem.open();
        },

        handleValueHelpClose1: function () {
            this._oDialogItem.close();
        },

       
        onSave :function(){
            var oTable = this.byId("materialStatusTable");
            let statusCode = sap.ui.getCore().byId("sfCode").getValue()
            let statusDesc = sap.ui.getCore().byId("sfDesc").getValue()
            var oModel = this.getView().getModel(); 

            let payload ={
                StatusCode:statusCode ,
                Description:statusDesc
            }

            let oBindListSPM = oModel.bindList("/Material_Status");
            oBindListSPM.create(payload);
             
            this._oDialogItem.close();
            this.getView().getModel().refresh();
            setTimeout (() =>{
            sap.m.MessageToast.show("Material Status added successfully");
            }, 1000);
            oTable.removeSelections();
        },

        _onSaveMaterialEntry :function(){
            var oTable = this.byId("materialGroupTable");
            let idField = sap.ui.getCore().byId("idField").getValue()
            let typeField = sap.ui.getCore().byId("typeField").getValue()
            let locationIdField = sap.ui.getCore().byId("locationIdField").getValue()
            let ZcodeField = sap.ui.getCore().byId("ZcodeField").getValue()
            let usabilityInput = sap.ui.getCore().byId("usabityInput").getValue()
            var oModel = this.getView().getModel();  
            let payload = {
                "ID": idField,
                "Type": typeField,
                "Usability": usabilityInput,
                "Zcode": ZcodeField,
                "StorageLocation_LocationID": locationIdField
              }
            let oBindListSPM = oModel.bindList("/Category");
            oBindListSPM.create(payload);
            this._oDialogItem.close();
            this.getView().getModel().refresh();
            setTimeout (() =>{
            sap.m.MessageToast.show("Data added successfully");
            }, 1000);
            oTable.removeSelections();  
        },

        onEdit: function () {
            var oTable = this.byId("materialStatusTable");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length !== 1) {
                MessageToast.show("Please select exactly one item to edit.");
                return;
            }
        
            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
            var oData = oContext.getObject();
            const editMaterialStatusModel = new JSONModel(oData);
            this.getView().setModel(editMaterialStatusModel, "addMaterialStatusModel");

            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("config.fragments.UpdateMaterialStatus", this);
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },
        
        onUpdate: async function () {
            debugger;
            var oView = this.getView();
            var oTable = this.byId("materialStatusTable");
            var oModel = oView.getModel();
            var oUpdateData = oView.getModel("addMaterialStatusModel").getData();
        
            let StatusCode = oUpdateData.StatusCode;
            let StatusDescription = oUpdateData.Description;

            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length !== 1) {
                sap.m.MessageToast.show("Please select one item to update.");
                return;
            }

            var oSelectedItem = aSelectedItems[0];
            var oContext = oSelectedItem.getBindingContext();
        
            let oModel2 = this.getOwnerComponent().getModel();

            if (oContext.getProperty("StatusCode") === StatusCode) {
                oContext.setProperty("Description", StatusDescription);
                try {
                    await oModel2.submitBatch("update");
                    sap.m.MessageToast.show("Item updated successfully.");
                    this._oDialog.close();
                    oTable.removeSelections();
                } catch (error) {
                    sap.m.MessageToast.show("Error updating item: " + error.message);
                }
            } else {
                sap.m.MessageToast.show("The selected items StatusCode does not match the update data.");
            }  
        },
        handleValueHelpClose2: function () {
            var oTable = this.byId("materialStatusTable");
            this._oDialog.close();
            oTable.removeSelections();
        },


        onDelete: function () {
            let oTable = this.byId("materialStatusTable");
            let aItems = oTable.getSelectedItems();

            if (!aItems.length) {
              MessageToast.show("Please Select at least one row ");
              return;
            }
            const that = this;
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.confirm(
                    "Are you sure ,you want  to delete ?", {
                    title: "Confirm ",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                        that.deleteSelectedItems(aItems);
                        } else {
                        oTable.removeSelections();
                        sap.m.MessageToast.show("Deletion canceled");
                        }
                    }
                    }
                );
            });
        },
        deleteSelectedItems: function (aItems) {
            let slength = aItems.length;
            let deleteMsg = slength === 1 ? "Record" : "Records"
            aItems.forEach(function (oItem) {
              const oContext = oItem.getBindingContext();
              oContext.delete().then(function () {
                MessageToast.show(`${deleteMsg} deleted sucessfully`);
              }).catch(function (oError) {
                MessageBox.error("Error deleting item: " + oError.message);
              });
            });
        },
    
 
  
    });
});