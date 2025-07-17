"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setImageModalVisible } from "@/store/slices/receptionistSlice";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function DocumentViewModal({ imageUrl }: { imageUrl: string }) {
  const dispatch = useDispatch();
  const { imageModalVisible } = useSelector(
    (state: RootState) => state.receptionistData
  );

  return (
    <Dialog
      open={imageModalVisible}
      onOpenChange={() => dispatch(setImageModalVisible(false))}
    >
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-md rounded-xl">
        <div>
          <Image src={imageUrl} alt="Government ID" width={400} height={420} />
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={() => {
              dispatch(setImageModalVisible(false));
            }}
            className="w-full"
          >
            close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
