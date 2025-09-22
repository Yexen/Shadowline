'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RelationshipNode {
  id: string
  name: string
  role: string
  description: string
  connectionType: 'family' | 'romantic' | 'mentor' | 'ally' | 'complex' | 'antagonist'
  relationship: string
  x: number
  y: number
  color: string
}

interface Connection {
  from: string
  to: string
  label: string
  strength: 'weak' | 'moderate' | 'strong' | 'legendary'
}

const relationshipData: RelationshipNode[] = [
  {
    id: 'liv',
    name: 'Liv Freya',
    role: 'Center',
    description: 'Tirzad - Goddess of Balance, Nomad - The Storm Walker',
    connectionType: 'family',
    relationship: 'Self',
    x: 400,
    y: 300,
    color: '#8B5CF6'
  },
  {
    id: 'bruce',
    name: 'Bruce Wayne',
    role: 'Beloved',
    description: 'Batman - The Dark Knight, her soul-twin in darkness and justice',
    connectionType: 'romantic',
    relationship: 'Legendary love forged in fire and shadow. Equals in pain, power, intellect, and restraint.',
    x: 150,
    y: 200,
    color: '#DC2626'
  },
  {
    id: 'noor',
    name: 'Noor',
    role: 'Lost Sister',
    description: 'The light that was extinguished, her eternal motivation',
    connectionType: 'family',
    relationship: 'Beloved younger sister who died protecting her. Her guiding spirit.',
    x: 650,
    y: 150,
    color: '#F59E0B'
  },
  {
    id: 'zarephah',
    name: 'Zarephah',
    role: 'Mother-Mentor',
    description: 'Ex-League operative who saved and trained her',
    connectionType: 'mentor',
    relationship: 'The only mother she ever knew. Forged her into a warrior.',
    x: 600,
    y: 400,
    color: '#059669'
  },
  {
    id: 'dick',
    name: 'Dick Grayson',
    role: 'Soul Brother',
    description: 'Nightwing - The emotional mirror and kindred spirit',
    connectionType: 'ally',
    relationship: 'Instant kindred spirits. Both lost everything and still found a way to smile.',
    x: 250,
    y: 100,
    color: '#2563EB'
  },
  {
    id: 'jason',
    name: 'Jason Todd',
    role: 'Twin Flame',
    description: 'Red Hood - Fire meeting fire, chosen sibling of wrath and redemption',
    connectionType: 'complex',
    relationship: 'Chaotic twin flame. Fierce, loyal, volcanic - chosen siblinghood.',
    x: 100,
    y: 350,
    color: '#DC2626'
  },
  {
    id: 'damian',
    name: 'Damian Wayne',
    role: 'Chosen Son',
    description: 'Robin - The son she never got to raise, who chose to call her Mother',
    connectionType: 'family',
    relationship: 'Slowly became his true mother through earning his respect and trust.',
    x: 200,
    y: 450,
    color: '#059669'
  },
  {
    id: 'alfred',
    name: 'Alfred Pennyworth',
    role: 'Father Figure',
    description: 'The Father She Needed - treats her as daughter by choice',
    connectionType: 'family',
    relationship: 'First to truly see her. Tea and late conversations about poetry, war, and grief.',
    x: 350,
    y: 150,
    color: '#6B7280'
  },
  {
    id: 'barbara',
    name: 'Barbara Gordon',
    role: 'Quiet Anchor',
    description: 'Oracle/Batgirl - Respect built on survival, not similarity',
    connectionType: 'ally',
    relationship: 'Mutual respect. Both know what it means to be broken and rebuilt.',
    x: 50,
    y: 250,
    color: '#7C3AED'
  },
  {
    id: 'cassandra',
    name: 'Cassandra Cain',
    role: 'Mirror in Dark',
    description: 'Batgirl - Terrifyingly alike, dancers of shadow and precision',
    connectionType: 'ally',
    relationship: 'Silent understanding. Sparring feels like communion.',
    x: 450,
    y: 450,
    color: '#1F2937'
  },
  {
    id: 'tirdad',
    name: 'Tirdad',
    role: 'Fallen Twin',
    description: 'The Fallen Flame - her divine twin brother turned enemy',
    connectionType: 'antagonist',
    relationship: 'Divine twin who fell to jealousy. Their war is not over.',
    x: 750,
    y: 300,
    color: '#991B1B'
  },
  {
    id: 'ras',
    name: "Ra's al Ghul",
    role: 'Hidden Puppeteer',
    description: 'The Demon\'s Head - manipulated her family, seeks the Mirror of Mithra',
    connectionType: 'antagonist',
    relationship: 'Ancient enemy who orchestrated her family\'s downfall. Seeks to control her.',
    x: 700,
    y: 500,
    color: '#B91C1C'
  }
]

