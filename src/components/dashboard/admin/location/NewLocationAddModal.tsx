"use client";

import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { AppDispatch, RootState } from "@/store";
import { setIsLocationAddModalOpen } from "@/store/slices/adminSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const NewLocationAddModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLocationAddModal } = useSelector((state: RootState) => state.admin);
  const onClose = () => {
    dispatch(setIsLocationAddModalOpen(false));
  };
  return (
    <Dialog open={isLocationAddModal} onOpenChange={onClose}>
      <DialogTrigger>
        <Button
        // onClick={() => {
        //   dispatch(setIsLocationAddModalOpen(true));
        // }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default NewLocationAddModal;
