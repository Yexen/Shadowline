'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useInvites } from '@/hooks/use-invites-vercel';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { UserRole, InviteType } from '@/types/auth';
import { Copy, Plus, Trash2, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface InviteManagerProps {
  trigger?: React.ReactNode;
}

export function InviteManager({ trigger }: InviteManagerProps) {
  const { invites, isLoaded, createInvite, deactivateInvite, deleteInvite } = useInvites();
  const { activeUser, checkPermission } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [inviteType, setInviteType] = useState<InviteType>('guest');
  const [targetRole, setTargetRole] = useState<UserRole>('viewer');
  const [expiresIn, setExpiresIn] = useState<string>('7');
  const [maxUses, setMaxUses] = useState<string>('1');
  const [isUnlimited, setIsUnlimited] = useState(false);

  const canManageInvites = checkPermission({ id: 'user:invite', name: 'Invite Users', description: 'Create invite links', resource: 'user', action: 'invite' });

  if (!canManageInvites) {
    return null;
  }

  const handleCreateInvite = async () => {
    if (!activeUser) return;

    setIsCreating(true);
    try {
      const token = await createInvite(
        inviteType,
        activeUser.id,
        inviteType === 'role-specific' ? targetRole : undefined,
        expiresIn ? parseInt(expiresIn) : undefined,
        isUnlimited ? undefined : parseInt(maxUses)
      );

      const inviteUrl = `${window.location.origin}/signup?invite=${token}`;
      await navigator.clipboard.writeText(inviteUrl);

      toast({
        title: 'Invite Created',
        description: 'Invite link copied to clipboard',
      });

      // Reset form
      setInviteType('guest');
      setTargetRole('viewer');
      setExpiresIn('7');
      setMaxUses('1');
      setIsUnlimited(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create invite',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyInvite = async (token: string) => {
    const inviteUrl = `${window.location.origin}/signup?invite=${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Copied',
      description: 'Invite link copied to clipboard',
    });
  };

  const handleDeactivateInvite = async (inviteId: string) => {
    try {
      await deactivateInvite(inviteId);
      toast({
        title: 'Invite Deactivated',
        description: 'Invite link has been deactivated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deactivate invite',
      });
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId);
      toast({
        title: 'Invite Deleted',
        description: 'Invite has been permanently deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete invite',
      });
    }
  };

  const activeInvites = invites.filter(invite => invite.isActive);
  const inactiveInvites = invites.filter(invite => !invite.isActive);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Manage Invites
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Invite Management</DialogTitle>
          <DialogDescription>
            Create and manage invite links for new users
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Invite Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Invite</CardTitle>
              <CardDescription>
                Generate invite links for new users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-type">Invite Type</Label>
                <Select value={inviteType} onValueChange={(value: InviteType) => setInviteType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest (Any Role)</SelectItem>
                    <SelectItem value="role-specific">Role Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inviteType === 'role-specific' && (
                <div className="space-y-2">
                  <Label htmlFor="target-role">Target Role</Label>
                  <Select value={targetRole} onValueChange={(value: UserRole) => setTargetRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="contributor">Contributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expires-in">Expires In (Days)</Label>
                <Input
                  id="expires-in"
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  placeholder="7"
                  min="1"
                  max="365"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-uses">Maximum Uses</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="max-uses"
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="1"
                    min="1"
                    disabled={isUnlimited}
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="unlimited"
                      checked={isUnlimited}
                      onChange={(e) => setIsUnlimited(e.target.checked)}
                    />
                    <Label htmlFor="unlimited" className="text-sm">Unlimited</Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateInvite}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Invite'}
              </Button>
            </CardContent>
          </Card>

          {/* Active Invites */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Active Invites ({activeInvites.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activeInvites.map((invite) => (
                  <Card key={invite.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={invite.type === 'guest' ? 'default' : 'secondary'}>
                            {invite.type === 'guest' ? 'Guest' : invite.targetRole}
                          </Badge>
                          {invite.expiresAt && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              {format(invite.expiresAt, 'MMM dd')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Uses: {invite.currentUses}{invite.maxUses ? `/${invite.maxUses}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyInvite(invite.token)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateInvite(invite.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {activeInvites.length === 0 && (
                  <p className="text-muted-foreground text-sm">No active invites</p>
                )}
              </div>
            </div>

            {/* Inactive Invites */}
            {inactiveInvites.length > 0 && (
              <div>
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <XCircle className="mr-2 h-5 w-5 text-gray-500" />
                  Inactive Invites ({inactiveInvites.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {inactiveInvites.map((invite) => (
                    <Card key={invite.id} className="p-3 opacity-60">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">
                              {invite.type === 'guest' ? 'Guest' : invite.targetRole}
                            </Badge>
                            <Badge variant="destructive" className="text-xs">
                              Inactive
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Uses: {invite.currentUses}{invite.maxUses ? `/${invite.maxUses}` : ''}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvite(invite.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}