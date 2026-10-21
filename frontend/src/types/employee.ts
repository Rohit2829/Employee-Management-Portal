/**
 * Employee Type Definitions
 */

export interface IEmployee {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: number;
  location?: string;
  createdBy?: number;
  updatedOn?: string;
  updatedBy?: number;
  isDeleted?: number;
  deletedOn?: string;
  deletedBy?: number;
  password?: string;
}

export interface IEmployeeFilter {
  currentPage: number;
  pageSize: number;
  searchText: string;
  totalRows: number;
  filterRowsCount: number;
}

export interface IApiResponse {
  data: any;
  dataResponse: {
    returnCode: number;
    description: string;
    dateTime: string;
  };
  filterModel?: IEmployeeFilter;
}
