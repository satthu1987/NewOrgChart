export interface IOrgItem {
    Id: number;
    Title: string;       // person name
    JobTitle?: string;
    ManagerId?: number;  // lookup internal field ManagerId
    Branch?: string;
    PhotoURL?: string;
    Order?: number;
    PageURL?: string;
  }