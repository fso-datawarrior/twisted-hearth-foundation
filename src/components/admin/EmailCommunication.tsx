import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function EmailCommunication() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Email Communication</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="mb-2">
                Email campaign features are currently under development. This section will allow you to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Send bulk emails to guests</li>
                <li>Create email templates</li>
                <li>Track email delivery status</li>
                <li>Manage recipient lists</li>
              </ul>
              <p className="mt-4">
                For now, you can use the RSVP confirmation emails that are automatically sent when guests submit their RSVPs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
