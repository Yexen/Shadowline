
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckSquare, Clipboard, Plus, Trash2, Lightbulb, X, Clock, Timer, Bell, Play, Pause, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTimer } from '@/hooks/use-timer';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Note {
  id: number;
  text: string;
}

interface Idea {
    id: number;
    title: string;
    content: string;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
};

const translations = {
  en: {
    pageDescription: "Mission control. Organize your schedule, tasks, and notes to keep your project on track.",
    missionClock: "Mission Clock",
    sessionTime: "Session Time",
    schedule: "Schedule",
    focusTimer: "Focus Timer",
    fifteenMin: "15 min",
    twentyFiveMin: "25 min",
    fortyFiveMin: "45 min",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    permissionDenied: "Permission Denied",
    notificationsRequired: "Notifications are required for the alarm to work.",
    enableNotifications: "Please enable notifications in your browser settings.",
    fieldIdeas: "Field Ideas",
    more: "More...",
    allIdeas: "All Ideas",
    browseIdeas: "Browse, search, and manage all your story ideas.",
    addNewIdea: "Add New Idea",
    createIdea: "Create a New Idea",
    ideaSubject: "Subject",
    ideaSubjectPlaceholder: "A catchy title for your idea",
    ideaBody: "Body",
    ideaBodyPlaceholder: "Describe your idea in detail...",
    saveIdea: "Save Idea",
    close: "Close",
    taskList: "Task List",
    addTask: "Add a new task...",
    fieldNotes: "Field Notes",
    addNote: "Add a new note...",
    cancel: "Cancel",
  },
  fa: {
    pageDescription: "کنترل ماموریت. برنامه، وظایف و یادداشت‌های خود را برای پیشبرد پروژه‌تان سازماندهی کنید.",
    missionClock: "ساعت ماموریت",
    sessionTime: "زمان جلسه",
    schedule: "برنامه",
    focusTimer: "تایمر تمرکز",
    fifteenMin: "۱۵ دقیقه",
    twentyFiveMin: "۲۵ دقیقه",
    fortyFiveMin: "۴۵ دقیقه",
    start: "شروع",
    pause: "توقف",
    reset: "بازنشانی",
    permissionDenied: "دسترسی رد شد",
    notificationsRequired: "اعلان‌ها برای کارکرد زنگ هشدار لازم است.",
    enableNotifications: "لطفاً اعلان‌ها را در تنظیمات مرورگر خود فعال کنید.",
    fieldIdeas: "ایده‌های میدانی",
    more: "بیشتر...",
    allIdeas: "همه ایده‌ها",
    browseIdeas: "ایده‌های داستانی خود را مرور، جستجو و مدیریت کنید.",
    addNewIdea: "افزودن ایده جدید",
    createIdea: "ایجاد یک ایده جدید",
    ideaSubject: "موضوع",
    ideaSubjectPlaceholder: "یک عنوان جذاب برای ایده شما",
    ideaBody: "بدنه",
    ideaBodyPlaceholder: "ایده خود را با جزئیات توصیف کنید...",
    saveIdea: "ذخیره ایده",
    close: "بستن",
    taskList: "لیست وظایف",
    addTask: "افزودن یک وظیفه جدید...",
    fieldNotes: "یادداشت‌های میدانی",
    addNote: "افزودن یک یادداشت جدید...",
    cancel: "لغو",
  }
};

function MissionClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return <p className="text-4xl font-bold font-mono tracking-wider">{time.toLocaleTimeString()}</p>;
}

function FocusTimer({ t }: { t: typeof translations['en'] }) {
    const { 
        focusTime, 
        focusTimeLeft, 
        isFocusTimerRunning, 
        setFocusTime, 
        toggleFocusTimer, 
        resetFocusTimer 
    } = useTimer();
    const { toast } = useToast();

    const handleSetTime = (minutes: number) => {
        setFocusTime(minutes * 60);
    };
    
    const handleToggle = async () => {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast({
                    variant: 'destructive',
                    title: t.permissionDenied,
                    description: t.notificationsRequired,
                });
                return;
            }
        } else if (Notification.permission === 'denied') {
             toast({
                variant: 'destructive',
                title: t.permissionDenied,
                description: t.enableNotifications,
            });
            return;
        }
        toggleFocusTimer();
    };

    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Bell/> {t.focusTimer}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-5xl font-bold font-mono tracking-wider mb-4">{formatTime(focusTimeLeft)}</p>
                 {!isFocusTimerRunning ? (
                    <div className="flex gap-2 justify-center mb-4">
                        <Button variant="outline" size="sm" onClick={() => handleSetTime(15)}>{t.fifteenMin}</Button>
                        <Button variant="outline" size="sm" onClick={() => handleSetTime(25)}>{t.twentyFiveMin}</Button>
                        <Button variant="outline" size="sm" onClick={() => handleSetTime(45)}>{t.fortyFiveMin}</Button>
                    </div>
                 ) : null}
                 <div className="flex gap-2 justify-center">
                    <Button onClick={handleToggle} disabled={focusTime === 0}>
                        {isFocusTimerRunning ? <Pause className="mr-2 rtl:ml-2 rtl:mr-0"/> : <Play className="mr-2 rtl:ml-2 rtl:mr-0"/>}
                        {isFocusTimerRunning ? t.pause : t.start}
                    </Button>
                    <Button variant="secondary" onClick={resetFocusTimer}><RotateCcw className="mr-2 rtl:ml-2 rtl:mr-0"/> {t.reset}</Button>
                 </div>
            </CardContent>
        </Card>
    )
}

