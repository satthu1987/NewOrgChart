export interface IOrgItem {
    Id: number;
    Title: string;       // person name
    JobTitle?: string;
    ManagerId?: number;  // lookup internal field ManagerId
    Branch?: string;
    PhotoUrl?: string;
    SortOrder?: number;
    PageUrl?: string;
    IsLeaf?:boolean;
    ShowPhoto?:boolean;
  }