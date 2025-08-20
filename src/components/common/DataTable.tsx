"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
  ColumnFiltersState,
  RowData,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  filterColumn?: keyof TData;
  externalFilterValue?: string;
  onAdd?: () => void;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  filterColumn,
  externalFilterValue = "",
  onAdd,
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Sync external filter value into the table
  useEffect(() => {
    if (filterColumn !== undefined) {
      table
        .getColumn(filterColumn as string)
        ?.setFilterValue(externalFilterValue ?? "");
    }
  }, [externalFilterValue, filterColumn, table]);

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        {onAdd && <Button onClick={onAdd}>Add</Button>}
        {filterColumn && (
          <Input
            placeholder="Search..."
            value={
              (table.getColumn(filterColumn as string)?.getFilterValue() as string) ??
              ''
            }
            onChange={(e) =>
              table.getColumn(filterColumn as string)?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        )}
      </div> */}

      <Table>
        <TableHeader className="bg-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="capitalize">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-500"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                isActive={table.getCanPreviousPage()}
              />
            </PaginationItem>

            <PaginationItem className="px-3 py-1 border rounded">
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
