import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function CommunityPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-black">Cong dong va gop y</h1>
      <Card className="mt-8">
        <CardHeader><CardTitle>Gui gop y</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea aria-label="Noi dung gop y" />
          <Button>Gui gop y</Button>
        </CardContent>
      </Card>
    </section>
  );
}
