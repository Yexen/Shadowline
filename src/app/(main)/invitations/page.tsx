'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-simple-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, UserPlus, Shield } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface InviteLink {
  id: string;
  token: string;
  role: UserRole;
  createdAt: Date;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export default function InvitationsPage() {
  const { activeUser } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [maxUses, setMaxUses] = useState<string>('1');
  const [invites, setInvites] = useState<InviteLink[]>([]);

  // Only allow authors to access this page
  if (!activeUser || activeUser.role !== 'author') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only authors can manage invitations.</p>
        </div>
      </div>
    );
  }

  const generateInviteToken = (role: UserRole): string => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `${role}-${randomId}`;
  };

  const createInvite = () => {
    const token = generateInviteToken(selectedRole);
    const newInvite: InviteLink = {
      id: `invite-${Date.now()}`,
      token,
      role: selectedRole,
      createdAt: new Date(),
      maxUses: maxUses === 'unlimited' ? undefined : parseInt(maxUses),
      currentUses: 0,
      isActive: true,
    };

    setInvites(prev => [newInvite, ...prev]);

    toast({
      title: 'Invitation Created!',
      description: `New ${selectedRole} invitation link generated.`,
    });
  };

  const copyInviteLink = (token: string) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);

    toast({
      title: 'Link Copied!',
      description: 'Invitation link has been copied to clipboard.',
    });
  };

  const deactivateInvite = (id: string) => {
    setInvites(prev =>
      prev.map(invite =>
        invite.id === id
          ? { ...invite, isActive: false }
          : invite
      )
    );

    toast({
      title: 'Invitation Deactivated',
      description: 'The invitation link has been deactivated.',
    });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'viewer': return 'text-blue-500';
      case 'analyst': return 'text-green-500';
      case 'contributor': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    return <Users className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Invitation Management</h1>
        <p className="text-muted-foreground">
          Create and manage invitation links for guest access to Shadowline.
        </p>
      </div>

      {/* Create New Invitation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New Invitation
          </CardTitle>
          <CardDescription>
            Generate a new invitation link with specific role permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses</Label>
              <Select value={maxUses} onValueChange={setMaxUses}>
                <SelectTrigger>
                  <SelectValue placeholder="Select max uses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 use</SelectItem>
                  <SelectItem value="5">5 uses</SelectItem>
                  <SelectItem value="10">10 uses</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={createInvite} className="w-full md:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Generate Invitation Link
          </Button>
        </CardContent>
      </Card>

      {/* Existing Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Invitations</CardTitle>
          <CardDescription>
            Manage your existing invitation links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invitations created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className={`border rounded-lg p-4 ${!invite.isActive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={getRoleColor(invite.role)}>
                        {getRoleIcon(invite.role)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {invite.role} Invitation
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created {invite.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          Uses: {invite.currentUses}/{invite.maxUses || '∞'}
                        </p>
                        <p className={`text-sm ${invite.isActive ? 'text-green-500' : 'text-red-500'}`}>
                          {invite.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(invite.token)}
                        disabled={!invite.isActive}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {invite.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deactivateInvite(invite.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}