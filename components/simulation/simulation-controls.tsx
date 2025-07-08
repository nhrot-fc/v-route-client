"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, RotateCw } from "lucide-react";

interface SimulationControlsProps {
  isRunning: boolean;
  speedFactor: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onRefresh: () => void;
  onSpeedChange: (value: number[]) => void;
}

export function SimulationControls({
  isRunning,
  speedFactor,
  onStart,
  onPause,
  onStop,
  onRefresh,
  onSpeedChange
}: SimulationControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {!isRunning ? (
          <Button onClick={onStart}>
            <Play className="w-4 h-4 mr-2" />
            Iniciar
          </Button>
        ) : (
          <Button onClick={onPause}>
            <Pause className="w-4 h-4 mr-2" />
            Pausar
          </Button>
        )}
        <Button onClick={onStop} variant="destructive">
          <Square className="w-4 h-4 mr-2" />
          Detener
        </Button>
        <Button onClick={onRefresh} variant="outline">
          <RotateCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4 min-w-[200px]">
        <Label>Velocidad:</Label>
        <Slider
          value={[speedFactor]}
          min={0.1}
          max={10}
          step={0.1}
          onValueChange={onSpeedChange}
          className="w-[120px]"
        />
        <span className="text-sm">{speedFactor}x</span>
      </div>
    </div>
  );
} 