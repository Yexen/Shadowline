'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, User, FileText } from 'lucide-react'
import type { BibleEntry } from '@/hooks/use-bible'

interface LivCharacterImporterProps {
  onImport: (entry: BibleEntry) => void
}

export function LivCharacterImporter({ onImport }: LivCharacterImporterProps) {
  
  const createLivCharacterEntry = (): BibleEntry => {
    return {
      title: "Liv Freya",
      fixedFields: {
        picture: "", // Would be set when user uploads an image
        realName: "Homa (birth name), Liv Freya (chosen name), Tirzad (divine name)",
        aliases: "Nomad, The Storm Walker, Goddess of Balance",
        age: "29+",
        nationality: "Iranian-American",
        alignment: "Chaotic Good",
        affiliation: ["Bat-Family", "Independent"]
      },
      relationships: [
        {
          characterName: "Bruce Wayne",
          relationshipType: "Romantic Partner",
          description: "Legendary love forged in fire and shadow. Equals in pain, power, intellect, and restraint. Their love is mythic, earned through mutual respect and shared darkness."
        },
        {
          characterName: "Noor",
          relationshipType: "Family",
          description: "Beloved younger sister who died protecting her. Her guiding spirit and eternal motivation. Last words: 'Don't let them break you, you're meant for more.'"
        },
        {
          characterName: "Zarephah",
          relationshipType: "Mentor",
          description: "Ex-League of Shadows operative who saved and trained her. The only mother she ever knew. Vanished with final words: 'Survive, fight, and wait. I will return.'"
        },
        {
          characterName: "Dick Grayson",
          relationshipType: "Family",
          description: "Instant kindred spirits. Both lost everything and still found a way to smile. The only one she trusts to speak of her sister Noor."
        },
        {
          characterName: "Jason Todd",
          relationshipType: "Family",
          description: "Chaotic twin flame. Fire meeting fire. Chosen siblinghood of wrath and redemption. They understand each other's darkness."
        },
        {
          characterName: "Damian Wayne",
          relationshipType: "Family",
          description: "The son she never got to raise, who chose to call her Mother. Earned his respect through understanding, not authority."
        },
        {
          characterName: "Alfred Pennyworth",
          relationshipType: "Family",
          description: "The Father She Needed. First to truly see her. Tea and late conversations about poetry, war, and grief."
        },
        {
          characterName: "Barbara Gordon",
          relationshipType: "Ally",
          description: "The Quiet Anchor. Mutual respect built on survival, not similarity. Both know what it means to be broken and rebuilt."
        },
        {
          characterName: "Cassandra Cain",
          relationshipType: "Ally",
          description: "The Mirror in Dark. Terrifyingly alike - dancers of shadow and precision. Silent understanding through combat."
        },
        {
          characterName: "Tirdad",
          relationshipType: "Enemy",
          description: "The Fallen Flame - her divine twin brother who fell to jealousy. Their cosmic war is not over."
        },
        {
          characterName: "Ra's al Ghul",
          relationshipType: "Enemy",
          description: "Ancient enemy who orchestrated her family's downfall. Seeks the Mirror of Mithra that only she can find."
        }
      ],
      fields: [
        {
          label: "Core Identity",
          value: "Liv Freya is not a simple fusion of worlds—she is the storm where erased ones return. Her existence is an act of defiance against erasure, an intricate layering of human survival, divine legacy, and chosen selfhood."
        },
        {
          label: "Persian Mythology as Root System",
          value: "Born from Persian cosmology—not as a scholar or admirer, but as living myth. The forgotten gods breathe through her bones, their archetypes written into her choices, her justice, her wrath."
        },
        {
          label: "Norse Mythology as Self-Definition",
          value: "The name Liv Freya is not a stylistic blend—it is an act of claiming. Choosing a Norse name was her ritual of synthesis: merging the bloodline she inherited with the path she built."
        },
        {
          label: "Divine Nature",
          value: "She is Tirzad reborn—the Goddess of Balance from Persian mythology. Created 2,000 years ago by Tishtrya from Sirius's light, she embodies compassion, intellect, and grace balanced with divine justice."
        },
        {
          label: "Combat Abilities",
          value: "Masters of multiple martial arts including Ninjutsu, Krav Maga, Kung Fu, Judo, and Muay Thai. Exceptional in parkour, gymnastics, climbing, and weapons mastery especially whips and daggers."
        },
        {
          label: "Intellectual Prowess",
          value: "Polyglot speaking Farsi, English, French, German, Arabic, Latin, Japanese, Russian, Ancient Greek, and Avestan. Expert in philosophy, comparative mythology, literature, and cultural intelligence."
        },
        {
          label: "Artistic Skills",
          value: "Master jewelry maker, sketches mythic imagery, and has deep appreciation for cinema (from Bergman's metaphysics to Leone's moral ambiguity), jazz, and classical literature."
        },
        {
          label: "Physical Characteristics",
          value: "Small stature requiring strategy over brute force. Naturally quick and graceful. Agility forged by necessity and refined through training. Moves like a dancer of shadows."
        },
        {
          label: "Moral Philosophy",
          value: "Respects life deeply but refuses absolutes. Has killed and bled for it. Has stopped—not from dogma, but doubt. Walks the edge of the blade with trembling grace."
        },
        {
          label: "Survival Methods",
          value: "Seven years as phantom warrior dismantling terrorist networks globally. Survived through handcrafted jewelry sales, bodyguard work, and mercenary contracts."
        },
        {
          label: "Hidden Truths",
          value: "Ra's al Ghul manipulated her family's move to Gotham. The kindly Mobad who taught her was kidnapped by Ra's and remains his prisoner. Zarephah was once Ra's most feared warrior who rebelled to protect Tirzad."
        },
        {
          label: "Quote",
          value: "\"Don't let them break you, you're meant for more.\" - Noor's last words, which became Liv's guiding principle."
        }
      ],
      pages: [
        {
          id: "identity-page",
          title: "Identity & Names",
          content: `# Liv Freya – Identity (Diaspora, Myth, and Sacred Reconstruction)

## Core Identity
Liv Freya is not a simple fusion of worlds—she is the storm where erased ones return. Her existence is an act of defiance against erasure, an intricate layering of human survival, divine legacy, and chosen selfhood. She does not passively inherit identity—she constructs it, brick by brick, scar by scar, myth by myth.

## Roots & Reclamation
- **Persian Mythology as Root System:** Born from Persian cosmology—not as a scholar or admirer, but as living myth. The forgotten gods breathe through her bones, their archetypes written into her choices, her justice, her wrath.
- **Norse Mythology as Self-Definition:** The name Liv Freya is not a stylistic blend—it is an act of claiming. Choosing a Norse name was her ritual of synthesis: merging the bloodline she inherited with the path she built.
- **Nomad as Diasporic Survival:** In a world where she could never be fully safe, Nomad became the embodiment of diaspora—always moving, adapting, striking before she could be struck.
- **Tirzad as Cosmic Reclamation:** Her divine self is not reinvention—it is resurgence. Tirzad is the voice and power stolen from her lineage, now burning brighter than before.

## Identity Themes
1. **Balance of Human and Divine:** Walking the razor's edge between mortal flaw and cosmic responsibility
2. **Transformation by Choice:** Her greatest metamorphoses are self-forged, not imposed
3. **Self-Determined Identity vs. Inherited Destiny:** She chooses what to carry forward and what to burn away
4. **Integration without Dilution:** Persian and Norse mythologies remain distinct yet harmonized through her
5. **Sacredness of Naming:** Every name marks a different battle in the war for selfhood`
        },
        {
          id: "powers-abilities",
          title: "Powers & Abilities",
          content: `# Combat & Physical Abilities

## Martial Arts Mastery
- **Ninjutsu** - Stealth and assassination techniques
- **Krav Maga** - Practical self-defense and combat
- **Kung Fu** - Traditional martial arts forms
- **Judo** - Grappling and throws
- **Muay Thai** - Striking and clinch work

## Movement & Agility
- **Parkour** - Urban environment navigation
- **Gymnastics** - Acrobatic skills and flexibility
- **Rock Climbing** - Vertical terrain mastery
- **Figure Skating** - Grace and precision on ice
- **Horseback Riding** - Mounted combat and travel

## Weapons Expertise
- **Whip Combat** - Primary weapon specialization
- **Dagger Mastery** - Close combat and throwing
- **Archery** - Precision ranged attacks
- **Throwing Weapons** - Various projectiles

## Survival Skills
- **Diving & Underwater Combat** - Aquatic operations
- **Long-distance Running** - Endurance and escape
- **Breath Control** - Extended underwater survival
- **Aerial Combat** - Silks and rope techniques

## Intellectual Abilities
- **Languages:** Farsi, English, French, German, Arabic, Latin, Japanese, Russian, Ancient Greek, Avestan
- **Philosophy** - Deep understanding of ethics and morality
- **Comparative Mythology** - Expert knowledge of world mythologies
- **Cultural Intelligence** - Understanding diverse societies and customs
- **Strategic Planning** - Tactical and long-term thinking

## Divine Heritage
As Tirzad, she possesses latent divine abilities that are slowly awakening:
- **Enhanced Intuition** - Reading situations and people
- **Mythic Resonance** - Connection to ancient powers
- **Balance Sense** - Ability to perceive cosmic equilibrium
- **Divine Durability** - Resistance to supernatural threats`
        },
        {
          id: "backstory-timeline",
          title: "Complete Backstory",
          content: `# The Journey from Homa to Tirzad

## Ages 0-10: The Captive Years (Iran)
Born as Homa into an extremist village near Shiraz. Raised under violent jihadist cult control where education was forbidden. Despite harsh punishments, secretly learned to read and write Farsi by age 3. Mentored by a kind Zoroastrian priest (Mobad) who taught her philosophy, ethics, and mythology. Sister Noor became her only source of love and protection.

## Ages 10-16: The Library Ghost (Gotham)
Family moved to Gotham after being manipulated by Ra's al Ghul. Became a silent presence in public libraries, mastering multiple languages and subjects. Self-taught in literature, history, cinema, and jewelry-making despite parents' continued prohibition of education.

## Age 16: The Breaking Point
Fell in love, became pregnant, and was abandoned by both boyfriend and parents. Fled with Noor for six desperate months. Parents tracked them down and handed her over to community punishment. Noor was killed while protecting her. Underwent brutal forced termination and was left to die in Gotham's Narrows.

## Ages 16-22: The Forging (Training with Zarephah)
Saved by Zarephah, an ex-League of Shadows operative who had rebelled against Ra's. Underwent harsh but transformative training in combat, strategy, and survival. Zarephah became the mother she never had. Abandoned birth name Homa and chose "Liv Freya" as act of self-determination.

## Ages 22-29: The Phantom Years
Zarephah vanished, leaving her with mission to "survive, fight, and wait." Spent seven years as ghost warrior, dismantling jihadist cells across three continents. Operated alone, loyal to no government. Survived through jewelry sales and mercenary work. Made pilgrimage to Iran to mourn Noor.

## Age 29+: Return to Gotham & Meeting Batman
Re-emerged as seasoned warrior and encountered Batman. Found intellectual equal in Bruce Wayne and emotional home with Bat-Family. Love story with Bruce began to unfold as she integrated into their mission.

## Divine Awakening: Remembering Tirzad
Began to remember her true nature as Tirzad, Goddess of Balance from Persian mythology. Understanding of cosmic role, connection to twin brother Tirdad, and Ra's ancient pursuit of the Mirror of Mithra that only she can find.

## The Hidden Truth
The kindly Mobad who taught her was kidnapped by Ra's and remains his prisoner. Zarephah was once Ra's most feared warrior who rebelled to protect Tirzad. Ra's has been manipulating events for centuries, seeking to control the reborn goddess and claim her divine artifacts.`
        },
        {
          id: "relationships-detailed",
          title: "Relationship Analysis",
          content: `# The Bonds That Define Her

## Bruce Wayne - Legendary Love
Their relationship transcends romance—it is a war of souls, meeting of minds, collision of moralities, and rebirth of two broken people into something whole. Where others were chaos or legacy, Liv is love and war. She challenges him morally, matches him intellectually, haunts him spiritually, and undoes him physically.

**Key Dynamics:**
- Morality: He is steel restraint; she is balanced fire
- Sexuality: Sacred, elemental, consuming - return to the body after lifetimes in shadow
- Intellect: His genius is science/strategy; hers is philosophy/culture
- Emotional: They see each other's deepest wounds without trying to fix them

## The Bat-Family
- **Dick Grayson:** Emotional mirror and kindred spirit. Both lost everything yet smile.
- **Jason Todd:** Chaotic twin flame. Fire meeting fire in chosen siblinghood.
- **Damian Wayne:** The son she never got to raise who chose to call her Mother.
- **Alfred Pennyworth:** The father figure who first truly saw her soul.
- **Barbara Gordon:** Quiet anchor built on mutual respect and survival.
- **Cassandra Cain:** Terrifying mirror - both dancers of shadow and precision.

## Divine Connections
- **Noor:** The guiding spirit whose sacrifice became her foundation
- **Zarephah:** The mother who forged her into a warrior-goddess
- **Tirdad:** The fallen twin whose jealousy turned to enmity
- **Ra's al Ghul:** Ancient enemy orchestrating her family's downfall

## Relationship Themes
- **Chosen Family over Blood:** The Bat-Family becomes her true home
- **Love as Sanctuary:** Bruce provides the safety she never had
- **Mentorship Cycles:** From Zarephah's student to others' guide
- **Divine vs. Mortal Bonds:** Balancing cosmic connections with human love
- **Healing Through Connection:** Each relationship restores a broken part`
        },
        {
          id: "mythology-divine",
          title: "Divine Mythology",
          content: `# Tirzad - The Lost Goddess of Balance

## Origin Story
Nearly 2,000 years ago, on Tirgan festival, the god Tishtrya forged Tirzad and her twin Tirdad from Sirius's light. Tirzad embodied compassion, intellect, and grace; Tirdad embodied fire, strength, and pride. Both were warriors, but Tirzad's strength lay in wisdom and love for humanity.

## The Fall
Ahura Mazda chose Tirzad as Goddess of Balance, wounding Tirdad's pride. Ahriman exploited this envy, turning brother against sister. In their battle—light vs. fire—Tirdad struck down Tirzad, ending the age of divine siblings.

## The Preservation
Ahura Mazda chained Tirdad inside Mount Damavand as punishment. Anahita preserved Tirzad's soul in the Mirror of Mithra, prophesying her rebirth as a mortal who would learn balance through suffering rather than rule.

## Reborn as Homa/Liv
Centuries later, the goddess was reborn in Iran as Homa—unaware of her divine origin. Through mortal suffering, she became Liv Freya, then Nomad, shaped by human pain into a protector rather than a ruler. Her divine nature slowly awakens as she remembers her cosmic purpose.

## Divine Powers (Awakening)
- **Balance Perception:** Sensing cosmic and moral equilibrium
- **Mythic Resonance:** Connection to ancient powers and wisdom
- **Divine Durability:** Resistance to supernatural threats
- **Light Manipulation:** Potential control over stellar energy
- **Truth Sight:** Seeing through deception and illusion

## The Unfinished War
Tirdad still waits as the Fallen Flame, his imprisonment weakening over millennia. The Mirror of Mithra holds the key to either his freedom or final binding. Ra's al Ghul seeks this artifact, knowing it grants dominion over both siblings.

## The Choice Ahead
As Tirzad awakens within Liv, she must choose: Reclaim her full divine power and cosmic role, or remain grounded in human love and mortal connections. The balance between goddess and woman will determine not just her fate, but the fate of both mortal and divine realms.`
        }
      ]
    }
  }

  const handleImport = () => {
    const livEntry = createLivCharacterEntry()
    onImport(livEntry)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Import Liv Freya Character Profile</CardTitle>
        <CardDescription>
          Add the complete character profile for Liv Freya (Nomad/Tirzad) to test the new Bible features including the interactive relationship mindmap and backstory timeline.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Includes
            </h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Complete identity & mythology</li>
              <li>• 11 detailed relationships</li>
              <li>• Divine backstory timeline</li>
              <li>• Combat abilities & skills</li>
              <li>• Multiple character names/aliases</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Features to Test
            </h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Interactive relationship mindmap</li>
              <li>• Backstory timeline visualization</li>
              <li>• Notion-like dossier layout</li>
              <li>• Character tab organization</li>
              <li>• Rich content sections</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <Button onClick={handleImport} className="w-full" size="lg">
            <Upload className="w-4 h-4 mr-2" />
            Import Liv Freya Character
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          This will create a comprehensive character entry that showcases all the new Bible features including the interactive mindmap and timeline.
        </p>
      </CardContent>
    </Card>
  )
}