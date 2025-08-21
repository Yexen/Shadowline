
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckSquare, Clipboard, Plus, Trash2 } from "lucide-react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Note {
  id: number;
  text: string;
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
            { id: Date.now(), text: newNote, completed: false },
        ]);
        setNewNote('');
    }
  }

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
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
