using { cuid,  managed} from '@sap/cds/common';

namespace mydb;

entity Material  {

    key MaterialCode     : String(20);                      
    Category             : String(1);       
    Description          : String(255);                    
    Status               : String(20);
    Quantity             : Integer;  
    SubcomponentList     : Composition of many Subcomponent on SubcomponentList.Parent = $self;  

}

entity Subcomponent {
    key ID           : Integer;  
    Category         : String(1);
    Description      : String(20);
    MaterialCode     : String(10);
    Parent           : Association to Material;
    Quantity         : Integer;
}
entity serviceRequest : managed {

    key reqNo : Integer;
    Materials : array of rqMaterial;
    createdBy : String(100) @cds.on.insert : $user.id; 
    reqStatus : String(20);

}
type  rqMaterial {
    reqNo            : Integer;
    Category         : String(1);
    MaterialCode     : String(20);
    Description      : String(255);
    Status           : String(20);
    Remarks          : String(255);
    Quantity         : Integer;
    SubcomponentList :  array of rqSubMaterial;
}
type rqSubMaterial {
    Category            : String(1);
    Description         : String(20);
    MaterialCode        : String(10);
    Quantity            : Integer;
    Parent_MaterialCode : String(20);


}
entity Category  {
    key ID               : String(10);                      
    Type                 : String(1);  
    StorageLocation      : Association to one StorageLocation;  
    Usability            : String(255);
    Zcode                : String(5);

}

entity StorageLocation {
    key LocationID       : String(10);            
    LocationName         : String(100);                       
}


entity Material_Status {
    key StatusCode : String(3);
    Description    : String(50);
}
 