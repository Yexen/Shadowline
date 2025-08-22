
'use client';

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BookOpen, Files, MoreHorizontal } from "lucide-react";
import { useModalStore } from "@/hooks/use-modal-store";

interface OutlinePopoverProps {
  volumeId: string;
  children: React.ReactNode;
}

export function OutlinePopover({ volumeId, children }: OutlinePopoverProps) {
  const { openModal } = useModalStore();

  const handleOpenOverview = () => {
    openModal('overview', { id: volumeId });
  };
  
  const handleOpenResources = () => {
    openModal('resources', { id: volumeId });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" className="w-full justify-start" onClick={handleOpenOverview}>
            <BookOpen className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={handleOpenResources}>
            <Files className="mr-2 h-4 w-4" />
            Resources
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
