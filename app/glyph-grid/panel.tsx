import { Dices, Plus, Shuffle, X } from 'lucide-react';

import { ScrubSlider } from '@/components/ui/scrub-slider';
import { cn } from '@/lib/utils';

import {
  ActionButton,
  ColorInput,
  Field,
  Hint,
  INPUT,
  PalettePicker,
  Section,
  Segmented,
  Toggle,
} from './controls';
import { DEFAULTS, MAX_COLS, MIN_COLS, randomSeed } from './defaults';
import type { BandRule } from './generator';
import {
  PRESETS,
  PRESET_IDS,
  derivePalette,
  shufflePalette,
  type CustomPalette,
  type PaletteId,
} from './palettes';
import {
  ASPECTS,
  POSTER_WIDTH,
  type AspectId,
  type Mode,
  type PosterSettings,
} from './scene';

const MODE_OPTIONS = [
  { value: 'cells', label: 'Cells' },
  { value: 'words', label: 'Word field' },
] as const;

const ASPECT_OPTIONS = (Object.keys(ASPECTS) as AspectId[]).map((value) => ({
  value,
  label: value,
}));

const BAND_OPTIONS = [
  { value: 'flat', label: 'Flat' },
  { value: 'depth', label: 'By depth' },
  { value: 'row', label: 'By row' },
] as const;

const PRESET_OPTIONS = PRESET_IDS.map((value) => ({
  value,
  name: PRESETS[value].name,
  palette: PRESETS[value],
}));

const GROUND_OPTIONS = [
  { value: 'dark', label: 'Dark ground' },
  { value: 'light', label: 'Light ground' },
] as const;

/* Export scales, labelled by what they produce. */
const PNG_SCALES = [2, 4] as const;

/*
 * The settings panel: everything that changes the poster without touching
 * the drawing. It only reads settings and reports changes, so the page keeps
 * the single copy of the state.
 */
