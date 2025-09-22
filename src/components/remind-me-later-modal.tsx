'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { alfredReminders } from '@/lib/alfred-reminders';
import Image from 'next/image';

interface RemindMeLaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationTitle: string;
  notificationMessage: string;
}

export function RemindMeLaterModal({ 
  isOpen, 
  onClose, 
  notificationTitle, 
  notificationMessage 
}: RemindMeLaterModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [quickOption, setQuickOption] = useState('');

  if (!isOpen) return null;

  const handleQuickOption = (option: string) => {
    setQuickOption(option);
    const now = new Date();
    let reminderTime: Date;

    switch (option) {
      case '15min':
        reminderTime = new Date(now.getTime() + 15 * 60 * 1000);
        break;
      case '1hour':
        reminderTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case '3hours':
        reminderTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        break;
      case 'tomorrow':
        reminderTime = new Date(now);
        reminderTime.setDate(now.getDate() + 1);
        reminderTime.setHours(9, 0, 0, 0);
        break;
      case 'next_week':
        reminderTime = new Date(now);
        reminderTime.setDate(now.getDate() + 7);
        reminderTime.setHours(9, 0, 0, 0);
        break;
      default:
        return;
    }

    setSelectedDate(reminderTime);
    setSelectedTime(format(reminderTime, 'HH:mm'));
  };

  const handleSetReminder = () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const reminderDate = new Date(selectedDate);
    reminderDate.setHours(hours, minutes, 0, 0);

    // Create reminder using Alfred's reminder system
    const reminderText = `Reminder about: ${notificationTitle} - ${notificationMessage}`;
    const reminder = alfredReminders.createReminder(`remind me at ${format(reminderDate, 'MMM dd, yyyy HH:mm')} ${reminderText}`);

    if (reminder) {
      // Success feedback could be shown here
      console.log('Reminder set successfully:', reminder);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <Card className="relative w-full max-w-md mx-4 bg-card border-border shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/alfred-avatar.png"
                alt="Alfred"
                width={32}
                height={32}
                className="w-8 h-8 object-cover"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
                  borderRadius: '0'
                }}
              />
              <CardTitle className="text-lg">Remind Me Later</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground">{notificationTitle}</h4>
            <p className="text-xs text-muted-foreground mt-1">{notificationMessage}</p>
          </div>

          {/* Quick Options */}
          <div>
            <Label className="text-sm font-medium">Quick Options</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={quickOption === '15min' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickOption('15min')}
                className="text-xs"
              >
                In 15 minutes
              </Button>
              <Button
                variant={quickOption === '1hour' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickOption('1hour')}
                className="text-xs"
              >
                In 1 hour
              </Button>
              <Button
                variant={quickOption === '3hours' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickOption('3hours')}
                className="text-xs"
              >
                In 3 hours
              </Button>
              <Button
                variant={quickOption === 'tomorrow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickOption('tomorrow')}
                className="text-xs"
              >
                Tomorrow 9AM
              </Button>
            </div>
            <Button
              variant={quickOption === 'next_week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickOption('next_week')}
              className="text-xs w-full mt-2"
            >
              Next week
            </Button>
          </div>

          {/* Custom Date & Time */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Custom Date & Time</Label>
            
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs">Time</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSetReminder}
              disabled={!selectedDate || !selectedTime}
              className="bg-primary hover:bg-primary/90"
            >
              Set Reminder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}