"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Gift, Calendar, Target } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { Reward } from "@/types/reward.types";

export default function Rewards() {
  const router = useRouter();
  const { items: rewards } = useAppSelector((state) => state.reward);
  const [filterValue, setFilterValue] = useState("");

  const handleAddReward = () => {
    router.push("/dashboard/admin/rewards/add");
  };

  const columns: ColumnDef<Reward>[] = [
    {
      accessorKey: "id",
      header: "Reward ID",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        return <span className="font-mono text-sm">{id?.slice(0, 8)}...</span>;
      }
    },
    { accessorKey: "name", header: "Program Name" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => {
        const description = getValue() as string;
        return (
          <span className="max-w-xs truncate block" title={description}>
            {description}
          </span>
        );
      }
    },
    {
      accessorKey: "rules",
      header: "Rules Count",
      cell: ({ getValue }) => {
        const rules = getValue() as Reward["rules"];
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {rules?.length || 0} rules
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessorFn: (row: Reward) => row.active,
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        if (!date) return "-";
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: () => (
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10"
        // onClick={() => handleEdit(row.original)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary" />
            Reward Programs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient reward programs and incentives
          </p>
        </div>
        <Button onClick={handleAddReward} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Reward Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.length}</div>
            <p className="text-xs text-muted-foreground">
              Reward programs created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rewards.filter(r => r.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rewards.reduce((acc, r) => acc + (r.rules?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Reward rules configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reward Programs</CardTitle>
            <Input
              placeholder="Search by program name..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rewards}
            filterColumn="name"
            externalFilterValue={filterValue}
          />
        </CardContent>
      </Card>


    </div>
  );
}