const connections: Connection[] = [
  { from: 'liv', to: 'bruce', label: 'Legendary Love', strength: 'legendary' },
  { from: 'liv', to: 'noor', label: 'Eternal Bond', strength: 'legendary' },
  { from: 'liv', to: 'zarephah', label: 'Mother-Daughter', strength: 'strong' },
  { from: 'liv', to: 'dick', label: 'Kindred Spirits', strength: 'strong' },
  { from: 'liv', to: 'jason', label: 'Twin Flames', strength: 'strong' },
  { from: 'liv', to: 'damian', label: 'Chosen Family', strength: 'strong' },
  { from: 'liv', to: 'alfred', label: 'Paternal Love', strength: 'strong' },
  { from: 'liv', to: 'barbara', label: 'Mutual Respect', strength: 'moderate' },
  { from: 'liv', to: 'cassandra', label: 'Silent Bond', strength: 'moderate' },
  { from: 'liv', to: 'tirdad', label: 'Divine Conflict', strength: 'legendary' },
  { from: 'liv', to: 'ras', label: 'Ancient Enemy', strength: 'strong' },
  { from: 'bruce', to: 'damian', label: 'Father-Son', strength: 'strong' },
  { from: 'bruce', to: 'alfred', label: 'Father Figure', strength: 'legendary' },
  { from: 'bruce', to: 'dick', label: 'First Son', strength: 'strong' },
  { from: 'bruce', to: 'jason', label: 'Lost Son', strength: 'complex' },
  { from: 'ras', to: 'tirdad', label: 'Dark Alliance', strength: 'moderate' }
]

export function RelationshipMindmap() {
  const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const getConnectionColor = (strength: string) => {
    switch (strength) {
      case 'legendary': return '#DC2626'
      case 'strong': return '#059669'
      case 'moderate': return '#2563EB'
      case 'weak': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const getNodeSize = (nodeId: string) => {
    if (nodeId === 'liv') return 45
    if (['bruce', 'noor', 'tirdad'].includes(nodeId)) return 35
    return 25
  }

  const getRelevantConnections = (nodeId: string) => {
    return connections.filter(conn => 
      conn.from === nodeId || conn.to === nodeId ||
      (hoveredNode && (conn.from === hoveredNode || conn.to === hoveredNode))
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Liv Freya's Relationship Network</h3>
        <p className="text-muted-foreground">Interactive mindmap of bonds forged in fire, love, and shadow</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <svg
              ref={svgRef}
              viewBox="0 0 800 600"
              className="w-full h-[500px] border border-border rounded-lg bg-card"
            >
              {/* Connection lines */}
              <g>
                {connections.map((connection, index) => {
                  const fromNode = relationshipData.find(n => n.id === connection.from)
                  const toNode = relationshipData.find(n => n.id === connection.to)
                  
                  if (!fromNode || !toNode) return null
                  
                  const isRelevant = !hoveredNode || 
                    connection.from === hoveredNode || 
                    connection.to === hoveredNode ||
                    hoveredNode === 'liv'
                  
                  return (
                    <g key={index}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isRelevant ? getConnectionColor(connection.strength) : '#374151'}
                        strokeWidth={isRelevant ? (connection.strength === 'legendary' ? 3 : 2) : 1}
                        opacity={isRelevant ? 0.8 : 0.2}
                        strokeDasharray={connection.strength === 'complex' ? '5,5' : 'none'}
                      />
                      {isRelevant && (
                        <text
                          x={(fromNode.x + toNode.x) / 2}
                          y={(fromNode.y + toNode.y) / 2}
                          fill={getConnectionColor(connection.strength)}
                          fontSize="10"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {connection.label}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
              
              {/* Nodes */}
              <g>
                {relationshipData.map((node) => {
                  const isHovered = hoveredNode === node.id
                  const isSelected = selectedNode?.id === node.id
                  const size = getNodeSize(node.id)
                  
                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={size}
                        fill={node.color}
                        stroke={isSelected ? '#FBBF24' : isHovered ? '#F3F4F6' : '#374151'}
                        strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
                        className="cursor-pointer transition-all duration-200"
                        opacity={!hoveredNode || hoveredNode === node.id || hoveredNode === 'liv' ? 1 : 0.4}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => setSelectedNode(node)}
                      />
                      <text
                        x={node.x}
                        y={node.y + size + 15}
                        fill="currentColor"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none"
                        opacity={!hoveredNode || hoveredNode === node.id || hoveredNode === 'liv' ? 1 : 0.6}
                      >
                        {node.name}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + size + 28}
                        fill="currentColor"
                        fontSize="10"
                        textAnchor="middle"
                        className="pointer-events-none"
                        opacity={0.7}
                      >
                        {node.role}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Relationship Types</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-sm">Romantic/Legendary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm">Family/Blood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                <span className="text-sm">Mentor/Guide</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm">Ally/Friend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-sm">Complex/Nuanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-800"></div>
                <span className="text-sm">Antagonist/Enemy</span>
              </div>
            </div>
          </Card>
          
          {selectedNode && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  ></div>
                  <h4 className="font-bold text-lg">{selectedNode.name}</h4>
                  <Badge variant="secondary">{selectedNode.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedNode.description}
                </p>
                <div className="border-t pt-3">
                  <h5 className="font-semibold text-sm mb-2">Relationship</h5>
                  <p className="text-sm">{selectedNode.relationship}</p>
                </div>
              </div>
            </Card>
          )}
          
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click nodes to see details</li>
              <li>• Hover to highlight connections</li>
              <li>• Line thickness shows bond strength</li>
              <li>• Dashed lines show complex relationships</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}