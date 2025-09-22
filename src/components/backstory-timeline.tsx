'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, Flame, Heart, Sword, Crown, BookOpen } from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  period: string
  age: string
  category: 'childhood' | 'trauma' | 'training' | 'awakening' | 'legend'
  location: string
  description: string
  details: string[]
  significance: string
  icon: string
  color: string
}

const timelineData: TimelineEvent[] = [
  {
    id: 'birth',
    title: 'Birth of Homa',
    period: 'The Captive Years',
    age: '0-10',
    category: 'childhood',
    location: 'Remote village near Shiraz, Iran',
    description: 'Born into extremist family. The future goddess begins her mortal journey in chains.',
    details: [
      'Born to zealot parents who valued sons over daughters',
      'Harsh punishments for any sign of independence',
      'Secretly taught to read by kindly Zoroastrian priest (Mobad)',
      'Sister Noor became her only source of love and protection',
      'Immersed in Persian mythology and Zoroastrian cosmology',
      'First glimpse of Ra\'s al Ghul at age 10'
    ],
    significance: 'The divine soul of Tirzad is reborn into mortal suffering, setting the stage for her transformation through pain.',
    icon: '🌱',
    color: '#84CC16'
  },
  {
    id: 'gotham-arrival',
    title: 'Exile to Gotham',
    period: 'The Library Ghost',
    age: '10-16',
    category: 'childhood',
    location: 'Gotham City',
    description: 'Family moves to Gotham. Education forbidden but curiosity unbroken.',
    details: [
      'Parents joined jihadist cult with Gotham connections',
      'Became silent presence in public libraries',
      'Mastered English, French, German, Arabic, Latin',
      'Self-taught in literature, history, geopolitics',
      'Discovered cinema, jazz, and comedy as escapes',
      'Learned jewelry-making from stolen moments with books'
    ],
    significance: 'The goddess begins to understand the broader world, preparing for her role as protector of the innocent.',
    icon: '📚',
    color: '#3B82F6'
  },
  {
    id: 'first-love',
    title: 'Love and Betrayal',
    period: 'The Breaking',
    age: '16',
    category: 'trauma',
    location: 'Gotham City',
    description: 'First love leads to pregnancy, abandonment, and ultimate tragedy.',
    details: [
      'Fell in love with man outside her community',
      'Became pregnant - symbol of hope and rebellion',
      'Boyfriend abandoned her upon learning of pregnancy',
      'Parents disowned her completely',
      'Only Noor stood by her side',
      'Fled together for six desperate months'
    ],
    significance: 'The goddess learns the pain of mortal love and the cruelty of abandonment.',
    icon: '💔',
    color: '#EF4444'
  },
  {
    id: 'noors-death',
    title: 'Noor\'s Sacrifice',
    period: 'The Abyss',
    age: '16',
    category: 'trauma',
    location: 'Gotham\'s Narrows',
    description: 'Sister dies protecting her. Brutal punishment. Left to die in an alley.',
    details: [
      'Parents tracked them down, handed over to community',
      'Noor killed while shielding Homa from punishment',
      'Last words: "Don\'t let them break you, you\'re meant for more"',
      'Underwent unmedicated termination as "cleansing"',
      'Baby discarded, left bleeding in the Narrows',
      'Crawled through streets fueled by Noor\'s memory'
    ],
    significance: 'The goddess dies and is reborn. Her divine compassion is forged in the crucible of ultimate loss.',
    icon: '🥀',
    color: '#7C2D12'
  },
  {
    id: 'zarephah-rescue',
    title: 'Zarephah\'s Salvation',
    period: 'The Forging',
    age: '16-22',
    category: 'training',
    location: 'Hidden sanctuary, Gotham outskirts',
    description: 'Saved by ex-League operative. Transformed from victim to warrior.',
    details: [
      'Found dying by Zarephah, rogue League of Shadows operative',
      'Nursed back to health over months of careful recovery',
      'Began brutal but transformative training regimen',
      'Mastered ninjutsu, Krav Maga, Kung Fu, Muay Thai',
      'Learned parkour, gymnastics, weapons mastery',
      'Zarephah became the mother she never had'
    ],
    significance: 'The goddess learns to channel divine power through mortal discipline. Pain becomes strength.',
    icon: '⚔️',
    color: '#059669'
  },
  {
    id: 'becoming-nomad',
    title: 'Birth of Nomad',
    period: 'The Naming',
    age: '22',
    category: 'awakening',
    location: 'Gotham and beyond',
    description: 'Chooses new identity. Becomes Liv Freya, the wandering protector.',
    details: [
      'Abandoned birth name Homa completely',
      'Chose "Liv" (life) and "Freya" (love/war goddess)',
      'Created Nomad persona - protector of the displaced',
      'Zarephah vanished, leaving final mission: "Survive, fight, wait"',
      'Began seven-year war against jihadist cells',
      'Traveled Europe, North Africa, North America'
    ],
    significance: 'The goddess claims her chosen identity, rejecting the names given by those who hurt her.',
    icon: '🎭',
    color: '#8B5CF6'
  },
  {
    id: 'phantom-years',
    title: 'The Phantom War',
    period: 'The Wandering',
    age: '22-29',
    category: 'legend',
    location: 'Global',
    description: 'Seven years as ghost warrior, dismantling terrorist networks worldwide.',
    details: [
      'Operated alone, loyal to no government or faction',
      'Dismantled jihadist cells across three continents',
      'Survived through jewelry sales and mercenary work',
      'Expanded skills: figure skating, horseback riding, aerial combat',
      'Learned Japanese, Russian, Ancient Greek, Avestan',
      'Made pilgrimage to Iran - mourned Noor at village ruins'
    ],
    significance: 'The goddess walks among mortals as their silent guardian, learning the full scope of human suffering.',
    icon: '👻',
    color: '#6B7280'
  },
  {
    id: 'batman-meeting',
    title: 'Meeting the Dark Knight',
    period: 'The Recognition',
    age: '29+',
    category: 'legend',
    location: 'Gotham City',
    description: 'Returns to Gotham. Encounters Batman and finds her equal.',
    details: [
      'Re-emerged in Gotham as seasoned warrior',
      'First encounter with Batman - mutual recognition of equals',
      'Gradually integrated with Bat-Family',
      'Found intellectual equal in Bruce Wayne',
      'Became emotional anchor for the family',
      'Love story with Bruce begins to unfold'
    ],
    significance: 'The goddess finds her divine counterpart and true home among chosen family.',
    icon: '🦇',
    color: '#1F2937'
  },
  {
    id: 'tirzad-awakening',
    title: 'Divine Awakening',
    period: 'The Remembering',
    age: 'Present',
    category: 'awakening',
    location: 'Gotham and beyond',
    description: 'Begins to remember her true nature as Tirzad, Goddess of Balance.',
    details: [
      'Fragments of divine memory surface during meditation',
      'Recognizes connection to Persian mythology',
      'Understanding of her role as cosmic balance',
      'Knowledge of Tirdad, her fallen twin brother',
      'Awareness of Ra\'s al Ghul\'s ancient pursuit',
      'The Mirror of Mithra calls to her'
    ],
    significance: 'The goddess begins to reclaim her divine heritage while remaining grounded in human love.',
    icon: '👑',
    color: '#FBBF24'
  }
]

