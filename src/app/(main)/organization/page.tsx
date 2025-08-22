
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckSquare, Clipboard, Plus, Trash2, Lightbulb, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

export default function OrganizationPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
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
          Mission control. Organize your schedule, tasks, and notes to keep your project on track.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><CalendarDays/> Mission Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
              </CardContent>
            </Card>
             <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> Field Ideas</CardTitle>
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
                            <Button variant="link" className="p-0 h-auto">More...</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="font-headline">All Ideas</DialogTitle>
                                <DialogDescription>
                                    Browse, search, and manage all your story ideas.
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
                                        <Button><Plus className="mr-2"/> Add New Idea</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create a New Idea</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="idea-title">Subject</Label>
                                                <Input id="idea-title" value={newIdeaTitle} onChange={e => setNewIdeaTitle(e.target.value)} placeholder="A catchy title for your idea"/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="idea-content">Body</Label>
                                                <Textarea id="idea-content" value={newIdeaContent} onChange={e => setNewIdeaContent(e.target.value)} placeholder="Describe your idea in detail..." className="min-h-[120px]"/>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setNewIdeaDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddIdea}>Save Idea</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" onClick={() => setIdeasDialogOpen(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><CheckSquare /> Task List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new task..."
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
                    <CardTitle className="font-headline flex items-center gap-2"><Clipboard/> Field Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a new note..."
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
