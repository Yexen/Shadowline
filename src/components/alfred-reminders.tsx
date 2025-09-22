'use client';

import { useState, useEffect } from 'react';
import { alfredReminders, Reminder } from '@/lib/alfred-reminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Trash2, CheckCircle, Bell, Plus, Calendar, AlertCircle, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlfredRemindersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlfredReminders({ isOpen, onClose }: AlfredRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [selectedTab, setSelectedTab] = useState<'active' | 'all'>('active');

  useEffect(() => {
    // Load initial reminders
    setReminders(alfredReminders.getAllReminders());

    // Subscribe to reminder updates
    const unsubscribe = alfredReminders.subscribe((updatedReminders) => {
      setReminders(updatedReminders);
    });

    return unsubscribe;
  }, []);

  const handleCreateReminder = () => {
    if (!newReminderText.trim()) return;

    const reminder = alfredReminders.createReminder(newReminderText);
    if (reminder) {
      setNewReminderText('');
    } else {
      // Show error message if parsing failed
      alert('Sorry, I couldn\'t understand the time. Try formats like "remind me to call mom at 2pm" or "remind me to check email in 30 minutes"');
    }
  };

  const handleCompleteReminder = (reminderId: string) => {
    alfredReminders.completeReminder(reminderId);
  };

  const handleDeleteReminder = (reminderId: string) => {
    alfredReminders.deleteReminder(reminderId);
  };

  const handleSnoozeReminder = (reminderId: string) => {
    alfredReminders.snoozeReminder(reminderId, 10);
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const displayReminders = selectedTab === 'active' ? activeReminders : reminders;

  const isReminderOverdue = (reminder: Reminder) => {
    return reminder.isActive && reminder.scheduledTime < new Date();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Alfred's Reminders</span>
            <Badge variant="secondary" className="ml-auto">
              {activeReminders.length} active
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Reminder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Reminder</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="e.g., 'remind me to call mom at 2pm' or 'remind me to check email in 30 minutes'"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateReminder();
                  }
                }}
                className="text-sm"
              />
              <Button
                onClick={handleCreateReminder}
                disabled={!newReminderText.trim()}
                className="w-full"
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
              <div className="text-xs text-muted-foreground">
                <p><strong>Examples:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>"remind me to call mom at 2pm"</li>
                  <li>"remind me to check email in 30 minutes"</li>
                  <li>"remind me to take medication tomorrow at 9am"</li>
                  <li>"remind me to review documents next Monday"</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex space-x-2">
            <Button
              variant={selectedTab === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('active')}
              className="flex items-center space-x-2"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Active ({activeReminders.length})</span>
            </Button>
            <Button
              variant={selectedTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('all')}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>All ({reminders.length})</span>
            </Button>
          </div>

          {/* Reminders List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {displayReminders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {selectedTab === 'active'
                        ? "No active reminders. Ask Alfred to 'remind me' of something!"
                        : "No reminders yet. Create your first reminder above."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                displayReminders.map((reminder) => (
                  <Card
                    key={reminder.id}
                    className={cn(
                      "transition-all duration-200",
                      !reminder.isActive && "opacity-60",
                      isReminderOverdue(reminder) && "border-destructive bg-destructive/5"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium truncate">
                              {reminder.title}
                            </h4>
                            <Badge
                              variant={reminder.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {reminder.isActive ? 'Active' : 'Completed'}
                            </Badge>
                            {isReminderOverdue(reminder) && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {reminder.message}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{alfredReminders.formatReminderTime(reminder.scheduledTime)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created {reminder.createdTime.toLocaleDateString()}</span>
                            </div>
                          </div>

                          {reminder.originalInput && (
                            <div className="mt-2 text-xs text-muted-foreground bg-accent/50 rounded px-2 py-1">
                              Original: "{reminder.originalInput}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1">
                          {reminder.isActive && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompleteReminder(reminder.id)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Mark as completed"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSnoozeReminder(reminder.id)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Snooze for 10 minutes"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            title="Delete reminder"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Quick Stats */}
          {reminders.length > 0 && (
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total reminders: {reminders.length}</span>
                  <span>Active: {activeReminders.length}</span>
                  <span>
                    Next: {activeReminders.length > 0
                      ? alfredReminders.formatReminderTime(activeReminders[0].scheduledTime)
                      : 'None'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick reminder creation component for embedding in other UIs
export function QuickReminderCreator({ onReminderCreated }: { onReminderCreated?: () => void }) {
  const [reminderText, setReminderText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!reminderText.trim()) return;

    setIsCreating(true);
    const reminder = alfredReminders.createReminder(reminderText);

    if (reminder) {
      setReminderText('');
      onReminderCreated?.();
    } else {
      alert('Could not parse the reminder time. Try a different format.');
    }

    setIsCreating(false);
  };

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="remind me to..."
        value={reminderText}
        onChange={(e) => setReminderText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleCreate();
          }
        }}
        className="flex-1"
        disabled={isCreating}
      />
      <Button
        onClick={handleCreate}
        disabled={!reminderText.trim() || isCreating}
        size="sm"
      >
        <Clock className="h-4 w-4" />
      </Button>
    </div>
  );
}