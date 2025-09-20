
'use client';

import { useEffect, useState } from 'react';
import type { BiblePage } from '@/hooks/use-bible';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trash2, Edit, Eye, Plus, ArrowUp, ArrowDown } from 'lucide-react';

type EditMode = 'view' | 'edit';
type PageTab = 'main' | 'subpages';

interface SubPage {
    id: string;
    title: string;
    content: string;
    order: number;
}

interface ExtendedBiblePage extends BiblePage {
    subpages?: SubPage[];
}

interface ProfilePageEditorProps {
    page: BiblePage | null;
    onSave: (page: BiblePage) => void;
    onCancel: () => void;
    onDelete: (pageId: string) => void;
}

export function ProfilePageEditor({ page, onSave, onCancel, onDelete }: ProfilePageEditorProps) {
    const [currentPage, setCurrentPage] = useState<ExtendedBiblePage | null>(null);
    const [editMode, setEditMode] = useState<EditMode>('view');
    const [activeTab, setActiveTab] = useState<PageTab>('main');

    useEffect(() => {
        if (page) {
            const extendedPage: ExtendedBiblePage = {
                ...JSON.parse(JSON.stringify(page)),
                subpages: (page as any).subpages || []
            };
            setCurrentPage(extendedPage);
        }
    }, [page]);

    const handleSave = () => {
        if (currentPage) {
            onSave(currentPage);
        }
    };

    const handleAddSubpage = () => {
        if (!currentPage) return;
        const newSubpage: SubPage = {
            id: `subpage-${Date.now()}`,
            title: 'New Subpage',
            content: '',
            order: (currentPage.subpages?.length || 0) + 1
        };
        setCurrentPage({
            ...currentPage,
            subpages: [...(currentPage.subpages || []), newSubpage]
        });
    };

    const handleDeleteSubpage = (subpageId: string) => {
        if (!currentPage) return;
        setCurrentPage({
            ...currentPage,
            subpages: currentPage.subpages?.filter(sp => sp.id !== subpageId) || []
        });
    };

    const handleMoveSubpage = (subpageId: string, direction: 'up' | 'down') => {
        if (!currentPage?.subpages) return;
        const subpages = [...currentPage.subpages];
        const index = subpages.findIndex(sp => sp.id === subpageId);
        
        if (direction === 'up' && index > 0) {
            [subpages[index], subpages[index - 1]] = [subpages[index - 1], subpages[index]];
        } else if (direction === 'down' && index < subpages.length - 1) {
            [subpages[index], subpages[index + 1]] = [subpages[index + 1], subpages[index]];
        }
        
        // Update order numbers
        subpages.forEach((sp, i) => {
            sp.order = i + 1;
        });
        
        setCurrentPage({
            ...currentPage,
            subpages
        });
    };

    const handleUpdateSubpage = (subpageId: string, field: 'title' | 'content', value: string) => {
        if (!currentPage) return;
        setCurrentPage({
            ...currentPage,
            subpages: currentPage.subpages?.map(sp => 
                sp.id === subpageId ? { ...sp, [field]: value } : sp
            ) || []
        });
    };
    
    const handleDelete = () => {
        if (currentPage) {
            onDelete(currentPage.id);
        }
    };

    if (!currentPage) return null;

    return (
        <Dialog open={!!page} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[1000px] h-[85vh] flex flex-col">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="font-headline text-xl">{currentPage.title}</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={editMode === 'view' ? 'default' : 'outline'} 
                                size="sm" 
                                onClick={() => setEditMode(editMode === 'view' ? 'edit' : 'view')}
                            >
                                {editMode === 'view' ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                {editMode === 'view' ? 'Edit' : 'View'}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {editMode === 'view' ? 'Reading Mode' : 'Edit Mode'}
                    </p>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PageTab)} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="main">Main Content</TabsTrigger>
                        <TabsTrigger value="subpages">Subpages ({currentPage.subpages?.length || 0})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="main" className="flex-1 overflow-y-auto space-y-4 p-1">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="page-title">Page Title</Label>
                                {editMode === 'edit' ? (
                                    <Input
                                        id="page-title"
                                        value={currentPage.title}
                                        onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                                        className="font-bold text-lg"
                                    />
                                ) : (
                                    <h2 className="font-bold text-lg p-2 border rounded">{currentPage.title}</h2>
                                )}
                            </div>
                            <div className="space-y-2 flex-grow flex flex-col">
                                <Label htmlFor="page-content">Content</Label>
                                {editMode === 'edit' ? (
                                    <Textarea
                                        id="page-content"
                                        value={currentPage.content}
                                        onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                                        className="min-h-[400px] resize-none"
                                        placeholder="Write your detailed content here..."
                                    />
                                ) : (
                                    <div className="p-4 border rounded-lg bg-background min-h-[400px]">
                                        {currentPage.content ? (
                                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {currentPage.content}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">
                                                No content available. Click Edit to add content.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="subpages" className="flex-1 overflow-y-auto space-y-4 p-1">
                        <div className="space-y-4">
                            {editMode === 'edit' && (
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-medium">Subpages</Label>
                                    <Button variant="outline" size="sm" onClick={handleAddSubpage}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Subpage
                                    </Button>
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                {currentPage.subpages && currentPage.subpages.length > 0 ? (
                                    currentPage.subpages
                                        .sort((a, b) => a.order - b.order)
                                        .map((subpage, index) => (
                                        <Card key={subpage.id} className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    {editMode === 'edit' ? (
                                                        <Input
                                                            value={subpage.title}
                                                            onChange={(e) => handleUpdateSubpage(subpage.id, 'title', e.target.value)}
                                                            className="font-medium bg-transparent border-none p-0 h-auto flex-1"
                                                            placeholder="Subpage title..."
                                                        />
                                                    ) : (
                                                        <h4 className="font-medium">{subpage.title}</h4>
                                                    )}
                                                    {editMode === 'edit' && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleMoveSubpage(subpage.id, 'up')}
                                                                disabled={index === 0}
                                                            >
                                                                <ArrowUp className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleMoveSubpage(subpage.id, 'down')}
                                                                disabled={index === (currentPage.subpages?.length || 0) - 1}
                                                            >
                                                                <ArrowDown className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteSubpage(subpage.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                {editMode === 'edit' ? (
                                                    <Textarea
                                                        value={subpage.content}
                                                        onChange={(e) => handleUpdateSubpage(subpage.id, 'content', e.target.value)}
                                                        placeholder="Subpage content..."
                                                        className="min-h-[120px]"
                                                    />
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                        {subpage.content ? (
                                                            <div className="whitespace-pre-wrap">{subpage.content}</div>
                                                        ) : (
                                                            <p className="italic">No content</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No subpages yet. {editMode === 'edit' ? 'Add one to get started.' : 'Switch to edit mode to add subpages.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="justify-between mt-6">
                    {editMode === 'edit' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2"/> Delete Page</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this page and all its subpages.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" onClick={onCancel}>
                            Close
                        </Button>
                        {editMode === 'edit' && (
                            <Button onClick={handleSave}>Save Changes</Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

