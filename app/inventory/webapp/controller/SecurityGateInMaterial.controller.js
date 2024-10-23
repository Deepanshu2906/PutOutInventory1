sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
],
function (Controller,Fragment,JSONModel,ValueState) {
    "use strict";
   let flag = 0
    return Controller.extend("inventory.controller.SecurityGateInMaterial", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteGateMaterial").attachPatternMatched(this._onObjectMatched, this);
        }, 

        _onObjectMatched:async function(){
            try {
                this.resetTableControls();
                const materialData = JSON.parse(sessionStorage.getItem("materialData"));
                const requestNumber = materialData ? materialData.reqNo : null;
                console.log("status hai",materialData.reqStatus)
                if(materialData.reqStatus === 'Closed'){
                    this.layoutEditOnStatus()
                }
                let oModel = this.getOwnerComponent().getModel();        
                let oBindList = oModel.bindList("/rqMaterial", undefined, undefined,undefined,{
                    $expand: "SubcomponentList",
                });
                let aContexts = await oBindList.requestContexts(0, Infinity);
                let data = aContexts.map(oContext => oContext.getObject());

                let filterData = data.filter(item=>{
                    return item.reqNo === requestNumber
                })
                console.log("Bid details data:", filterData);   
                // let subModel = new JSONModel(filterData[0].Materials[0].SubcomponentList)
                let dataModel = new JSONModel(filterData)
                this.getView().setModel(dataModel,"materialData")
                console.log("model data is",this.getView().getModel("materialData").getData())
                // this.getView().setModel(subModel,"subMaterialData") 
                let oTable = this.byId("materialTable");
                oTable.attachEventOnce("updateFinished", this.resetTableControls.bind(this));
                

            } catch (error) {
                
            }
        },

        layoutEditOnStatus :function(){
                let nonEditableLayout = this.getView().byId("materialDetailsLayout2")
                let editableLayout = this.getView().byId("materialDetailsLayout")
                nonEditableLayout.setVisible(true)
                editableLayout.setVisible(false)
                if(!flag){
                    flag =1
                }
        },
        
        resetTableControls: function() {
            let oTable = this.byId("materialTable");
            oTable.getItems().forEach(function(oItem) {
                let aCells = oItem.getCells(); 
                let oSelect = aCells[5];
                if (oSelect instanceof sap.m.Select) {
                    oSelect.setSelectedKey("");
                }
                let oInput = aCells[4];  
                if (oInput instanceof sap.m.Input) {
                    oInput.setEditable(false);  
                }
                let oButton = aCells[7]; 
                if (oButton instanceof sap.m.Button) {
                    oButton.setEnabled(false);  
                }
                let oRemarks = aCells[6];
                if(oRemarks instanceof sap.m.Input){
                    oRemarks.setValue("")
                }
            });
        },

        onMaterialRowSelect: async function(oEvent) {
            const oView = this.getView();
            let oRowContext = oEvent.getSource().getParent().getBindingContext("materialData");
            let selectedMaterial = oRowContext.getObject();
            let subMaterials = selectedMaterial.SubcomponentList || [];
          
            if (!this.expandCheckinDataFragment) {
              Fragment.load({
                id: oView.getId(),
                name: "inventory.fragments.GateInSubMaterial",
                controller: this
              }).then(oDialog => {
                this.expandCheckinDataFragment = oDialog;
                oView.addDependent(this.expandCheckinDataFragment);
          
                let subModel = new sap.ui.model.json.JSONModel(subMaterials);
                this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
                if (flag) {
                    let oTable = Fragment.byId(this.getView().getId(), "expandSubTable");
                    oTable.getItems().forEach(item => {
                        let qtyCell = item.getCells()[3];
                        if (qtyCell) {
                            qtyCell.setEditable(false);
                        }
                    });
                }
              
          
                this.expandCheckinDataFragment.open();
              }).catch(err => {
                console.error("Failed to load fragment:", err);
              });
            } else {
              let subModel = new sap.ui.model.json.JSONModel(subMaterials);
              this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
              if (flag) { 
                let oTable = Fragment.byId(this.getView().getId(), "expandSubTable");
                oTable.getItems().forEach(item => {
                    let qtyCell = item.getCells()[3];
                    if (qtyCell) {
                        qtyCell.setEditable(false);
                    }
                });
            }
              this.expandCheckinDataFragment.open();
            }
          },

        _onStatusTypeChange: function(oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let sStatus = oSelectedItem.getKey()
            var oSelect = oEvent.getSource();
            var sSelectedText = oSelect.getSelectedItem().getText();
            let oBindingContext = oEvent.getSource().getBindingContext("materialData");

            oBindingContext.setProperty("MatStatus", sStatus);
            console.log("selected item", sSelectedText);
            let oRow = oSelect.getParent(); 
            let qtyCell = oRow.getCells()[4];  
            let compButton = oRow.getCells()[7];  
            if (sSelectedText === "Partial") {
                if (qtyCell instanceof sap.m.Input) {
                    qtyCell.setEditable(true);  
                }
                if (compButton instanceof sap.m.Button) {
                    compButton.setEnabled(true);  
                }
            } else {
                if (qtyCell instanceof sap.m.Input) {
                    qtyCell.setEditable(false);  
                }
                if (compButton instanceof sap.m.Button) {
                    compButton.setEnabled(false); 
                }
            }
        },                


        _onCancelCheckinSubFragment : function(){
            this.expandCheckinDataFragment.close()
        },   

        _onMaterialSubmit: async function() {
            debugger
            let oTable = this.byId("materialTable");
            let aTableItems = oTable.getItems(); 
            let updatedMaterials = [];
            aTableItems.forEach(function(oItem) {
                let oContext = oItem.getBindingContext("materialData");
                let subComponents = oContext.getProperty("SubcomponentList");
                let updatedMaterial = {
                    reqNo: oContext.getProperty("reqNo"),
                    MaterialCode: oContext.getProperty("MaterialCode"),
                    Category: oContext.getProperty("Category"),
                    Description: oContext.getProperty("Description"),
                    Quantity: oContext.getProperty("Quantity"),
                    Remarks : oContext.getProperty("Remarks"),
                    Status : oContext.getProperty("Status"),
                    SubcomponentList : subComponents
                };
                updatedMaterials.push(updatedMaterial);
            }); 
            console.log("updated data of all",updatedMaterials)
            this._submitData(updatedMaterials);
        },       

        _submitData: async function(updatedMaterials) {
            debugger
            let oModel = this.getView().getModel();
            const materialData = JSON.parse(sessionStorage.getItem("materialData"));
            const servNo = materialData ? materialData.reqNo : null;
            let oBindingList = oModel.bindList("/serviceRequest");
            let aFilters = [new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, servNo)];
        
            try {
                let aContexts = await oBindingList.filter(aFilters).requestContexts();
                if (aContexts.length > 0) {
                    let oServiceRequestContext = aContexts[0];
                    oServiceRequestContext.setProperty("reqStatus", "Closed");
        
                    let oMaterialListBinding = oServiceRequestContext.getModel().bindList("Materials", oServiceRequestContext);
                    let aMaterialContexts = await oMaterialListBinding.requestContexts();
        
                    for (let oMaterial of updatedMaterials) {
                        let matchingMaterialContext = aMaterialContexts.find(
                            (context) => context.getProperty("MaterialCode") === oMaterial.MaterialCode
                        );
                        if (matchingMaterialContext) {
                            matchingMaterialContext.setProperty("Category", oMaterial.Category);
                            matchingMaterialContext.setProperty("Description", oMaterial.Description);
                            matchingMaterialContext.setProperty("Quantity", oMaterial.Quantity);
                            matchingMaterialContext.setProperty("MatRemarks", oMaterial.Remarks);        
                            matchingMaterialContext.setProperty("MatStatus", oMaterial.Status);        
                            if (oMaterial.SubcomponentList && oMaterial.SubcomponentList.length > 0) {
                                let oSubcomponentListBinding = matchingMaterialContext.getModel().bindList("SubcomponentList", matchingMaterialContext);
                                let aSubMaterialContexts = await oSubcomponentListBinding.requestContexts();        
                                for (let oSubMaterial of oMaterial.SubcomponentList) {
                                    let matchingSubMaterialContext = aSubMaterialContexts.find(
                                        (context) => context.getProperty("MaterialCode") === oSubMaterial.MaterialCode
                                    );        
                                    if (matchingSubMaterialContext) {
                                        matchingSubMaterialContext.setProperty("Category", oSubMaterial.Category);
                                        matchingSubMaterialContext.setProperty("Description", oSubMaterial.Description);
                                        matchingSubMaterialContext.setProperty("Quantity", oSubMaterial.Quantity);
                                    } else {
                                        console.error("No sub-material found for MaterialCode: " + oSubMaterial.MaterialCode);
                                    }
                                }
                            }
                        } else {
                            console.error("No material found for MaterialCode: " + oMaterial.MaterialCode);
                        }
                    }
                    if (oModel.hasPendingChanges()) {
                        await oModel.submitBatch("updateGroup");
                        sap.m.MessageToast.show("All materials and sub-materials updated successfully.");
                        setTimeout(() => {
                            const oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteWarehouseMain")
                        }, 1000);
                    } else {
                        console.log("No pending changes detected");
                    }
                } else {
                    console.error("Service request not found for reqNo: " + servNo);
                }
            } catch (error) {
                console.error("Error updating materials and sub-materials:", error);
                sap.m.MessageToast.show("Error updating materials: " + error.message);
            }
        }
                
                

   });
});


