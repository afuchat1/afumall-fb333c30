import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryZone } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const AdminDeliveryZoneManager = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [locations, setLocations] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [minDays, setMinDays] = useState('1');
  const [maxDays, setMaxDays] = useState('3');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();

    // Real-time subscription
    const channel = supabase
      .channel('delivery-zones-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_zones' }, () => {
        fetchZones();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('zone_name');

      if (error) throw error;
      if (data) setZones(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching delivery zones',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!zoneName.trim() || !locations.trim() || !deliveryCharge) {
      toast({
        title: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const locationsArray = locations.split(',').map(loc => loc.trim()).filter(Boolean);
      
      const zoneData = {
        zone_name: zoneName.trim(),
        locations: locationsArray,
        delivery_charge: parseFloat(deliveryCharge),
        min_days: parseInt(minDays),
        max_days: parseInt(maxDays),
        is_active: isActive,
      };

      if (editingZone) {
        const { error } = await supabase
          .from('delivery_zones')
          .update(zoneData)
          .eq('id', editingZone.id);

        if (error) throw error;
        toast({ title: 'Delivery zone updated successfully' });
      } else {
        const { error } = await supabase
          .from('delivery_zones')
          .insert([zoneData]);

        if (error) throw error;
        toast({ title: 'Delivery zone created successfully' });
      }

      handleDialogClose();
      fetchZones();
    } catch (error: any) {
      toast({
        title: 'Error saving delivery zone',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneName(zone.zone_name);
    setLocations(zone.locations.join(', '));
    setDeliveryCharge(zone.delivery_charge.toString());
    setMinDays(zone.min_days.toString());
    setMaxDays(zone.max_days.toString());
    setIsActive(zone.is_active);
    setShowDialog(true);
  };

  const handleDelete = async (zoneId: string) => {
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;
      
      toast({ title: 'Delivery zone deleted successfully' });
      fetchZones();
    } catch (error: any) {
      toast({
        title: 'Error deleting delivery zone',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setZoneName('');
    setLocations('');
    setDeliveryCharge('');
    setMinDays('1');
    setMaxDays('3');
    setIsActive(true);
    setEditingZone(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Zone Management
          </CardTitle>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading zones...</div>
        ) : zones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No delivery zones configured</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Zone
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Delivery Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.zone_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {zone.locations.slice(0, 3).map((loc, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {loc}
                        </Badge>
                      ))}
                      {zone.locations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{zone.locations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>UGX {zone.delivery_charge.toLocaleString()}</TableCell>
                  <TableCell>{zone.min_days}-{zone.max_days} days</TableCell>
                  <TableCell>
                    <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(zone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Zone</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{zone.zone_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(zone.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name *</Label>
              <Input
                id="zoneName"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="e.g., Kampala Central"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locations">Locations * (comma-separated)</Label>
              <Input
                id="locations"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="e.g., Kampala, Entebbe, Wakiso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryCharge">Delivery Charge (UGX) *</Label>
              <Input
                id="deliveryCharge"
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDays">Min Days</Label>
                <Input
                  id="minDays"
                  type="number"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDays">Max Days</Label>
                <Input
                  id="maxDays"
                  type="number"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingZone ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};