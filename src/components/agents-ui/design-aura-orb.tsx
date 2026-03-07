"use client";

import React, { useMemo, type ComponentProps } from "react";
import { ReactShaderToy } from "@/components/agents-ui/react-shader-toy";
import { cn } from "@/lib/utils";

function hexToRgb(hexColor: string): [number, number, number] {
  const rgbColor = hexColor.match(
    /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
  );

  if (rgbColor) {
    const [, r, g, b] = rgbColor;
    return [r, g, b].map((c) => Number.parseInt(c, 16) / 255) as [
      number,
      number,
      number,
    ];
  }

  return [0.97, 0.78, 0.56];
}

const shaderSource = `
vec2 rotate2D(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 p = uv - vec2(uCenterX, uCenterY);
  p.x *= iResolution.x / iResolution.y;

  float t = iTime * uSpeed;
  float a = atan(p.y, p.x);
  float wobble = 0.003 * sin(a * 2.0 + t * 0.55) + 0.0018 * sin(a * 6.0 - t * 0.8);
  float radius = uRadius + wobble;
  float r = length(p);

  float body = 1.0 - smoothstep(radius, radius + 0.035, r);
  float innerFalloff = 1.0 - smoothstep(0.0, radius, r);
  float rimEdge = 1.0 - smoothstep(0.0, 0.02 + uThickness * 0.25, abs(r - radius));

  vec2 q = p / max(radius, 0.0001);
  float z = sqrt(max(0.0, 1.0 - dot(q, q)));
  vec3 n = normalize(vec3(q, z));
  vec3 lightDir = normalize(vec3(-0.38, 0.28, 0.88));
  float diff = clamp(dot(n, lightDir), 0.0, 1.0);
  float fresnel = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.1);

  vec2 flowUv = rotate2D(q, t * 0.28);
  float flow1 = sin((flowUv.x * 7.2 + t * 1.05) + sin(flowUv.y * 6.1 - t * 0.88) * 1.25);
  float flow2 = cos((flowUv.y * 8.4 - t * 0.82) + sin(flowUv.x * 5.3 + t * 1.22) * 1.1);
  float fluid = clamp(0.5 + flow1 * 0.2 + flow2 * 0.2, 0.0, 1.0);

  float prism = 0.5 + 0.5 * sin((flowUv.x + flowUv.y) * 8.0 - t * 0.65);
  vec3 warm = uColor;
  vec3 pearl = vec3(0.98, 0.95, 0.9);
  vec3 cool = vec3(0.72, 0.86, 0.98);

  vec3 fluidColor = mix(warm * 0.46, pearl, fluid * 0.34);
  fluidColor = mix(fluidColor, cool, prism * 0.1 * (0.2 + fresnel));

  vec3 bodyCol = fluidColor * body * (0.42 + 0.58 * diff);
  bodyCol += pearl * innerFalloff * body * 0.16;

  vec3 rimCol = mix(pearl, warm, 0.35) * rimEdge * (0.35 + 0.65 * fresnel);

  float outer = max(r - radius, 0.0);
  float glow = exp(-7.0 * outer);
  vec3 glowCol = warm * glow * 0.22;

  // Fluid solar-like corona around the sphere.
  float coronaNoise = 0.0;
  coronaNoise += 0.55 * sin(a * 4.0 + t * 0.92);
  coronaNoise += 0.32 * sin(a * 9.0 - t * 1.18);
  coronaNoise += 0.18 * sin(a * 14.0 + t * 1.42);
  coronaNoise += 0.11 * sin(a * 22.0 - t * 0.72);
  coronaNoise = 0.5 + 0.5 * coronaNoise;

  float coronaSpan = 0.09 + 0.06 * coronaNoise;
  float corona = exp(-outer * (10.0 - 3.2 * coronaNoise));
  corona *= smoothstep(radius - 0.002, radius + coronaSpan, r);
  corona *= (0.48 + 0.86 * coronaNoise);

  // Orbital filaments for flowing aura motion.
  float filamentPath =
    0.026 * sin(a * 2.0 + t * 0.82) +
    0.015 * sin(a * 6.0 - t * 1.16);
  float filament = exp(-70.0 * abs(outer - (0.018 + filamentPath)));
  filament *= (0.45 + 0.55 * smoothstep(0.35, 1.0, coronaNoise));
  filament *= exp(-outer * 4.5);

  vec3 coronaCol = mix(warm, pearl, 0.35) * corona * 0.82;
  vec3 filamentCol = mix(warm, vec3(1.0, 0.96, 0.88), 0.42) * filament * 0.92;

  vec3 col = (bodyCol + rimCol) * uBodyGain + (glowCol + coronaCol + filamentCol) * uAuraGain;
  float alpha = clamp(
    (body * 0.9 + rimEdge * 0.3) * uBodyGain +
    (glow * 0.24 + corona * 0.55 + filament * 0.45) * uAuraGain,
    0.0,
    1.0
  ) * uAlpha;
  fragColor = vec4(col, alpha);
}
`;

interface DesignAuraOrbProps {
  color?: `#${string}`;
  speed?: number;
  radius?: number;
  thickness?: number;
  alpha?: number;
  centerX?: number;
  centerY?: number;
  bodyGain?: number;
  auraGain?: number;
}

export function DesignAuraOrb({
  color = "#F5BF86",
  speed = 1.0,
  radius = 0.22,
  thickness = 0.06,
  alpha = 1.0,
  centerX = 0.5,
  centerY = 0.5,
  bodyGain = 1.0,
  auraGain = 1.0,
  className,
  ref,
  ...props
}: DesignAuraOrbProps & ComponentProps<"div">) {
  const rgbColor = useMemo(() => hexToRgb(color), [color]);

  return (
    <div ref={ref} className={cn("aspect-square", className)} {...props}>
      <ReactShaderToy
        fs={shaderSource}
        devicePixelRatio={globalThis.devicePixelRatio ?? 1}
        uniforms={{
          uColor: { type: "3fv", value: rgbColor },
          uSpeed: { type: "1f", value: speed },
          uRadius: { type: "1f", value: radius },
          uThickness: { type: "1f", value: thickness },
          uAlpha: { type: "1f", value: alpha },
          uCenterX: { type: "1f", value: centerX },
          uCenterY: { type: "1f", value: centerY },
          uBodyGain: { type: "1f", value: bodyGain },
          uAuraGain: { type: "1f", value: auraGain },
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