export function ControlPanel({
  settings,
  rows,
  update,
  showRaw,
  onShowRaw,
  onPreviewPalette,
  onSavePng,
  onSaveSvg,
}: {
  settings: PosterSettings;
  rows: number;
  update: (patch: Partial<PosterSettings>) => void;
  showRaw: boolean;
  onShowRaw: (show: boolean) => void;
  /* A palette hovered in the picker, or null when the pointer leaves. */
  onPreviewPalette: (id: PaletteId | null) => void;
  onSavePng: (scale: number) => void;
  onSaveSvg: () => void;
}) {
  const customPalette = derivePalette(settings.custom);
  const paletteOptions = [
    ...PRESET_OPTIONS,
    { value: 'custom' as const, name: 'Custom', palette: customPalette },
  ];

  function updateCustom(patch: Partial<CustomPalette>) {
    update({ custom: { ...settings.custom, ...patch } });
  }

  function setLabelText(id: number, text: string) {
    update({
      labels: settings.labels.map((label) =>
        label.id === id ? { ...label, text } : label,
      ),
    });
  }

  /* New labels stack down the left edge, clear of the ones already there. */
  function addLabel() {
    const step = settings.labelSize * 3 * (settings.cols / rows);
    update({
      labels: [
        ...settings.labels,
        {
          id: Math.max(-1, ...settings.labels.map((label) => label.id)) + 1,
          text: 'Label',
          pos: {
            x: 1 / settings.cols,
            y: Math.min(0.9, 1 / rows + settings.labels.length * step),
          },
        },
      ],
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title="Export">
        <div className="grid grid-cols-3 gap-2">
          {PNG_SCALES.map((scale) => (
            <ActionButton key={scale} onClick={() => onSavePng(scale)}>
              PNG {POSTER_WIDTH * scale}px
            </ActionButton>
          ))}
          <ActionButton onClick={onSaveSvg}>SVG</ActionButton>
        </div>
      </Section>

      <Section title="Grid">
        <Segmented
          label="Mode"
          value={settings.mode}
          options={MODE_OPTIONS}
          onChange={(mode: Mode) => update({ mode })}
        />
        <ScrubSlider
          label="Columns"
          min={MIN_COLS}
          max={MAX_COLS}
          step={1}
          value={[settings.cols]}
          onValueChange={([cols]) => update({ cols })}
          onReset={() => update({ cols: DEFAULTS.cols })}
        />
        <Segmented
          label="Aspect ratio"
          value={settings.aspect}
          options={ASPECT_OPTIONS}
          onChange={(aspect: AspectId) => update({ aspect })}
        />
        <Hint text="How much of a cell has to be painted before it fills. Lower makes shapes thicker; higher keeps only what is fully covered.">
          <ScrubSlider
            label="Threshold"
            valueLabel={settings.threshold.toFixed(2)}
            min={0.05}
            max={0.95}
            step={0.01}
            value={[settings.threshold]}
            onValueChange={([threshold]) => update({ threshold })}
            onReset={() => update({ threshold: DEFAULTS.threshold })}
          />
        </Hint>
        <Toggle
          label="Show raw drawing"
          checked={showRaw}
          onChange={onShowRaw}
        />
      </Section>

      <Section title="Style">
        <PalettePicker
          label="Palette"
          value={settings.paletteId}
          options={paletteOptions}
          onChange={(paletteId: PaletteId) => update({ paletteId })}
          onPreview={onPreviewPalette}
        />
        <ActionButton
          title="A random tint; the ground and accent follow from it"
          onClick={() =>
            update({ paletteId: 'custom', custom: shufflePalette() })
          }
        >
          <Shuffle aria-hidden />
          Shuffle palette
        </ActionButton>
        {settings.paletteId === 'custom' && (
          <>
            <Segmented
              label="Ground"
              value={settings.custom.dark ? 'dark' : 'light'}
              options={GROUND_OPTIONS}
              onChange={(ground) => updateCustom({ dark: ground === 'dark' })}
            />
            <ScrubSlider
              label="Ground hue"
              valueLabel={`${settings.custom.groundHue}°`}
              min={0}
              max={360}
              step={1}
              value={[settings.custom.groundHue]}
              onValueChange={([groundHue]) => updateCustom({ groundHue })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Tint" htmlFor="glyph-tint">
                <ColorInput
                  id="glyph-tint"
                  value={settings.custom.tint.toLowerCase()}
                  onChange={(event) =>
                    updateCustom({ tint: event.target.value })
                  }
                />
              </Field>
              <Field label="Accent" htmlFor="glyph-accent">
                <div className="flex gap-2">
                  {/* Shows the accent in use: the automatic one until the
                   * user picks their own. */}
                  <ColorInput
                    id="glyph-accent"
                    value={customPalette.accent.toLowerCase()}
                    onChange={(event) =>
                      updateCustom({ accent: event.target.value })
                    }
                  />
                  {settings.custom.accent && (
                    <ActionButton
                      title="Follow the tint again"
                      onClick={() => updateCustom({ accent: null })}
                    >
                      Auto
                    </ActionButton>
                  )}
                </div>
              </Field>
            </div>
          </>
        )}
        {settings.mode === 'cells' ? (
          <>
            <Hint text="How the cells inside a shape pick their tone: all one tone, by distance from the edge, or in layers from top to bottom.">
              <Segmented
                label="Band rule"
                value={settings.bandRule}
                options={BAND_OPTIONS}
                onChange={(bandRule: BandRule) => update({ bandRule })}
              />
            </Hint>
            <Hint text="How often a cell slips one tone lighter or darker than its neighbors, to break up clean bands.">
              <ScrubSlider
                label="Jitter"
                valueLabel={settings.jitter.toFixed(2)}
                min={0}
                max={0.5}
                step={0.01}
                value={[settings.jitter]}
                onValueChange={([jitter]) => update({ jitter })}
                onReset={() => update({ jitter: DEFAULTS.jitter })}
              />
            </Hint>
            <Field label="Charset" htmlFor="glyph-charset">
              <input
                id="glyph-charset"
                className={cn(INPUT, 'font-mono')}
                value={settings.charset}
                spellCheck={false}
                autoComplete="off"
                onChange={(event) => update({ charset: event.target.value })}
              />
            </Field>
          </>
        ) : (
          <Field label="Word list" htmlFor="glyph-words">
            <textarea
              id="glyph-words"
              className={cn(INPUT, 'min-h-20 resize-y font-mono uppercase')}
              value={settings.words}
              spellCheck={false}
              onChange={(event) => update({ words: event.target.value })}
            />
          </Field>
        )}
        <Field label="Seed" htmlFor="glyph-seed">
          <div className="flex gap-2">
            <input
              id="glyph-seed"
              className={cn(INPUT, 'min-w-0 flex-1 font-mono')}
              inputMode="numeric"
              value={settings.seed}
              onChange={(event) => {
                const seed = Number(
                  event.target.value.replace(/\D/g, '').slice(0, 10),
                );
                update({ seed: Math.min(seed, 0xffffffff) });
              }}
            />
            <ActionButton onClick={() => update({ seed: randomSeed() })}>
              <Dices aria-hidden />
              Reroll
            </ActionButton>
          </div>
        </Field>
      </Section>

      <Section title="Text">
        <p className="text-xs text-muted-foreground">
          You can drag the headline, wordmark and labels on the poster to move
          them around.
        </p>
        <Field label="Headline" htmlFor="glyph-headline">
          <textarea
            id="glyph-headline"
            className={cn(INPUT, 'min-h-20 resize-y font-serif')}
            value={settings.headline}
            onChange={(event) => update({ headline: event.target.value })}
          />
        </Field>
        <ScrubSlider
          label="Headline size"
          valueLabel={`${Math.round(settings.headlineSize * 100)}%`}
          min={0.04}
          max={0.24}
          step={0.01}
          value={[settings.headlineSize]}
          onValueChange={([headlineSize]) => update({ headlineSize })}
          onReset={() => update({ headlineSize: DEFAULTS.headlineSize })}
        />
        <Hint text="Clears the cells behind the headline and wordmark, so the type stays legible over the drawing.">
          <Toggle
            label="Quiet zone"
            checked={settings.quietZone}
            onChange={(quietZone) => update({ quietZone })}
          />
        </Hint>
        <Field label="Wordmark" htmlFor="glyph-wordmark">
          <input
            id="glyph-wordmark"
            className={INPUT}
            value={settings.wordmark}
            maxLength={40}
            onChange={(event) => update({ wordmark: event.target.value })}
          />
        </Field>
        <ScrubSlider
          label="Wordmark size"
          valueLabel={`${(settings.wordmarkSize * 100).toFixed(1)}%`}
          min={0.015}
          max={0.06}
          step={0.001}
          value={[settings.wordmarkSize]}
          onValueChange={([wordmarkSize]) => update({ wordmarkSize })}
          onReset={() => update({ wordmarkSize: DEFAULTS.wordmarkSize })}
        />
        <Field label="Labels">
          <div className="flex flex-col gap-2">
            {settings.labels.map((label) => (
              <div key={label.id} className="flex gap-2">
                <input
                  aria-label="Label text"
                  className={cn(INPUT, 'min-w-0 flex-1 font-mono uppercase')}
                  value={label.text}
                  maxLength={40}
                  onChange={(event) =>
                    setLabelText(label.id, event.target.value)
                  }
                />
                <ActionButton
                  aria-label={`Remove label ${label.text}`}
                  title="Remove label"
                  onClick={() =>
                    update({
                      labels: settings.labels.filter(
                        (item) => item.id !== label.id,
                      ),
                    })
                  }
                >
                  <X aria-hidden />
                </ActionButton>
              </div>
            ))}
            <ActionButton onClick={addLabel}>
              <Plus aria-hidden />
              Add label
            </ActionButton>
          </div>
        </Field>
        <ScrubSlider
          label="Label size"
          valueLabel={`${(settings.labelSize * 100).toFixed(1)}%`}
          min={0.01}
          max={0.04}
          step={0.001}
          value={[settings.labelSize]}
          onValueChange={([labelSize]) => update({ labelSize })}
          onReset={() => update({ labelSize: DEFAULTS.labelSize })}
        />
      </Section>
    </div>
  );
}
