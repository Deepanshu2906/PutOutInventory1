const cds = require('@sap/cds');

module.exports = async (srv) => {

    // READ operations for Material_Status, Category, and StorageLocation entities
    srv.on('READ', 'Material_Status', req => {
        return cds.run(SELECT.from('mydb.Material_Status'));
    });

    srv.on('READ', 'Category', req => {
        return cds.run(SELECT.from('mydb.Category'));
    });

    srv.on('READ', 'StorageLocation', req => {
        return cds.run(SELECT.from('mydb.StorageLocation'));
    });

    // READ operation for serviceRequest
    srv.on('READ', 'serviceRequest', req => {
        return cds.run(SELECT.from('mydb.serviceRequest'));
    });

    // CREATE operation for serviceRequest with reqNo generation logic
    srv.on('CREATE', 'serviceRequest', async (req) => {
        const data = req.data; // incoming data without reqNo

        // Fetch the last service request entry ordered by reqNo in descending order
        const lastRequest = await SELECT.one.from('mydb.serviceRequest').orderBy('reqNo desc');

        let newReqNo = 1;  // Default reqNo is 1 if no entries exist

        // If there's a previous entry, increment reqNo by 1
        if (lastRequest && lastRequest.reqNo) {
            newReqNo = lastRequest.reqNo + 1;  // Increment the reqNo
        }

        // Assign the new reqNo to the incoming data
        data.reqNo = newReqNo;

        // Insert the new entry into the serviceRequest table with the generated reqNo
        await INSERT.into('mydb.serviceRequest').entries(data);

        return data;  // Return the newly created entry (with reqNo)
    });
};
