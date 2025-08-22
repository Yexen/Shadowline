
'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/hooks/use-modal-store';
import { Volume } from '@/hooks/use-volumes';

interface OutlinePopoverProps {
  children: React.ReactNode;
  volume: Volume;
}

export function OutlinePopover({ children, volume }: OutlinePopoverProps) {
  const { openModal } = useModalStore();

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('overview', { volume })}
          >
            Overview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('resources', { volume })}
          >
            Resources
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