const categoryColors = {
  childhood: '#84CC16',
  trauma: '#EF4444',
  training: '#059669',
  awakening: '#8B5CF6',
  legend: '#6B7280'
}

const categoryIcons = {
  childhood: BookOpen,
  trauma: Heart,
  training: Sword,
  awakening: Crown,
  legend: Flame
}

export function BackstoryTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Liv Freya's Backstory Timeline</h3>
        <p className="text-muted-foreground">From mortal suffering to divine awakening - the journey of Tirzad reborn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
            
            <div className="space-y-6">
              {timelineData.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div 
                    className="absolute left-6 w-4 h-4 rounded-full border-2 border-background z-10 cursor-pointer"
                    style={{ backgroundColor: event.color }}
                    onClick={() => setSelectedEvent(event)}
                  ></div>
                  
                  {/* Event card */}
                  <div className="ml-16">
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedEvent?.id === event.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: event.color }}
                            >
                              {getCategoryIcon(event.category)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{event.period}</Badge>
                                <span>Age {event.age}</span>
                                <span>•</span>
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedEvent(expandedEvent === event.id ? null : event.id)
                            }}
                          >
                            {expandedEvent === event.id ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                        
                        {expandedEvent === event.id && (
                          <div className="space-y-4 border-t pt-4">
                            <div>
                              <h5 className="font-semibold mb-2">Key Events</h5>
                              <ul className="space-y-1">
                                {event.details.map((detail, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold mb-2">Divine Significance</h5>
                              <p className="text-sm italic text-muted-foreground">{event.significance}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Timeline Categories</h4>
            <div className="space-y-3">
              {Object.entries(categoryColors).map(([category, color]) => (
                <div key={category} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <div className="text-white text-xs">
                      {getCategoryIcon(category)}
                    </div>
                  </div>
                  <span className="text-sm capitalize">{category}</span>
                </div>
              ))}
            </div>
          </Card>
          
          {selectedEvent && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedEvent.icon}</span>
                  <div>
                    <h4 className="font-bold">{selectedEvent.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvent.period}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold">Age: </span>
                    <span className="text-sm">{selectedEvent.age}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Location: </span>
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
                
                <div className="border-t pt-3">
                  <h5 className="font-semibold text-sm mb-2">Divine Context</h5>
                  <p className="text-xs italic text-muted-foreground">{selectedEvent.significance}</p>
                </div>
              </div>
            </Card>
          )}
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click timeline dots or cards to select events</li>
              <li>• Use expand arrows to see full details</li>
              <li>• Colors represent different life phases</li>
              <li>• Follow the divine thread through mortal pain</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}