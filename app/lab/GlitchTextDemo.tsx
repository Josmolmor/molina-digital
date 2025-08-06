'use client';

import React from 'react';
import { GlitchText } from 'glitch-text-effect/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MousePointer, Hand, Eye, ALargeSmall } from 'lucide-react';

export default function GlitchTextDemo() {
  const examples = [
    {
      title: 'Basic Hover Effect',
      description: 'Simple hover-triggered glitch transformation',
      component: (
        <GlitchText
          from="Hello World"
          to="Glitch Text!"
          trigger="hover"
          className="text-xl font-bold cursor-pointer"
          intensity="medium"
        />
      ),
      icon: <MousePointer className="size-4" />,
      code: `<GlitchText from="Hello World" to="Glitch Text!" trigger="hover" />`,
    },
    {
      title: 'Click to Transform',
      description: 'Click to start/reset the glitch effect',
      component: (
        <GlitchText
          from="Click Me"
          to="Transformed!"
          trigger="click"
          className="text-xl font-semibold cursor-pointer"
          duration={1500}
          intensity="low"
        />
      ),
      icon: <Hand className="size-4" />,
      code: `<GlitchText from="Click Me" to="Transformed!" trigger="click" />`,
    },
    {
      title: 'High Intensity Chaos',
      description: 'Maximum glitch with all visual effects',
      component: (
        <GlitchText
          from="Chaos"
          to="Beautiful"
          trigger="hover"
          className="text-xl font-bold cursor-pointer"
          intensity="high"
          duration={2500}
          effects={{
            shake: true,
            flicker: true,
            colorShift: true,
            scalePulse: true,
          }}
        />
      ),
      icon: <Zap className="size-4" />,
      code: `<GlitchText intensity="high" effects={{ shake: true, flicker: true, colorShift: true }} />`,
    },
    {
      title: 'Custom Characters',
      description: 'Using numbers and symbols for randomization',
      component: (
        <GlitchText
          from="Data: 12345"
          to="Hack: 67890"
          trigger="hover"
          className="text-lg font-mono cursor-pointer text-green-500"
          characters="numbers"
          duration={5000}
          intensity="medium"
        />
      ),
      icon: <ALargeSmall className="size-4" />,
      code: `<GlitchText characters="numbers" className="font-mono" />`,
    },
    {
      title: 'Intersection Observer',
      description: 'Triggers when element comes into view',
      component: (
        <GlitchText
          from="Scroll to me"
          to="I'm visible!"
          trigger="intersection"
          className="text-xl font-medium"
          duration={1200}
        />
      ),
      icon: <Eye className="size-4" />,
      code: `<GlitchText trigger="intersection" />`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Zero Dependencies', value: '0' },
          { label: 'Bundle Size', value: '<3KB' },
          { label: 'Trigger Types', value: '4' },
          { label: 'Intensity Levels', value: '3' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-lg bg-muted/50"
          >
            <div className="text-xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div>
            <code className="text-sm">npm install glitch-text-effect</code>
          </div>
          <div className="text-xs text-muted-foreground">
            <a
              href="https://github.com/josmolmor/glitch-text-effect"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              josmolmor/glitch-text-effect
            </a>
            {' · '}
            <a
              href="https://www.npmjs.com/package/glitch-text-effect"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              glitch-text-effect
            </a>
          </div>
        </div>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examples.map((example, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {example.icon}
                {example.title}
              </CardTitle>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg min-h-[100px]">
                {example.component}
              </div>
              <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded overflow-x-auto">
                {example.code}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intensity Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Intensity Levels</CardTitle>
          <CardDescription>
            Compare different intensity levels and their effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['low', 'medium', 'high'] as const).map((intensity) => (
              <div key={intensity} className="text-center space-y-3">
                <Badge>{intensity}</Badge>
                <div className="p-6 bg-muted/30 rounded-lg">
                  <GlitchText
                    from="Intensity"
                    to="Demo"
                    trigger="hover"
                    intensity={intensity}
                    className="text-xl font-bold cursor-pointer"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {intensity === 'low' && 'Subtle, minimal shake'}
                  {intensity === 'medium' && 'Balanced with shake effect'}
                  {intensity === 'high' && 'Maximum chaos with all effects'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
