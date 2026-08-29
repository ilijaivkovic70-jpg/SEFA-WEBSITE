import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>shadcn/ui test</CardTitle>
          <CardDescription>
            Ako ova kartica i dugme ispod izgledaju stilizovano, komponente rade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Test dugme</Button>
        </CardContent>
      </Card>
    </div>
  );
}
