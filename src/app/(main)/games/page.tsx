
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          Explore the interactive adventures of the Dark Knight.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-3">
            <Gamepad2 />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will feature a database of Batman-related video games, from the classic Arkham series to modern titles. Stay tuned, crimefighter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
