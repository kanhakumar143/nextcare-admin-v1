"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCheckinSuccessModal } from "@/store/slices/receptionistSlice";

export default function ConfirmCheckedInModal() {
  const dispatch = useDispatch();
  const { checkinSuccessModalVisible } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const handleVerifyPatient = async () => {
    dispatch(setCheckinSuccessModal(false));
  };

  return (
    <Dialog
      open={checkinSuccessModalVisible}
      onOpenChange={() => dispatch(setCheckinSuccessModal(false))}
    >
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <CircleCheck className="w-12 h-12 text-green-500 animate-bounce" />
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Patient Checked-in
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Patient has been checked-in successfully.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button onClick={handleVerifyPatient} className="w-full">
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
