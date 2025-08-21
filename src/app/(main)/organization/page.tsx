
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, CheckSquare, Clipboard, Plus } from "lucide-react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function OrganizationPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Outline Chapter 3", completed: false },
    { id: 2, text: "Research Arkham's history", completed: true },
    { id: 3, text: "Develop Catwoman's backstory", completed: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [notes, setNotes] = useState("Remember to check the old case files for details on the Falcone crime family's downfall.\n\nNeed to define the exact chemical compound for the new fear toxin variant.");

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


  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          Mission control. Organize your schedule, tasks, and notes to keep your project on track.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
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
                    <CardTitle className="font-headline flex items-center gap-2"><Clipboard/> Field Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={8}
                        className="font-code"
                        placeholder="Jot down your secret notes here..."
                    />
                </CardContent>
            </Card>
        </div>
        
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
      </div>
    </div>
  );
}