export default function OrganizationPage() {
  const { sessionTime } = useTimer();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Outline Chapter 3", completed: false },
    { id: 2, text: "Research Arkham's history", completed: true },
    { id: 3, text: "Develop Catwoman's backstory", completed: false },
  ]);
  const [newTask, setNewTask] = useState('');
  
  const [notes, setNotes] = useState<Note[]>([
      { id: 1, text: "Check old case files for Falcone crime family details." },
      { id: 2, text: "Define the chemical compound for the new fear toxin." },
  ]);
  const [newNote, setNewNote] = useState('');

  const [ideas, setIdeas] = useState<Idea[]>([
      { id: 1, title: "A villain who uses sound as a weapon.", content: "A former audio engineer, embittered by the music industry, develops sonic technology that can manipulate emotions or cause physical damage. They could target concert halls or broadcast towers." },
      { id: 2, title: "A story told from Alfred's perspective.", content: "An entire issue or chapter focusing on Alfred's daily routine, his worries about Bruce, and how he secretly aids Batman's mission from the manor. Show his own detective work and contributions." },
      { id: 3, title: "The 'ghost' of Crime Alley.", content: "A new vigilante appears who only operates in Crime Alley, using theatrical, ghost-like tactics. Is it a supernatural force, or someone using fear in a new way? Batman investigates, forcing him to confront his own trauma." },
      { id: 4, title: "What if the GCPD had a competent forensics team?", content: "Explore a scenario where Batman has to work with a forensics team that is almost as good as he is. It could create tension and a professional rivalry, especially with Lucius Fox's tech." },
  ]);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [ideasDialogOpen, setIdeasDialogOpen] = useState(false);
  const [newIdeaDialogOpen, setNewIdeaDialogOpen] = useState(false);


  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask, completed: false },
      ]);
      setNewTask('');
    }
  };
  
  const handleAddNote = () => {
    if (newNote.trim()) {
        setNotes([
            ...notes,
            { id: Date.now(), text: newNote },
        ]);
        setNewNote('');
    }
  }

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  }

  const handleAddIdea = () => {
    if (newIdeaTitle.trim() && newIdeaContent.trim()) {
        setIdeas([
            { id: Date.now(), title: newIdeaTitle, content: newIdeaContent },
            ...ideas,
        ]);
        setNewIdeaTitle('');
        setNewIdeaContent('');
        setNewIdeaDialogOpen(false);
    }
  };

  const handleDeleteIdea = (id: number) => {
      setIdeas(ideas.filter(idea => idea.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          {t.pageDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Clock/> {t.missionClock}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <MissionClock />
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Timer size={14}/>
                    <span>{t.sessionTime}: {formatTime(sessionTime)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><CalendarIcon /> {t.schedule}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>

            <FocusTimer t={t} />
            
             <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> {t.fieldIdeas}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {ideas.slice(0, 3).map(idea => (
                        <div key={idea.id} className="border-b border-border/50 pb-2">
                            <h4 className="font-bold">{idea.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{idea.content}</p>
                        </div>
                    ))}
                    <Dialog open={ideasDialogOpen} onOpenChange={setIdeasDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto">{t.more}</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="font-headline">{t.allIdeas}</DialogTitle>
                                <DialogDescription>
                                    {t.browseIdeas}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-grow space-y-4 py-4 overflow-y-auto pr-4">
                                {ideas.map(idea => (
                                    <div key={idea.id} className="p-3 rounded-md bg-card group relative">
                                        <h4 className="font-bold">{idea.title}</h4>
                                        <p className="text-sm text-muted-foreground">{idea.content}</p>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteIdea(idea.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter className="justify-between">
                                <Dialog open={newIdeaDialogOpen} onOpenChange={setNewIdeaDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button><Plus className="mr-2 rtl:ml-2 rtl:mr-0"/> {t.addNewIdea}</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{t.createIdea}</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="idea-title">{t.ideaSubject}</Label>
                                                <Input id="idea-title" value={newIdeaTitle} onChange={e => setNewIdeaTitle(e.target.value)} placeholder={t.ideaSubjectPlaceholder}/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="idea-content">{t.ideaBody}</Label>
                                                <Textarea id="idea-content" value={newIdeaContent} onChange={e => setNewIdeaContent(e.target.value)} placeholder={t.ideaBodyPlaceholder} className="min-h-[120px]"/>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setNewIdeaDialogOpen(false)}>{t.cancel}</Button>
                                            <Button onClick={handleAddIdea}>{t.saveIdea}</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" onClick={() => setIdeasDialogOpen(false)}>{t.close}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><CheckSquare /> {t.taskList}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.addTask}
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <Button onClick={handleAddTask} size="icon"><Plus/></Button>
                  </div>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id)}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`flex-grow text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                        >
                          {task.text}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Clipboard/> {t.fieldNotes}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder={t.addNote}
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        />
                        <Button onClick={handleAddNote} size="icon"><Plus/></Button>
                      </div>
                      <div className="space-y-2 font-code">
                        {notes.map(note => (
                          <div key={note.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 group">
                            <span className="flex-grow text-sm">{note.text}</span>
                             <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
