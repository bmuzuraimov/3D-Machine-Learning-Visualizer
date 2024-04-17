import * as THREE from "three";

export const PARTICLE_COLOR = 0x888888;
export const FOG_COLOR = 0x000000;
export const FOG_NEAR = 1;
export const FOG_FAR = 1000;
export const SPHERE_GEOMETRY = { small: 0.1, large: 0.3 };
export const SPECULAR_COLOR = 0xff0000;
export const SHININESS = 80;
export const LINE_WIDTH = 1.0;

export function getParticleColor(clusterId) {
  const colors = [
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#00ffff", // Cyan
    "#ff00ff", // Magenta
    "#ff8000", // Orange
    "#ff0080", // Pink
    "#80ff00", // Lime
    "#0080ff", // Sky blue
    "#8000ff", // Purple
    "#ff80ff", // Light pink
    "#ff8000", // Light orange
    "#80ff80", // Light green
    "#8080ff", // Light blue
    "#ffff80", // Light yellow
    "#80ffff", // Light cyan
    "#ff80ff", // Light magenta
    "#ff0080", // Light pink
    "#ff8000", // Light orange
  ];
  return colors[clusterId % colors.length];
}

export function getOppositeColor(hexColor) {
  // Remove the '#' symbol if present
  hexColor = hexColor.replace("#", "");

  // Convert the hex color to RGB values
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);

  // Calculate the opposite RGB values
  const oppositeR = 255 - r;
  const oppositeG = 255 - g;
  const oppositeB = 255 - b;

  // Convert the opposite RGB values to hex
  const oppositeHexR = oppositeR.toString(16).padStart(2, "0");
  const oppositeHexG = oppositeG.toString(16).padStart(2, "0");
  const oppositeHexB = oppositeB.toString(16).padStart(2, "0");

  // Combine the opposite hex values into a single string
  const oppositeHexColor = `#${oppositeHexR}${oppositeHexG}${oppositeHexB}`;

  return oppositeHexColor;
}
