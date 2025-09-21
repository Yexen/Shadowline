'use client';

import { useState, useEffect } from 'react';
import { alfredNotifications } from '@/lib/alfred-notifications';
import { ClientMemoryManager } from '@/lib/alfred-memory-service';
import { alfredSearch } from '@/lib/alfred-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Brain,
  Bell,
  Search,
  Trash2,
  Download,
  Upload,
  Clock,
  Shield,
  Palette,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AlfredSettings {
  // Proactivity Settings
  proactivityLevel: 'off' | 'low' | 'medium' | 'high';
  notificationTypes: {
    toast: boolean;
    banner: boolean;
    modal: boolean;
    badge: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };

  // Memory Settings
  memoryPolicy: 'off' | 'session' | 'temporary' | 'persistent';
  memoryRetentionDays: number;
  autoCleanup: boolean;

  // Search Settings
  searchSources: ('web' | 'academic' | 'news')[];
  maxSearchResults: number;
  autoSearch: boolean;

  // Personality Settings
  formalityLevel: number; // 0-100
  humorFrequency: number; // 0-100
  proactiveFrequency: number; // 0-100

  // Privacy Settings
  dataCollection: boolean;
  analyticsSharing: boolean;
  conversationLogging: boolean;
}

const defaultSettings: AlfredSettings = {
  proactivityLevel: 'medium',
  notificationTypes: {
    toast: true,
    banner: true,
    modal: true,
    badge: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  memoryPolicy: 'persistent',
  memoryRetentionDays: 30,
  autoCleanup: true,
  searchSources: ['web', 'academic'],
  maxSearchResults: 5,
  autoSearch: false,
  formalityLevel: 75,
  humorFrequency: 60,
  proactiveFrequency: 50,
  dataCollection: true,
  analyticsSharing: false,
  conversationLogging: true
};

export function AlfredSettings({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<AlfredSettings>(defaultSettings);
  const [memoryManager] = useState(new ClientMemoryManager());
  const [memoryStats, setMemoryStats] = useState({ totalMemories: 0, conversationCount: 0 });
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('alfred_settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }

    // Load memory stats
    setMemoryStats(memoryManager.getMemoryStats());

    // Load search history
    setSearchHistory(alfredSearch.getSearchHistory());
  }, [memoryManager]);

  const saveSettings = (newSettings: AlfredSettings) => {
    setSettings(newSettings);
    localStorage.setItem('alfred_settings', JSON.stringify(newSettings));

    // Apply settings
    applySettings(newSettings);
  };

  const applySettings = (settings: AlfredSettings) => {
    // Apply notification settings
    // Apply memory settings
    // Apply search settings
    // Apply personality settings

    console.log('Applied Alfred settings:', settings);
  };

  const updateSetting = <K extends keyof AlfredSettings>(
    key: K,
    value: AlfredSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const updateNestedSetting = <K extends keyof AlfredSettings, NK extends keyof AlfredSettings[K]>(
    key: K,
    nestedKey: NK,
    value: AlfredSettings[K][NK]
  ) => {
    const newSettings = {
      ...settings,
      [key]: {
        ...settings[key],
        [nestedKey]: value
      }
    };
    saveSettings(newSettings);
  };

  const clearAllMemories = () => {
    memoryManager.clearAllMemories();
    setMemoryStats({ totalMemories: 0, conversationCount: 0 });

    alfredNotifications.addNotification({
      type: 'toast',
      priority: 'medium',
      title: 'Alfred confirms',
      message: 'All memories have been cleared, Miss. We start fresh.',
      autoHide: true,
      hideAfter: 5000,
      tags: ['settings', 'memory']
    });
  };

  const exportMemories = () => {
    const memories = memoryManager.getAllMemories();
    const dataStr = JSON.stringify(memories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `alfred-memories-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const clearSearchHistory = () => {
    alfredSearch.clearSearchHistory();
    setSearchHistory([]);

    alfredNotifications.addNotification({
      type: 'toast',
      priority: 'low',
      title: 'Alfred notes',
      message: 'Search history has been cleared, Miss.',
      autoHide: true,
      hideAfter: 3000,
      tags: ['settings', 'search']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-4xl max-h-[90vh] m-4 bg-card border-border shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
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
              <div>
                <CardTitle className="text-lg">Alfred Settings</CardTitle>
                <p className="text-sm text-muted-foreground">Configure your personal AI butler</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="proactivity" className="w-full">
            <TabsList className="grid grid-cols-5 w-full rounded-none">
              <TabsTrigger value="proactivity" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Proactivity</span>
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Memory</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Personality</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
            </TabsList>

            {/* Proactivity Settings */}
            <TabsContent value="proactivity" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Proactive Behavior</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Proactivity Level</Label>
                    <p className="text-sm text-muted-foreground mb-2">How often Alfred should offer assistance and suggestions</p>
                    <Select
                      value={settings.proactivityLevel}
                      onValueChange={(value: any) => updateSetting('proactivityLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off - No proactive behavior</SelectItem>
                        <SelectItem value="low">Low - Daily digest only</SelectItem>
                        <SelectItem value="medium">Medium - Real-time suggestions</SelectItem>
                        <SelectItem value="high">High - All pushes & alerts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base">Notification Types</Label>
                    <p className="text-sm text-muted-foreground mb-3">Choose which notification types to enable</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(settings.notificationTypes).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between">
                          <Label className="capitalize">{type} notifications</Label>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              updateNestedSetting('notificationTypes', type as any, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base">Quiet Hours</Label>
                      <Switch
                        checked={settings.quietHours.enabled}
                        onCheckedChange={(checked) =>
                          updateNestedSetting('quietHours', 'enabled', checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Alfred will remain silent during these hours</p>
                    {settings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => updateNestedSetting('quietHours', 'start', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={settings.quietHours.end}
                            onChange={(e) => updateNestedSetting('quietHours', 'end', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Memory Settings */}
            <TabsContent value="memory" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Memory Management</h3>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{memoryStats.totalMemories}</div>
                      <div className="text-sm text-muted-foreground">Total Memories</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{memoryStats.conversationCount}</div>
                      <div className="text-sm text-muted-foreground">Conversations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{searchHistory.length}</div>
                      <div className="text-sm text-muted-foreground">Searches</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Memory Policy</Label>
                    <p className="text-sm text-muted-foreground mb-2">How long Alfred should remember conversations</p>
                    <Select
                      value={settings.memoryPolicy}
                      onValueChange={(value: any) => updateSetting('memoryPolicy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off - No memory retention</SelectItem>
                        <SelectItem value="session">Session only - Forget after session ends</SelectItem>
                        <SelectItem value="temporary">Temporary - Limited retention</SelectItem>
                        <SelectItem value="persistent">Persistent - Long-term memory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base">Memory Retention (Days)</Label>
                    <p className="text-sm text-muted-foreground mb-2">Keep memories for: {settings.memoryRetentionDays} days</p>
                    <Slider
                      value={[settings.memoryRetentionDays]}
                      onValueChange={([value]) => updateSetting('memoryRetentionDays', value)}
                      max={365}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Cleanup</Label>
                      <p className="text-sm text-muted-foreground">Automatically remove old memories</p>
                    </div>
                    <Switch
                      checked={settings.autoCleanup}
                      onCheckedChange={(checked) => updateSetting('autoCleanup', checked)}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base">Memory Actions</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" onClick={exportMemories} className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export Memories</span>
                      </Button>
                      <Button variant="destructive" onClick={clearAllMemories} className="flex items-center space-x-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Clear All</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Search Settings */}
            <TabsContent value="search" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Search Configuration</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Search Sources</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select which sources Alfred should search</p>
                    <div className="space-y-2">
                      {(['web', 'academic', 'news'] as const).map((source) => (
                        <div key={source} className="flex items-center justify-between">
                          <Label className="capitalize">{source} sources</Label>
                          <Switch
                            checked={settings.searchSources.includes(source)}
                            onCheckedChange={(checked) => {
                              const newSources = checked
                                ? [...settings.searchSources, source]
                                : settings.searchSources.filter(s => s !== source);
                              updateSetting('searchSources', newSources);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">Max Search Results</Label>
                    <p className="text-sm text-muted-foreground mb-2">Maximum results per search: {settings.maxSearchResults}</p>
                    <Slider
                      value={[settings.maxSearchResults]}
                      onValueChange={([value]) => updateSetting('maxSearchResults', value)}
                      max={20}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Search</Label>
                      <p className="text-sm text-muted-foreground">Automatically search when relevant topics are mentioned</p>
                    </div>
                    <Switch
                      checked={settings.autoSearch}
                      onCheckedChange={(checked) => updateSetting('autoSearch', checked)}
                    />
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base">Search History ({searchHistory.length} searches)</Label>
                      <Button variant="outline" size="sm" onClick={clearSearchHistory}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear History
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Use "/search [query]" in chat to search external sources
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Personality Settings */}
            <TabsContent value="personality" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personality Configuration</h3>

                <div className="space-y-6">
                  <div>
                    <Label className="text-base">Formality Level</Label>
                    <p className="text-sm text-muted-foreground mb-2">How formal Alfred should be: {settings.formalityLevel}%</p>
                    <Slider
                      value={[settings.formalityLevel]}
                      onValueChange={([value]) => updateSetting('formalityLevel', value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Casual</span>
                      <span>Professional</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">Humor Frequency</Label>
                    <p className="text-sm text-muted-foreground mb-2">How often Alfred should use humor: {settings.humorFrequency}%</p>
                    <Slider
                      value={[settings.humorFrequency]}
                      onValueChange={([value]) => updateSetting('humorFrequency', value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Serious</span>
                      <span>Witty</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">Proactive Frequency</Label>
                    <p className="text-sm text-muted-foreground mb-2">How often Alfred should offer suggestions: {settings.proactiveFrequency}%</p>
                    <Slider
                      value={[settings.proactiveFrequency]}
                      onValueChange={([value]) => updateSetting('proactiveFrequency', value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Reactive</span>
                      <span>Proactive</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">Allow Alfred to collect usage data for improvement</p>
                    </div>
                    <Switch
                      checked={settings.dataCollection}
                      onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Analytics Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share anonymous usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.analyticsSharing}
                      onCheckedChange={(checked) => updateSetting('analyticsSharing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Conversation Logging</Label>
                      <p className="text-sm text-muted-foreground">Log conversations for memory and improvement</p>
                    </div>
                    <Switch
                      checked={settings.conversationLogging}
                      onCheckedChange={(checked) => updateSetting('conversationLogging', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Data Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      All data is stored locally on your device. Alfred does not transmit personal information to external servers
                      without your explicit consent. Memory data and conversations remain private and under your control.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}