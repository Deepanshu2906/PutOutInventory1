using { mydb} from '../db/schema';



service inventoryService {
    entity Material as projection on mydb.Material;

    entity Category as projection on mydb.Category;
    @odata.query: true // Enable query options
    entity StorageLocation as projection on mydb.StorageLocation;

    entity Subcomponent as projection on mydb.Subcomponent;


    entity Material_Status as projection on mydb.Material_Status;

    entity serviceRequest as projection on mydb.serviceRequest
        
    

    

}