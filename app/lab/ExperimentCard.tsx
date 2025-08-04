import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { parseTextWithLinks } from '@/lib/text-parse';
import { GeistMono } from 'geist/font/mono';

interface Experiment {
  id: number;
  title: string;
  description: string;
  date: string;
  tags: string[];
  component?: ReactNode;
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
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-center flex-wrap">
          <CardTitle className={`text-xl font-semibold ${GeistMono.className}`}>
            {experiment.title}
          </CardTitle>
          <time
            className={`text-sm text-muted-foreground ${GeistMono.className}`}
          >
            {experiment.date}
          </time>
        </div>
        <p className={`text-sm text-muted-foreground`}>
          {parseTextWithLinks(experiment.description)}
        </p>
        <div className={`flex flex-wrap gap-2`}>
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
      </CardHeader>
      <CardContent className="h-auto">
        {children}
        {experiment.component}
      </CardContent>
    </Card>
  );
}
