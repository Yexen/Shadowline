'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, EyeOff, Download, FileText, FileCode, Sparkles, PenLine, Library, BookPlus, StickyNote, ChevronDown, Focus, Target, Clock, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { useDrafts, type Draft } from '@/hooks/use-drafts';
import { useVolumes } from '@/hooks/use-volumes';
import { useNotes } from '@/hooks/use-notes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AskOracleDialog } from '@/components/ask-oracle-dialog';
import { ChapterGenDialog } from '@/components/chapter-gen-dialog';
import { RichTextEditor } from '@/components/rich-text-editor';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

const translations = {
  en: {
    untitledDraft: 'Untitled Draft',
    savedToastTitle: 'Draft Saved',
    savedToastDesc: 'Your progress has been saved to the Batcomputer.',
    wordCount: 'Word Count',
    saving: 'Saving...',
    lastSaved: 'Last saved',
    notSaved: 'Not saved yet.',
    saveToVolume: 'Save to Volume',
    saveToVolumeDesc: 'Select a volume to save this draft as a new chapter.',
    selectVolume: 'Select a Volume',
    chooseVolume: 'Choose a volume...',
    saveChapter: 'Save Chapter',
    chapterSavedToast: 'Chapter Saved',
    chapterSavedToastDesc: 'has been added to the selected volume.',
    cancel: 'Cancel',
    generateChapter: 'Generate Chapter',
    askOracle: 'Ask Oracle',
    saveDraft: 'Save Draft',
    saveToNotes: 'Save to Notes',
    export: 'Export',
    exportMd: 'Export as Markdown',
    exportTxt: 'Export as Text',
    exportHtml: 'Export as HTML',
    exportPdf: 'Export as PDF',
    noteSavedToast: 'Note Saved',
    noteSavedToastDesc: 'has been saved to your notes.',
    placeholder: 'The darkness of Gotham is a canvas. Paint your story...',
    focusMode: 'Focus Mode',
    exitFocus: 'Exit Focus',
    readingTime: 'Reading Time',
    minutes: 'min',
    writingGoals: 'Writing Goals',
    dailyGoal: 'Daily Goal',
    progress: 'Progress',
    wordsToday: 'words today',
    versionHistory: 'Version History',
    characterCount: 'Characters'
  },
  fa: {
    untitledDraft: 'پیش‌نویس بدون عنوان',
    savedToastTitle: 'پیش‌نویس ذخیره شد',
    savedToastDesc: 'پیشرفت شما در بت‌کامپیوتر ذخیره شد.',
    wordCount: 'تعداد کلمات',
    saving: 'در حال ذخیره...',
    lastSaved: 'آخرین ذخیره',
    notSaved: 'هنوز ذخیره نشده.',
    saveToVolume: 'ذخیره در جلد',
    saveToVolumeDesc: 'یک جلد برای ذخیره این پیش‌نویس به عنوان فصل جدید انتخاب کنید.',
    selectVolume: 'یک جلد انتخاب کنید',
    chooseVolume: 'یک جلد انتخاب کنید...',
    saveChapter: 'ذخیره فصل',
    chapterSavedToast: 'فصل ذخیره شد',
    chapterSavedToastDesc: 'به جلد انتخاب شده اضافه شد.',
    cancel: 'لغو',
    generateChapter: 'تولید فصل',
    askOracle: 'از اوراکل بپرس',
    saveDraft: 'ذخیره پیش‌نویس',
    saveToNotes: 'ذخیره در یادداشت‌ها',
    export: 'خروجی گرفتن',
    exportMd: 'خروجی مارک‌داون',
    exportTxt: 'خروجی متنی',
    exportHtml: 'خروجی HTML',
    exportPdf: 'خروجی PDF',
    noteSavedToast: 'یادداشت ذخیره شد',
    noteSavedToastDesc: 'در یادداشت‌های شما ذخیره شد.',
    placeholder: 'تاریکی گاتهام یک بوم نقاشی است. داستان خود را نقاشی کنید...'
  }
};

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;

  const { getDraft, addDraft, updateDraft } = useDrafts();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const { toast } = useToast();

  const { volumes, addChapterToVolume } = useVolumes();
  const { addNote } = useNotes();
  const [showVolumeDialog, setShowVolumeDialog] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState('');

  const [oracleOpen, setOracleOpen] = useState(false);
  const [chapterGenOpen, setChapterGenOpen] = useState(false);
  const [selection, setSelection] = useState('');
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  // Enhancement states
  const [focusMode, setFocusMode] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showWritingGoals, setShowWritingGoals] = useState(false);
  const [dailyWordGoal, setDailyWordGoal] = useState(500);
  const [dailyWordsWritten, setDailyWordsWritten] = useState(0);
  const [versions, setVersions] = useState<Array<{id: string, content: string, timestamp: Date, wordCount: number}>>([]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
      }),
      Placeholder.configure({
        placeholder: t.placeholder, // initial placeholder
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Superscript,
      Subscript,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-p:font-body prose-headings:font-headline focus:outline-none w-full max-w-full",
      },
    },
  });

  // Update placeholder safely when language/translation changes
  useEffect(() => {
    if (!editor) return;
    const ext: any = editor.extensionManager.extensions.find(
      (e: any) => e?.name === 'placeholder'
    );
    if (ext && ext.options) {
      ext.options.placeholder = t.placeholder;
      editor.view.dispatch(editor.state.tr); // force decorations refresh
    }
  }, [t.placeholder, editor]);

  useEffect(() => {
    if (draftId === 'new') {
      setTitle(t.untitledDraft);
      setContent('');
      setIsLoaded(true);
    } else {
      const draft = getDraft(draftId);
      if (draft) {
        setCurrentDraft(draft);
        setTitle(draft.title);
        setContent(draft.content);
        setLastSaved(draft.lastModified ? new Date(draft.lastModified) : null);
      } else {
        router.replace('/editor/new');
      }
      setIsLoaded(true);
    }
  }, [draftId, getDraft, router, t.untitledDraft]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.state.doc.textContent;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [content, editor]);

  const readingTime = useMemo(() => {
    const wordsPerMinute = 200; // Average reading speed
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes || 1;
  }, [wordCount]);

  const dailyProgress = useMemo(() => {
    return Math.min((dailyWordsWritten / dailyWordGoal) * 100, 100);
  }, [dailyWordsWritten, dailyWordGoal]);

  const saveVersion = () => {
    const newVersion = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      wordCount: wordCount
    };
    setVersions(prev => [newVersion, ...prev].slice(0, 10)); // Keep only last 10 versions
  };

  const handleSave = () => {
    setIsSaving(true);
    const savedDate = new Date();

    // Save version before updating
    saveVersion();

    if (draftId === 'new') {
      const newDraftId = addDraft(title, content);
      router.replace(`/editor/${newDraftId}`);
    } else {
      updateDraft(draftId, title, content);
    }
    setLastSaved(savedDate);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: t.savedToastTitle,
        description: t.savedToastDesc,
      });
      if (statusRef.current) {
        statusRef.current.classList.add('autosave-flash');
        setTimeout(() => statusRef.current?.classList.remove('autosave-flash'), 1000);
      }
    }, 500);
  };

  const handleExport = (format: 'txt' | 'md' | 'html' | 'pdf') => {
    let textToExport = '';
    let mimeType = 'text/plain;charset=utf-8';

    switch (format) {
      case 'txt':
        textToExport = editor?.getText() || '';
        break;
      case 'md':
        textToExport = editor?.storage.markdown?.getMarkdown() || content.replace(/<[^>]*>/g, '');
        break;
      case 'html':
        textToExport = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { color: #d4af37; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
        mimeType = 'text/html;charset=utf-8';
        break;
      case 'pdf':
        // For now, we'll create a simple HTML that can be printed to PDF
        textToExport = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { margin: 1in; }
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
    h1, h2, h3 { color: #000; page-break-after: avoid; }
    p { page-break-inside: avoid; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <script>window.print();</script>
</body>
</html>`;
        mimeType = 'text/html;charset=utf-8';
        break;
    }

    const blob = new Blob([textToExport], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToNotes = () => {
    addNote(title, content);
    toast({
      title: t.noteSavedToast,
      description: `"${title}" ${t.noteSavedToastDesc}`,
    });
  };

  const handleSaveToVolume = () => {
    if (selectedVolume) {
      addChapterToVolume(selectedVolume, title, content);
      toast({
        title: t.chapterSavedToast,
        description: `"${title}" ${t.chapterSavedToastDesc}`,
      });
      setShowVolumeDialog(false);
      setSelectedVolume('');
    }
  };

  const handleOpenOracle = () => {
    const selectedText =
      editor?.state.selection
        .content()
        .content.textBetween(0, editor.state.selection.content().size) || '';
    setSelection(selectedText || content);
    setOracleOpen(true);
  };

  const handleInsertText = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run();
      setChapterGenOpen(false);
    }
  };

  if (!editor) return null;

  return (
    <>
      <div className={cn(
        "flex flex-col transition-all duration-300",
        focusMode ? "h-[calc(100vh-8rem)] max-w-4xl mx-auto" : "h-[calc(100vh-14rem)]"
      )}>
        <header className={cn(
          "flex items-center justify-between mb-4 flex-wrap gap-4 transition-opacity duration-300",
          focusMode && "opacity-30 hover:opacity-100"
        )}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-headline text-2xl bg-transparent outline-none focus:border-b border-primary"
          />
          <div className={cn(
            "flex items-center gap-2 flex-wrap transition-opacity duration-300",
            focusMode && "opacity-0 hover:opacity-100"
          )}>
            <Button variant="ghost" size="sm" onClick={() => setChapterGenOpen(true)}>
              <PenLine />
              {t.generateChapter}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleOpenOracle}>
              <Sparkles />
              {t.askOracle}
            </Button>

            <Button
              variant={focusMode ? "default" : "ghost"}
              size="sm"
              onClick={() => setFocusMode(!focusMode)}
            >
              <Focus />
              {focusMode ? t.exitFocus : t.focusMode}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowWritingGoals(!showWritingGoals)}>
              <Target />
              {t.writingGoals}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowVersionHistory(!showVersionHistory)}>
              <History />
              {t.versionHistory}
            </Button>

            <Dialog open={showVolumeDialog} onOpenChange={setShowVolumeDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Library />
                  {t.saveToVolume}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.saveToVolume}</DialogTitle>
                  <DialogDescription>{t.saveToVolumeDesc}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="volume-select">{t.selectVolume}</Label>
                  <Select onValueChange={setSelectedVolume} value={selectedVolume}>
                    <SelectTrigger id="volume-select">
                      <SelectValue placeholder={t.chooseVolume} />
                    </SelectTrigger>
                    <SelectContent>
                      {volumes.map((vol) => (
                        <SelectItem key={vol.id} value={vol.id}>
                          {vol.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowVolumeDialog(false)}>
                    {t.cancel}
                  </Button>
                  <Button onClick={handleSaveToVolume} disabled={!selectedVolume}>
                    {t.saveChapter}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={handleSaveToNotes}>
              <StickyNote />
              {t.saveToNotes}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save />
              {t.saveDraft}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download />
                  {t.export}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('txt')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportTxt}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('md')}>
                  <FileCode className="h-4 w-4 mr-2" />
                  {t.exportMd}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  <FileCode className="h-4 w-4 mr-2" />
                  {t.exportHtml}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportPdf}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="grid gap-4 flex-1">
          <RichTextEditor editor={editor} />
        </div>

        {/* Writing Goals Panel */}
        {showWritingGoals && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t.writingGoals}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowWritingGoals(false)}>
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.dailyGoal}</span>
                    <span>{dailyWordsWritten} / {dailyWordGoal} {t.wordsToday}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dailyProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.progress}: {Math.round(dailyProgress)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Version History Panel */}
        {showVersionHistory && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t.versionHistory}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowVersionHistory(false)}>
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No versions saved yet. Save your draft to create version history.
                    </p>
                  ) : (
                    versions.map((version, index) => (
                      <div
                        key={version.id}
                        className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => {
                          if (editor) {
                            editor.commands.setContent(version.content);
                            setContent(version.content);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Version {versions.length - index}</span>
                          <span className="text-muted-foreground">
                            {version.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {version.wordCount} words
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {version.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <footer className={cn(
          "mt-4 text-sm text-muted-foreground flex justify-between items-center flex-wrap gap-2 transition-opacity duration-300",
          focusMode && "opacity-30 hover:opacity-100"
        )}>
          <div className="flex items-center gap-4 flex-wrap">
            <span>{t.wordCount}: {wordCount}</span>
            <span>{t.characterCount}: {content.replace(/<[^>]*>/g, '').length}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t.readingTime}: {readingTime} {t.minutes}
            </span>
            {showWritingGoals && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {dailyWordsWritten}/{dailyWordGoal} {t.wordsToday}
              </span>
            )}
          </div>
          <p ref={statusRef} className="transition-colors">
            {isSaving
              ? t.saving
              : lastSaved
              ? `${t.lastSaved}: ${lastSaved.toLocaleTimeString()}`
              : t.notSaved}
          </p>
        </footer>
      </div>

      <AskOracleDialog
        isOpen={oracleOpen}
        onClose={() => setOracleOpen(false)}
        contextText={selection}
      />
      <ChapterGenDialog
        isOpen={chapterGenOpen}
        onClose={() => setChapterGenOpen(false)}
        onInsert={handleInsertText}
      />
    </>
  );
}

