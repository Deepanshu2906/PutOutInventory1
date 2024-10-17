const cds = require('@sap/cds');

module.exports = async (srv) => {

    // READ operations for Material_Status, Category, and StorageLocation entities
    srv.on('READ', 'Material_Status', req => {
        return cds.run(SELECT.from('mydb.Material_Status'));
    });
    srv.on('CREATE', 'Material_Status', req => {
        return cds.run(INSERT.into('mydb.Material_Status').entries(req.data));
    });
 
    srv.on('UPDATE', 'Material_Status', async req => {
        console.log("bfdsbfs :", req.data);
        await cds.run(UPDATE('mydb.Material_Status').set(req.data).where({ StatusCode : req.data.StatusCode }));
    });

    srv.on('READ', 'Category', req => {
        return cds.run(SELECT.from('mydb.Category'));
    });
    srv.on('CREATE', 'serviceRequest', async (req) => {
        const tx = cds.transaction(req);
        
        // Fetch the maximum reqNo in the table
        const lastRequest = await tx.run(SELECT.one.from('mydb.serviceRequest').columns('max(reqNo) as maxReqNo'));
        
        // Determine the next reqNo, start from 40001 if no entries exist
        const nextReqNo = lastRequest.maxReqNo ? lastRequest.maxReqNo + 1 : 40001;
    
        // Assign the generated reqNo to the incoming request data
        req.data.reqNo = nextReqNo;
    
        // Proceed with the creation
         // If there is a Materials array in the request, add reqNo to each material object
        if (req.data.Materials && Array.isArray(req.data.Materials)) {
        req.data.Materials.forEach(material => {
            material.reqNo = nextReqNo; // Assign reqNo to each material
        });
        }
        
        await tx.run(INSERT.into('mydb.serviceRequest').entries(req.data));
        return cds.run(SELECT.from('mydb.serviceRequest').where({ reqNo: nextReqNo }));
    });
    

    srv.on('CREATE', 'Material', async (req) => {
        const { Category, Description, Quantity, Status, SubcomponentList } = req.data;
        console.log("hgfds", req.data);

        // Fetch all materials from the given category and order by MaterialCode descending
        const materials = await cds.run(SELECT.from('mydb.Material').where({ Category }).orderBy('MaterialCode desc'));
        console.log("matrils afte rfilter ", materials);

        // Get the prefix dynamically from the first two characters of the existing MaterialCode or use a default
        let prefix = Category.substring(0, 2).toUpperCase(); // Extract prefix from the category (first two letters)

        // Determine the next material code based on the existing data
        let nextMaterialCode = `${prefix}001`; // Default value if no materials exist for this category
    
        if (materials.length > 0) {
            const lastMaterial = materials[0].MaterialCode;
            
            // Split the MaterialCode by hyphen to separate parent from subcomponent code
            const [parentCode] = lastMaterial.split('-');
    
            // Extract the prefix and numeric part dynamically from the parent code
            const lastPrefix = parentCode.substring(0, 2); // First two characters of the parent MaterialCode
            const lastNumber = parseInt(parentCode.substring(2), 10); // Numeric part of the parent MaterialCode
    
            // Generate the next parent MaterialCode by incrementing the numeric part
            nextMaterialCode = `${lastPrefix}${String(lastNumber + 1).padStart(3, '0')}`; // Increment the number
        }

        // Combine subcomponent MaterialCodes for the parent MaterialCode if subcomponents exist
        let combinedMaterialCode = nextMaterialCode;
        if (SubcomponentList && SubcomponentList.length > 0) {
            combinedMaterialCode += '-' + SubcomponentList.map(sub => sub.MaterialCode).join('-'); // Append subcomponent codes
        }

        // Create a payload for the new parent material
        const newMaterial = {
            Category,
            Description,
            MaterialCode: combinedMaterialCode, // Combined parent material code
            Quantity,
            Status
        };
        console.log("new material ",newMaterial);

        // Insert the new parent material into the Material table
        await cds.run(INSERT.into('mydb.Material').entries(newMaterial));

        // Handle subcomponents by inserting them into the Subcomponent table if they exist
        if (SubcomponentList && SubcomponentList.length > 0) {
            for (let i = 0; i < SubcomponentList.length; i++) {
                const subcomponent = SubcomponentList[i];

                // Insert each subcomponent into the Subcomponent table, linking it to the parent MaterialCode
                const result = await cds.run(SELECT.one.from('mydb.Subcomponent').columns('max(ID) as maxID'));
                const maxID = result?.maxID || 1; // If no records, default to 0
                const newSubcomponent = {
                    ID : maxID +1 ,
                    Parent_MaterialCode: combinedMaterialCode, // Parent's combined MaterialCode
                    Category: subcomponent.Category,
                    Description: subcomponent.Description,
                    MaterialCode: subcomponent.MaterialCode, // Keep subcomponent's original MaterialCode
                    Quantity: subcomponent.Quantity
                };
                console.log(`subcompoent ${i}`, newSubcomponent);

                await cds.run(INSERT.into('mydb.Subcomponent').entries(newSubcomponent));
            }
        }

        // Return the newly created parent material with the combined MaterialCode
        return cds.run(SELECT.from('mydb.Material').where({ MaterialCode: combinedMaterialCode }));
    });

    // return cds.run(SELECT.from('mydb.Material'));


    srv.on('READ', 'StorageLocation', req => {
        return cds.run(SELECT.from('mydb.StorageLocation'));
    });

    srv.on('CREATE', 'StorageLocation', req => {
        return cds.run(INSERT.into('mydb.StorageLocation').entries(req.data));
    });

    // srv.on('UPDATE', 'StorageLocation',async  req => {
    //     await cds.run(UPDATE('mydb.StorageLocation').set(req.data).where({ LocationID: req.data.LocationID }));
    // });

    // READ operation for serviceRequest
    srv.on('READ', 'serviceRequest', req => {
        return cds.run(SELECT.from('mydb.serviceRequest'));
    });

   
};
