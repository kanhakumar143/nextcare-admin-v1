import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Array<{ id: string; name: string }>;
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  onApply: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  services,
  selectedService,
  onServiceChange,
  onApply,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter by Service</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedService}
            onValueChange={onServiceChange}
          >
            <SelectContent>
              {services.map((srv) => (
                <SelectItem key={srv.id} value={srv.id}>
                  {srv.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onApply}>
            Apply Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
