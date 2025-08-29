"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../ui/badge";
import moment from "moment";

function getNestedValue<T, R = unknown>(
  obj: T,
  accessor: string
): R | undefined {
  const parts = accessor.replace(/\[(\d+)\]/g, ".$1").split(".");

  return parts.reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc === "object" || Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as R | undefined;
}

const getBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "fulfilled":
      return "bg-green-700";
    case "cancelled":
      return "bg-red-700";
    case "pending":
      return "bg-orange-800";
    case "completed":
      return "bg-green-600";
    default:
      return "default";
  }
};

type Column<T> = {
  label: string;
  accessor: keyof T | string;
  className?: string;
  cellClassName?: string;
  cellRenderer?: (item: T) => React.ReactNode;
};

type FooterItem = {
  colSpan: number;
  content: React.ReactNode;
  className?: string;
};

interface TableComponentProps<T> {
  caption?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  footer?: FooterItem[];
}

const NestedTableComponent = <T,>({
  caption,
  columns,
  data,
  footer,
}: TableComponentProps<T>) => {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}

          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className || ""}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => {
                    const value = getNestedValue(
                      row,
                      column.accessor as string
                    );

                    return (
                      <TableCell
                        key={colIndex}
                        className={column.cellClassName || ""}
                      >
                        {column.accessor === "status" &&
                        typeof value === "string" ? (
                          <Badge
                            className={`capitalize ${getBadgeVariant(value)}`}
                          >
                            {value === "fulfilled" ? "Completed" : value}
                          </Badge>
                        ) : ["created_at", "date", "created"].includes(
                            column.accessor as string
                          ) && typeof value === "string" ? (
                          moment(value).format("DD/MM/YYYY h:mm A")
                        ) : column.label === "Visit" &&
                          value === "Outpatient" ? (
                          "In-Clinic Visit"
                        ) : column.cellRenderer ? (
                          column.cellRenderer(row)
                        ) : (
                          <span className="capitalize">
                            {String(value ?? "")}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>

          {footer && (
            <TableFooter>
              <TableRow>
                {footer.map((footerItem, index) => (
                  <TableCell
                    key={index}
                    colSpan={footerItem.colSpan}
                    className={footerItem.className || ""}
                  >
                    {footerItem.content}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <div className="block md:hidden space-y-2">
        {data.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No data available
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="border border-orange-50 shadow-sm rounded-lg p-2 space-y-1 bg-white"
            >
              {columns.map((column, colIndex) => {
                const value = getNestedValue(row, column.accessor as string);
                const renderedValue =
                  column.accessor === "status" && typeof value === "string" ? (
                    <Badge className={getBadgeVariant(value)}>{value}</Badge>
                  ) : ["created_at", "date", "created"].includes(
                      column.accessor as string
                    ) && typeof value === "string" ? (
                    moment(value).format("DD/MM/YYYY h:mm A")
                  ) : column.label === "Visit" && value === "Outpatient" ? (
                    "In-Clinic Visit"
                  ) : column.cellRenderer ? (
                    column.cellRenderer(row)
                  ) : (
                    String(value ?? "")
                  );

                return (
                  <div key={colIndex} className="flex justify-between">
                    <span className="font-medium text-gray-600 text-sm">
                      {column.label}
                    </span>
                    <span className="text-right font-light text-sm text-gray-500">
                      {renderedValue}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default NestedTableComponent;
