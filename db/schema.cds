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
    MaterialCode     : String(20);
    Parent           : Association to Material;
    Quantity         : Integer;
}
entity serviceRequest : managed {
    key reqNo : Integer;
    Materials : Composition of many rqMaterial on Materials.reqNo = $self.reqNo; 
    createdBy : String(100) @cds.on.insert : $user.id; 
    reqStatus : String(20);
}

entity rqMaterial : managed {
    key reqNo        : Integer;
    key MaterialCode : String(20);
    Category         : String(1);
    Description      : String(255);
    MatStatus        : String(20);
    MatRemarks       : String(255);                                                                                                                                                                  
    Quantity         : Integer;
    SubcomponentList : Composition of many rqSubMaterial on SubcomponentList.Parent_MaterialCode = $self.MaterialCode;
}
entity rqSubMaterial : managed {
    
    key Parent_MaterialCode : String(20);
    key MaterialCode        : String(20);
    key reqNo               : Integer;
    Category                : String(1);
    Description             : String(20);
    MatStatus               : String;
    MatRemarks              :String;
    Quantity                : Integer;
}

entity splitMaterilalTable {
    key reqNo           : Integer;
    key MaterialCode    : String(20);
    key MatStatus          : String;
    Quantity            : Integer;
    MatRemarks             : String;
}

entity splitSubMaterialTable {
    key reqNo : Integer;
    key MaterialCode : String;
    key Parent_MaterialCode : String;
    key MatStatus : String;
    Quantity : Integer;
    MatRemarks : String
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
 