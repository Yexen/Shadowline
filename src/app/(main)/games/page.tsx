'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";


export default function GamesPage() {

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">
            Welcome to the Batcave Arcades. Take a break from writing and test your skills with these custom-built training simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-muted-foreground/50">
                    <Gamepad2 />
                    Batmobile Runner [OFFLINE]
                </CardTitle>
                <CardDescription>
                    The simulator is currently down for maintenance. Please check back later.
                </CardDescription>
              </CardHeader>
           </Card>
        </div>
      </div>
    </>
  );
}
