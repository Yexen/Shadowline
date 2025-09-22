'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Clock, MapPin, Users, ExternalLink, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  source: 'local' | 'google';
  googleEventId?: string;
}

interface EnhancedCalendarProps {
  className?: string;
}

export function EnhancedCalendar({ className }: EnhancedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnectedToGoogle, setIsConnectedToGoogle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
    isAllDay: false
  });

  // Load events from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEvents = localStorage.getItem('alfred-calendar-events');
        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          setEvents(parsed.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          })));
        }
      } catch (error) {
        console.error('Failed to load calendar events:', error);
      }

      // Check if Google Calendar is connected
      const googleConnected = localStorage.getItem('alfred-google-calendar-connected');
      setIsConnectedToGoogle(googleConnected === 'true');
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && events.length > 0) {
      try {
        localStorage.setItem('alfred-calendar-events', JSON.stringify(events));
      } catch (error) {
        console.error('Failed to save calendar events:', error);
      }
    }
  }, [events]);

  const connectToGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      // This would implement the actual Google Calendar OAuth flow
      // For now, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock some Google Calendar events
      const mockGoogleEvents: CalendarEvent[] = [
        {
          id: 'google-1',
          title: 'Team Meeting',
          description: 'Weekly team sync',
          start: new Date(2025, 8, 25, 10, 0),
          end: new Date(2025, 8, 25, 11, 0),
          location: 'Conference Room A',
          attendees: ['team@example.com'],
          source: 'google',
          googleEventId: 'google-event-1'
        },
        {
          id: 'google-2',
          title: 'Project Review',
          description: 'Review Batman storyline progress',
          start: new Date(2025, 8, 26, 14, 0),
          end: new Date(2025, 8, 26, 15, 30),
          location: 'Virtual Meeting',
          source: 'google',
          googleEventId: 'google-event-2'
        }
      ];

      setEvents(prev => [...prev, ...mockGoogleEvents]);
      setIsConnectedToGoogle(true);
      localStorage.setItem('alfred-google-calendar-connected', 'true');
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
    } finally {
      setIsLoading(false);
      setShowSettingsDialog(false);
    }
  };

  const disconnectFromGoogle = () => {
    setEvents(prev => prev.filter(event => event.source !== 'google'));
    setIsConnectedToGoogle(false);
    localStorage.setItem('alfred-google-calendar-connected', 'false');
    setShowSettingsDialog(false);
  };

  const syncWithGoogle = async () => {
    if (!isConnectedToGoogle) return;
    
    setIsLoading(true);
    try {
      // Simulate syncing
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real implementation, this would fetch latest events from Google Calendar
    } catch (error) {
      console.error('Failed to sync with Google Calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.start) return;

    const startDate = new Date(newEvent.start);
    const endDate = newEvent.end ? new Date(newEvent.end) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const event: CalendarEvent = {
      id: `local-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      start: startDate,
      end: endDate,
      location: newEvent.location,
      isAllDay: newEvent.isAllDay,
      source: 'local'
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({
      title: '',
      description: '',
      start: '',
      end: '',
      location: '',
      isAllDay: false
    });
    setShowEventDialog(false);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const getEventsForSelectedDate = (): CalendarEvent[] => {
    return getEventsForDate(selectedDate);
  };

  const hasEventsOnDate = (date: Date): boolean => {
    return getEventsForDate(date).length > 0;
  };

  const formatEventTime = (event: CalendarEvent): string => {
    if (event.isAllDay) return 'All day';
    const start = format(event.start, 'HH:mm');
    const end = format(event.end, 'HH:mm');
    return `${start} - ${end}`;
  };

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
            {isConnectedToGoogle && (
              <Badge variant="secondary" className="ml-2">
                <ExternalLink className="h-3 w-3 mr-1" />
                Gmail
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isConnectedToGoogle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={syncWithGoogle}
                disabled={isLoading}
                className="h-8 w-8 p-0"
                title="Sync with Google Calendar"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            )}
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Calendar Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Calendar Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Google Calendar Integration</h4>
                    {!isConnectedToGoogle ? (
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            Connect your Google Calendar to sync events automatically and access your schedule from anywhere.
                          </div>
                        </div>
                        <Button onClick={connectToGoogleCalendar} disabled={isLoading} className="w-full">
                          {isLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Connect Google Calendar
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <div className="h-2 w-2 bg-green-600 rounded-full" />
                          Connected to Google Calendar
                        </div>
                        <Button onClick={disconnectFromGoogle} variant="outline" className="w-full">
                          Disconnect Google Calendar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-1" />
                  Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Title</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Event title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-start">Start Time</Label>
                      <Input
                        id="event-start"
                        type="datetime-local"
                        value={newEvent.start}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-end">End Time</Label>
                      <Input
                        id="event-end"
                        type="datetime-local"
                        value={newEvent.end}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Event description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addEvent} disabled={!newEvent.title || !newEvent.start}>
                      Add Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Component */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasEvents: (date) => hasEventsOnDate(date)
            }}
            modifiersStyles={{
              hasEvents: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '4px'
              }
            }}
          />
        </div>

        {/* Selected Date Events */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h4>
            {getEventsForSelectedDate().length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getEventsForSelectedDate().length} event{getEventsForSelectedDate().length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {getEventsForSelectedDate().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No events scheduled</p>
                </div>
              ) : (
                getEventsForSelectedDate().map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg border border-border bg-background/50 space-y-2",
                      event.source === 'google' && "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm">{event.title}</h5>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatEventTime(event)}</span>
                          {event.source === 'google' && (
                            <Badge variant="outline" className="text-xs h-4">
                              Gmail
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.description && (
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}