import { CandyHeader } from "@/components/pip/candy-header";
import { PipMascot } from "@/components/pip/pip-mascot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Public About page. Kid-safety rule from CLAUDE.md: first names/nicknames
// only, no last names, no school, no ages, no photos — this page is
// world-readable, not an internal doc.
const TEAM = [
  { name: "Papa", role: "Chief Engineer", blurb: "Plumbing, deploy, and the keys to the robots." },
  { name: "Laranya", role: "Chief Designer", blurb: "Picked the theme, drew Pip, and owns every screen you see." },
  { name: "Mehar", role: "Chief of Characters & Fun", blurb: "Gives Pip his personality and writes the funny loading messages." },
  { name: "Laranya & Mehar", role: "Boring-Test Judges / Chief Researchers", blurb: "Rate every plan AWESOME or BORING before it counts." },
];

export default function AboutPage() {
  return (
    <>
      <CandyHeader />
      <div className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
        <PipMascot size="lg" />
        <h1 className="text-3xl font-bold text-navy text-center">About Magic Trip Planner</h1>
        <p className="max-w-md text-center text-navy/80">
          Three robot helpers — a Scout, a Family Filter, and a Planner — argue about your
          holiday until it&apos;s fun.
        </p>

        <div className="w-full max-w-md flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>The team</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {TEAM.map((member) => (
                <div key={member.role}>
                  <p className="font-heading font-semibold text-navy">
                    {member.name} <span className="text-teal">— {member.role}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{member.blurb}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <PipMascot size="sm" />
              <p className="text-sm text-navy">
                Mascot: Pip the Penguin, drawn by Laranya, our Chief Designer.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
