'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Users, 
  HardDrive, 
  Activity,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  limit,
  orderBy,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { getAppFirestore } from '@/lib/firebase';
import { useWriters } from '@/hooks/use-writers';

interface FirestoreDocument {
  id: string;
  path: string;
  data: any;
  lastModified: string;
}

interface CollectionStats {
  name: string;
  documentCount: number;
  lastModified: string;
  size: string;
}

export function FirebaseManager() {
  const [activeTab, setActiveTab] = useState<'firestore' | 'auth' | 'storage' | 'analytics'>('firestore');
  const [collections, setCollections] = useState<CollectionStats[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [documents, setDocuments] = useState<FirestoreDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [realTimeListener, setRealTimeListener] = useState<Unsubscribe | null>(null);
  
  const db = getAppFirestore();
  const { writers, activeWriter, isLoaded } = useWriters();

  // Known collections in our app
  const knownCollections = [
    'users',
    'userData', 
    'drafts',
    'messages',
    'logs',
    'analytics'
  ];

  // Load collection stats
  const loadCollections = async () => {
    setLoading(true);
    try {
      const stats: CollectionStats[] = [];
      
      for (const collectionName of knownCollections) {
        try {
          const colRef = collection(db, collectionName);
          const snapshot = await getDocs(query(colRef, limit(1000)));
          
          stats.push({
            name: collectionName,
            documentCount: snapshot.size,
            lastModified: new Date().toISOString(),
            size: `${Math.round(JSON.stringify(snapshot.docs.map(d => d.data())).length / 1024)} KB`
          });
        } catch (error) {
          // Collection might not exist yet
          stats.push({
            name: collectionName,
            documentCount: 0,
            lastModified: 'N/A',
            size: '0 KB'
          });
        }
      }
      
      setCollections(stats);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load documents from selected collection
  const loadDocuments = async (collectionName: string) => {
    if (!collectionName) return;
    
    setLoading(true);
    try {
      // Clear existing real-time listener
      if (realTimeListener) {
        realTimeListener();
        setRealTimeListener(null);
      }

      const colRef = collection(db, collectionName);
      let q = query(colRef, limit(100));
      
      // Add search filter if query exists
      if (searchQuery) {
        // Note: Firestore doesn't support full-text search, this is a basic implementation
        // In production, you'd use Algolia or similar for proper search
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs: FirestoreDocument[] = snapshot.docs.map(doc => ({
          id: doc.id,
          path: `${collectionName}/${doc.id}`,
          data: doc.data(),
          lastModified: doc.data().lastUpdated || doc.data().createdAt || 'Unknown'
        }));
        
        setDocuments(docs);
        setLoading(false);
      });
      
      setRealTimeListener(unsubscribe);
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isLoaded) {
      loadCollections();
    }
  }, [isLoaded]);

  // Load documents when collection changes
  useEffect(() => {
    if (selectedCollection) {
      loadDocuments(selectedCollection);
    }
    
    return () => {
      if (realTimeListener) {
        realTimeListener();
      }
    };
  }, [selectedCollection, searchQuery]);

  // Create new document
  const createDocument = async () => {
    if (!selectedCollection) return;
    
    const docId = prompt('Enter document ID (leave empty for auto-generated):') || undefined;
    const docData = prompt('Enter document data (JSON):');
    
    if (!docData) return;
    
    try {
      const data = JSON.parse(docData);
      const docRef = docId ? doc(db, selectedCollection, docId) : doc(collection(db, selectedCollection));
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: activeWriter?.id || 'unknown'
      });
      
      // Refresh collections stats
      loadCollections();
    } catch (error: any) {
      alert(`Error creating document: ${error.message}`);
    }
  };

  // Delete document
  const deleteDocument = async (docId: string) => {
    if (!selectedCollection || !confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDoc(doc(db, selectedCollection, docId));
      loadCollections();
    } catch (error: any) {
      alert(`Error deleting document: ${error.message}`);
    }
  };

  // Edit document (simplified - in production you'd use a proper JSON editor)
  const editDocument = async (docId: string, currentData: any) => {
    const newData = prompt('Edit document data (JSON):', JSON.stringify(currentData, null, 2));
    if (!newData || newData === JSON.stringify(currentData, null, 2)) return;
    
    try {
      const data = JSON.parse(newData);
      await updateDoc(doc(db, selectedCollection, docId), {
        ...data,
        lastUpdated: new Date().toISOString(),
        updatedBy: activeWriter?.id || 'unknown'
      });
    } catch (error: any) {
      alert(`Error updating document: ${error.message}`);
    }
  };

  const renderFirestore = () => (
    <div className="grid grid-cols-12 gap-4 h-[600px]">
      {/* Collections List */}
      <div className="col-span-4 border border-white/10 rounded-lg bg-black/40">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-amber-400 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Collections
          </h3>
          <Button size="sm" variant="ghost" onClick={loadCollections} disabled={loading}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="p-2 space-y-1 max-h-[520px] overflow-auto">
          {collections.map((col) => (
            <button
              key={col.name}
              onClick={() => setSelectedCollection(col.name)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                selectedCollection === col.name
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{col.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {col.documentCount}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Size: {col.size}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="col-span-8 border border-white/10 rounded-lg bg-black/40">
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-amber-400">
              {selectedCollection ? `Documents in ${selectedCollection}` : 'Select a collection'}
            </h3>
            <div className="flex items-center gap-2">
              {selectedCollection && (
                <Button size="sm" variant="outline" onClick={createDocument}>
                  <Plus className="w-3 h-3 mr-1" />
                  New Document
                </Button>
              )}
            </div>
          </div>
          
          {selectedCollection && (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="text-sm"
              />
            </div>
          )}
        </div>

        <div className="p-2 max-h-[520px] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {selectedCollection ? 'No documents found' : 'Select a collection to view documents'}
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-black/20 border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono text-amber-300">
                        {doc.id}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => console.log('View document:', doc)}
                          className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => editDocument(doc.id, doc.data)}
                          className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteDocument(doc.id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-gray-400 mb-2">
                      Modified: {new Date(doc.lastModified).toLocaleString()}
                    </div>
                    <pre className="text-xs bg-black/40 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(doc.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="space-y-4">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 border border-white/10 rounded">
              <div className="text-2xl font-bold text-green-400">{writers.length}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="text-center p-4 border border-white/10 rounded">
              <div className="text-2xl font-bold text-blue-400">
                {writers.filter(w => w.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-center p-4 border border-white/10 rounded">
              <div className="text-2xl font-bold text-yellow-400">
                {writers.filter(w => w.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-400">Pending Approval</div>
            </div>
          </div>

          <div className="space-y-2">
            {writers.map((writer) => (
              <div key={writer.id} className="flex items-center justify-between p-3 border border-white/10 rounded">
                <div className="flex items-center gap-3">
                  <img 
                    src={writer.avatarUrl} 
                    alt={writer.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-amber-300">{writer.name}</div>
                    <div className="text-xs text-gray-400">{writer.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={writer.status === 'approved' ? 'default' : 'secondary'}
                    className={
                      writer.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      writer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }
                  >
                    {writer.status}
                  </Badge>
                  <Badge variant="outline">{writer.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-400">Firebase Studio</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          Connected to Firebase
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-black/40">
          <TabsTrigger value="firestore" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Database className="w-4 h-4 mr-2" />
            Firestore
          </TabsTrigger>
          <TabsTrigger value="auth" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Users className="w-4 h-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <HardDrive className="w-4 h-4 mr-2" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="firestore" className="mt-4">
          {renderFirestore()}
        </TabsContent>

        <TabsContent value="auth" className="mt-4">
          {renderAuth()}
        </TabsContent>

        <TabsContent value="storage" className="mt-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <HardDrive className="w-5 h-5" />
                Firebase Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Storage browser coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Activity className="w-5 h-5" />
                System Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}