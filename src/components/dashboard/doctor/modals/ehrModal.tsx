"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NestedTableComponent from "@/components/common/NestedTableComponent";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  toggleEhrViewModal,
  type EHR,
  fetchEHRsByPatient,
} from "@/store/slices/ehrSlice";
import { useEffect } from "react";
import EhrViewModal from "./EhrViewModal";

interface EhrModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | undefined;
}

export default function EhrModal({ isOpen, onClose, patientId }: EhrModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { ehrList, loading, error } = useSelector((state: RootState) => state.ehr);

  useEffect(() => {
    if (patientId && isOpen) {
      dispatch(fetchEHRsByPatient(patientId));
    }
  }, [patientId, isOpen, dispatch]);

  const handleViewEhr = (ehr: EHR) => {
    dispatch(toggleEhrViewModal({ isOpen: true, ehr }));
  };

  const ehrColumns = [
    { label: "Type", accessor: "type" },
    { label: "File Type", accessor: "file_type" },
    { label: "Description", accessor: "description" },
    { label: "Uploaded At", accessor: "created_at" },
    {
      label: "View",
      accessor: "actions",
      cellRenderer: (ehr: EHR) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewEhr(ehr)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Patient Health Records</DialogTitle>
          </DialogHeader>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <NestedTableComponent
              caption="EHR Records"
              columns={ehrColumns}
              data={ehrList}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Nested modal for viewing individual EHR */}
      <EhrViewModal />
    </>
  );
}
