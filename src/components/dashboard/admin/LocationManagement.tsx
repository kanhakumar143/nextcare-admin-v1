'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ColumnDef, useReactTable, getCoreRowModel,ColumnFiltersState, getFilteredRowModel, flexRender, getPaginationRowModel } from '@tanstack/react-table';
import { Plus } from 'lucide-react';

type Location = {
  id: string;
  country: string;
  state: string;
  district: string;
  landmark: string;
  nearestTown: string;
  pincode: string;
};

export default function LocationManagement() {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    country: '',
    state: '',
    district: '',
    landmark: '',
    nearestTown: '',
    pincode: '',
  });

  const fetchLocations = async () => {
    try {
      const res = await axios.get('https://687f9ff2efe65e52008a6f5c.mockapi.io/locations');
      setLocations(res.data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddLocation = async () => {
    try {
      const res = await axios.post('https://687f9ff2efe65e52008a6f5c.mockapi.io/locations', formData);
      setLocations(prev => [...prev, res.data]);
      setOpen(false);
      setFormData({
        country: '',
        state: '',
        district: '',
        landmark: '',
        nearestTown: '',
        pincode: '',
      });
    } catch (err) {
      console.error('Failed to add location', err);
    }
  };

  const columns: ColumnDef<Location>[] = [
    { accessorKey: 'country', header: 'Country' },
    { accessorKey: 'state', header: 'State' },
    { accessorKey: 'district', header: 'District' },
    { accessorKey: 'landmark', header: 'Landmark' },
    { accessorKey: 'town', header: 'Nearest Town' },
    { accessorKey: 'pincode', header: 'Pincode' },
  ];

  const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 10,
});
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const table = useReactTable({
  data: locations,
  columns,
  state: {
    columnFilters,
    pagination },
 onPaginationChange: setPagination,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(), 
 getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(), 
});


  return (
    <div className="p-2">
      <div className="flex justify-between mb-4">

        <Input
          placeholder="Filter states..."
          value={(table.getColumn("state")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("state")?.setFilterValue(event.target.value)
          }
          className="max-w-sm "
        />
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {Object.keys(formData).map(key => (
                <Input
                  key={key}
                  name={key}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                />
              ))}
              <Button onClick={handleAddLocation}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader className='bg-gray-200'>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

     <div className="flex justify-end mt-3">
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          onClick={() => table.previousPage()}
          isActive={table.getCanPreviousPage()}
        />
      </PaginationItem>

      <PaginationItem className="px-2 text-sm flex items-center rounded-md border-2">
        {table.getState().pagination.pageIndex + 1}
      </PaginationItem>

      <PaginationItem>
        <PaginationNext
          onClick={() => table.nextPage()}
          isActive={table.getCanNextPage()}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
</div>


    </div>
  );
}
