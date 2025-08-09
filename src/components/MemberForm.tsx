import { useState } from 'react';
import { User, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNovara, type Member } from '../store/useNovara';
import { getBrowserTimezone, generateId } from '../lib/time';

// Common timezones for the select dropdown
const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

interface MemberFormProps {
  className?: string;
}

export function MemberForm({ className }: MemberFormProps) {
  const { members, addMember, updateMember, removeMember } = useNovara();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: '',
    email: '',
    tz: getBrowserTimezone(),
    home: '',
    office: ''
  });

  const handleAddMember = () => {
    if (!newMember.name?.trim() || !newMember.email?.trim()) return;

    const member: Member = {
      id: generateId(),
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      tz: newMember.tz || getBrowserTimezone(),
      home: newMember.home?.trim() || undefined,
      office: newMember.office?.trim() || undefined
    };

    addMember(member);
    setNewMember({
      name: '',
      email: '',
      tz: getBrowserTimezone(),
      home: '',
      office: ''
    });
  };

  const handleUpdateMember = (id: string, updates: Partial<Member>) => {
    updateMember(id, updates);
    setEditingId(null);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const canAddMore = members.length < 6;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Team Members ({members.length}/6)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Members */}
        {members.map((member) => (
          <div key={member.id} className="border rounded-lg p-3">
            {editingId === member.id ? (
              <EditMemberForm
                member={member}
                onSave={(updates) => handleUpdateMember(member.id, updates)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{member.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{member.email}</div>
                  <div className="text-xs text-muted-foreground">{member.tz}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(member.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add New Member */}
        {canAddMore && (
          <div className="border-2 border-dashed rounded-lg p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className={newMember.email && !isValidEmail(newMember.email) ? 'border-red-500' : ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={newMember.tz}
                  onValueChange={(value) => setNewMember({ ...newMember, tz: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="home">Home Address</Label>
                  <Input
                    id="home"
                    placeholder="Optional"
                    value={newMember.home}
                    onChange={(e) => setNewMember({ ...newMember, home: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="office">Office Address</Label>
                  <Input
                    id="office"
                    placeholder="Optional"
                    value={newMember.office}
                    onChange={(e) => setNewMember({ ...newMember, office: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddMember}
                disabled={!newMember.name?.trim() || !newMember.email?.trim() || !isValidEmail(newMember.email || '')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        )}

        {!canAddMore && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Maximum of 6 members reached
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EditMemberFormProps {
  member: Member;
  onSave: (updates: Partial<Member>) => void;
  onCancel: () => void;
}

function EditMemberForm({ member, onSave, onCancel }: EditMemberFormProps) {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: member.name,
    email: member.email,
    tz: member.tz,
    home: member.home || '',
    office: member.office || ''
  });

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.email?.trim() || !isValidEmail(formData.email)) return;

    onSave({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      home: formData.home?.trim() || undefined,
      office: formData.office?.trim() || undefined
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="edit-name">Name *</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-email">Email *</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={formData.email && !isValidEmail(formData.email) ? 'border-red-500' : ''}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-timezone">Timezone</Label>
        <Select
          value={formData.tz}
          onValueChange={(value) => setFormData({ ...formData, tz: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="edit-home">Home Address</Label>
          <Input
            id="edit-home"
            value={formData.home}
            onChange={(e) => setFormData({ ...formData, home: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-office">Office Address</Label>
          <Input
            id="edit-office"
            value={formData.office}
            onChange={(e) => setFormData({ ...formData, office: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={!formData.name?.trim() || !formData.email?.trim() || !isValidEmail(formData.email || '')}
          size="sm"
        >
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}
