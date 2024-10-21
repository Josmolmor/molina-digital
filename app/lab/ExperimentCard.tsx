import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface Experiment {
  id: number;
  title: string;
  description: string;
  date: string;
  tags: string[];
  component: ReactNode;
}

export function ExperimentCard({
  experiment,
  children,
}: {
  experiment: Experiment;
  children?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-semibold">
            {experiment.title}
          </CardTitle>
          <time className="text-sm text-muted-foreground">
            {experiment.date}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">
          {experiment.description}
        </p>
      </CardHeader>
      <CardContent>
        {children}
        {experiment.component}
        <div className="mt-4 flex flex-wrap gap-1">
          {experiment.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
