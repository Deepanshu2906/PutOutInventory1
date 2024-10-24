sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
],
    function (Controller, Fragment, JSONModel, ValueState) {
        "use strict";
        let flag = 0
        return Controller.extend("inventory.controller.InspectionTable", {
            onInit: function () {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteInspectionTable").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: async function () {
                try {
                    this.resetTableControls();
                    const requestNumber = JSON.parse(sessionStorage.getItem("materialData"));
                    let oModel = this.getOwnerComponent().getModel();
                    let oBindList = oModel.bindList("/rqMaterial", undefined, undefined, undefined, undefined);
                    let aContexts = await oBindList.requestContexts(0, Infinity);
                    let data = aContexts.map(oContext => oContext.getObject());

                    let filterData = data.filter(item => {
                        return item.reqNo === requestNumber;
                    });

                    let dataModel = new JSONModel(filterData);
                    this.getView().setModel(dataModel, "materialData");

                    let oTable = this.byId("materialTable");
                    oTable.attachEventOnce("updateFinished", this.resetTableControls.bind(this));
                } catch (error) {
                    console.error("Error loading material data:", error);
                }
            },



            resetTableControls: function () {
                let oTable = this.byId("materialTable");
                oTable.getItems().forEach(function (oItem) {
                    let aCells = oItem.getCells();
                    let oInput = aCells[4];  // Assuming Quantity is at index 4
                    if (oInput instanceof sap.m.Input) {
                        // Store original value
                        oInput.data("originalValue", oInput.getValue());
                    }
                });
            },

            onMaterialRowSelect: async function (oEvent) {
                const oView = this.getView();
                let oRowContext = oEvent.getSource().getParent().getBindingContext("materialData");
                let selectedMaterial = oRowContext.getObject();
                let mat_code = selectedMaterial.MaterialCode
                const requestNumber = JSON.parse(sessionStorage.getItem("materialData"));
                let oModel = this.getOwnerComponent().getModel();
                let oBindList = oModel.bindList("/rqSubMaterial", undefined, undefined, undefined, undefined);
                let aContexts = await oBindList.requestContexts(0, Infinity);
                let data = aContexts.map(oContext => oContext.getObject());

                let filterData = data.filter(item => {
                    return item.reqNo === requestNumber && item.Parent_MaterialCode === mat_code;
                });

                console.log("Bid details data:", filterData);
                let subMaterials = filterData || [];
                if (!this.expandCheckinDataFragment) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "inventory.fragments.subComponent",
                        controller: this
                    }).then(oDialog => {
                        this.expandCheckinDataFragment = oDialog;
                        oView.addDependent(this.expandCheckinDataFragment);
                        let subModel = new sap.ui.model.json.JSONModel(subMaterials);
                        this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
                        this.expandCheckinDataFragment.open();
                    }).catch(err => {
                        console.error("Failed to load fragment:", err);
                    });
                } else {
                    let subModel = new sap.ui.model.json.JSONModel(subMaterials);
                    this.expandCheckinDataFragment.setModel(subModel, "subMaterialData");
                    this.expandCheckinDataFragment.open();
                }
            },

            _onStatusTypeChange: function (oEvent) {
                var oSelect = oEvent.getSource();
                var sSelectedText = oSelect.getSelectedItem().getText();
                // let oModel = this.getView().getModel("materialData");
                // oModel.setProperty("/status", sSelectedKey);
                console.log("selected item", sSelectedText);
                // let oRow = oSelect.getParent(); 
                // let qtyCell = oRow.getCells()[4];  
                // let compButton = oRow.getCells()[7];  
                // if (sSelectedText === "Partial") {
                //     if (qtyCell instanceof sap.m.Input) {
                //         qtyCell.setEditable(true);  
                //     }
                //     if (compButton instanceof sap.m.Button) {
                //         compButton.setEnabled(true);  
                //     }
                // } else {
                //     if (qtyCell instanceof sap.m.Input) {
                //         qtyCell.setEditable(false);  
                //     }
                //     if (compButton instanceof sap.m.Button) {
                //         compButton.setEnabled(false); 
                //     }
                // }
            },


            _onObjectMatched: async function () {
                try {
                    this.resetTableControls();
                    const requestNumber = JSON.parse(sessionStorage.getItem("materialData"));
                    console.log("Request Number:", requestNumber);  // Log the request number
                    let oModel = this.getOwnerComponent().getModel();

                    let oBindList = oModel.bindList("/rqMaterial", undefined, undefined, undefined, undefined);
                    let aContexts = await oBindList.requestContexts(0, Infinity);
                    let data = aContexts.map(oContext => oContext.getObject());

                    let filterData = data.filter(item => {
                        return item.reqNo === requestNumber;
                    });
                    console.log("Filtered Data:", filterData);  // Log the filtered data

                    let dataModel = new JSONModel(filterData);
                    this.getView().setModel(dataModel, "materialData");

                    let oTable = this.byId("materialTable");
                    oTable.attachEventOnce("updateFinished", this.resetTableControls.bind(this));
                } catch (error) {
                    console.error("Error loading material data:", error);
                    sap.m.MessageToast.show("Error loading material data: " + error.message);
                }
            },




            _onCancelCheckinSubFragment: function () {
                this.expandCheckinDataFragment.close()
            },

         
            // _onMaterialSubmit: function () {

            //     let oModel = this.getView().getModel();
            //     let reqNo = this.byId("IDGenText19").getValue();
            //     let oBindList = oModel.bindList("/splitMaterialTable"); // Check the spelling here
            //     let oTable = this.byId("materialTable");
            //     console.log("oTable", oTable);
            //     let aTableItems = oTable.getItems();

            //     // Debugging the request
            //     let idFilter = new sap.ui.model.Filter("reqNo", sap.ui.model.FilterOperator.EQ, reqNo);

            //     oBindList.filter(idFilter).requestContexts().then(function (aContexts) {
            //         if (aContexts.length > 0) {
            //             return; // There are existing records, so exit early
            //         }

            //         let updatedMaterials = [];
            //         aTableItems.forEach(function (oItem) {
            //             let oContext = oItem.getBindingContext("materialData");
            //             console.log(oContext); // Check if context is valid

            //             if (oContext) { // Check if the context is defined
            //                 let updatedMaterial = {
            //                     reqNo: oContext.getProperty("reqNo"),
            //                     MaterialCode: oContext.getProperty("MaterialCode"),
            //                     Category: oContext.getProperty("Category"),
            //                     Description: oContext.getProperty("Description"),
            //                     Quantity: oContext.getProperty("Quantity"),
            //                     Remarks: oContext.getProperty("Remarks")
            //                 };
            //                 updatedMaterials.push(updatedMaterial);
            //             }
            //         });
            //     });
            // },

            onSubmit: function () {
                // Get the OData model


                // Get the items from the material table
                let oTable = this.byId("materialTable");
                let aItems = oTable.getBinding("items").getCurrentContexts();

                // Iterate over the items to construct the payload
                aItems.forEach((oContext) => {
                    let oData = oContext.getObject(); // Get the data for each row

                    // Construct the payload for the create operation
                    let payload = {
                        reqNo: oData.reqNo,
                        MaterialCode: oData.MaterialCode,
                        Status: oData.Status,
                        Quantity: oData.Quantity,
                        Remarks: oData.Remarks
                    };
                    console.log("payload" , payload)

                    let oModel2 = this.getOwnerComponent().getModel();
                    let oBindList4 = oModel2.bindList("/splitMaterilalTable");
                    oBindList4.create(payload);
                        
                    sap.m.MessageToast.show("Successfully Submited");
                    

                });
            },
            onsavesubcomponent:function(){
                let oTable = this.byId("expandSubTable");
                let aItems = oTable.getBinding("items").getCurrentContexts();

                aItems.forEach((oContext) => {
                    let oData = oContext.getObject(); // Get the data for each row

                    // Construct the payload for the create operation
                    let payload = {
                        reqNo: oData.reqNo, 
                        MaterialCode: oData.MaterialCode,
                        Parent_MaterialCode:oData.Parent_MaterialCode,
                        Status: oData.Status,
                        Quantity: oData.Quantity,
                        Remarks: oData.Remarks
                    };
                    console.log("payload" , payload)

                    let oModel2 = this.getOwnerComponent().getModel();
                    let oBindList4 = oModel2.bindList("/splitSubMaterialTable");
                    oBindList4.create(payload);
                        
                    sap.m.MessageToast.show("Successfully Submited");
                  

                });
            },



            quantityChange: function (oEvent) {
                let oInput = oEvent.getSource(); // The Input that triggered the event
                let newValue = parseFloat(oInput.getValue()); // Get the new value entered by the user and convert it to a number
                let originalValue = parseFloat(oInput.data("originalValue")); // Retrieve the original value stored and convert it to a number

                if (!isNaN(originalValue) && !isNaN(newValue)) {
                    let quantityDifference = originalValue - newValue; // Calculate the difference
                    console.log("Original Quantity:", originalValue);
                    console.log("New Quantity:", newValue);
                    console.log("Difference in Quantity:", quantityDifference);

                    // Check if the new quantity exceeds the original quantity
                    if (quantityDifference < 0) {
                        // If the quantity difference is negative, display a message and don't add a new row
                        sap.m.MessageToast.show("Original quantity exceeded. No row added.");
                        console.warn("Original quantity exceeded. New quantity cannot be less than the original.");
                    } else {
                        // Get the binding context for the current row
                        let oContext = oInput.getBindingContext("materialData");
                        let currentRowData = oContext.getObject(); // Get the current row data

                        // Duplicate the row data
                        let duplicatedRowData = Object.assign({}, currentRowData);

                        // Set the Quantity of the duplicated row to the calculated difference
                        duplicatedRowData.Quantity = quantityDifference;

                        // Add the duplicated row to the model
                        let oModel = this.getView().getModel("materialData");
                        let aData = oModel.getData(); // Get current data array
                        aData.push(duplicatedRowData); // Add duplicated row to the array
                        oModel.setData(aData); // Set the updated array back to the model

                        sap.m.MessageToast.show("Row duplicated successfully with Quantity difference.");
                    }
                } else {
                    console.log("Invalid quantity values");
                }
            },

            quantityChangeSub: function (oEvent) {
                let oInput = oEvent.getSource(); // The Input that triggered the event
                let newValue = parseFloat(oInput.getValue()); // Get the new value entered by the user and convert it to a number
                let originalValue = parseFloat(oInput.data("SubQuantityInput2")); // Retrieve the original value stored and convert it to a number

                // Check if both values are valid numbers
                if (!isNaN(originalValue) && !isNaN(newValue)) {
                    let quantityDifference = originalValue - newValue; // Calculate the difference

                    // Log the values and the difference
                    console.log("Original Quantity:", originalValue);
                    console.log("New Quantity:", newValue);
                    console.log("Difference in Quantity:", quantityDifference);

                    // You can add further logic to handle this difference as needed
                    // For example, update the model or show a message if the difference is greater than expected.
                } else {
                    console.log("Invalid quantity values");
                    sap.m.MessageToast.show("Invalid quantity entered.");
                }
            }








        });
    });


