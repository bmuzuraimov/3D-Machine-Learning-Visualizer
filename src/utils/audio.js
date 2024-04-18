export function playSound(audioLoader, sound, soundBuffer) {
    if (soundBuffer) {
      sound.setBuffer(soundBuffer);
      sound.setVolume(0.5);
      sound.play();
    } else {
      audioLoader.load("/sounds/metal_sphere.wav", function (buffer) {
        soundBuffer = buffer;
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        sound.play();
      });
    }
  }