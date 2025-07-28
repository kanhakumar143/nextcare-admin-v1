"use client"

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from "zod";
import { Plus, Trash2, Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import { AddDoctorPayload } from '@/types/admin.types';
import { addDoctor } from '@/services/admin.api';
import FormModal from '../../common/FormModal';






export default function DoctorManagement (){

  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDoctorId, setEditDoctorId] = useState<string | null>(null);


    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by Doctor Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            // reset();
            setEditDoctorId(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editDoctorId ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
            </DialogHeader>
           
            <FormModal
                open={open}
                onOpenChange={(val) => {
                  setOpen(val);
                  if (!val) {
                    // reset();
                    setEditDoctorId(null);
                  }
                }}
              />
          </DialogContent>
        </Dialog>
      </div>

            {/* <DataTable
            // columns={columns}
            data={doctors}
            // filterColumn='practitioner.name.given'
            externalFilterValue={filterValue}
            /> */}

        </div>
    )
}