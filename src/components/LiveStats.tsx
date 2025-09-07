import { useEffect, useRef, useState } from "react";
import { Users, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatProps {
  icon: React.ReactNode;
  label: string;
  colorClass: string; // e.g. "text-writer" or "text-client"
  initial: number;
  min: number;
  max: number;
}

const useLiveNumber = (initial: number, min: number, max: number) => {
  const [value, setValue] = useState(initial);
  const direction = useRef(1);

  useEffect(() => {
    const interval = setInterval(() => {
      // small random delta for lively feel
      const delta = Math.floor(Math.random() * 5) * direction.current || 1;
      let next = value + delta;
      if (next >= max) {
        next = max - 1;
        direction.current = -1;
      } else if (next <= min) {
        next = min + 1;
        direction.current = 1;
      }
      setValue(next);
    }, 1800 + Math.random() * 800);

    return () => clearInterval(interval);
  }, [value, min, max]);

  return value;
};

const Stat = ({ icon, label, colorClass, initial, min, max }: StatProps) => {
  const value = useLiveNumber(initial, min, max);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${colorClass.replace('text-', 'text-')}`}>
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold leading-none">{value.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const LiveStats = () => {
  return (
    <section aria-label="Live platform stats" className="py-10 bg-background/80">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Stat
            icon={<Users className="h-6 w-6 text-writer" />}
            label="Writers online right now"
            colorClass="text-writer"
            initial={128}
            min={80}
            max={180}
          />
          <Stat
            icon={<FileText className="h-6 w-6 text-client" />}
            label="Current available jobs"
            colorClass="text-client"
            initial={36}
            min={15}
            max={60}
          />
        </div>
      </div>
    </section>
  );
};
