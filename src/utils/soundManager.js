import { Howl } from 'howler';

const soundMap = {
  default: '/assets/sounds/default.mp3',
  inspiration: '/assets/sounds/inspiration.mp3',
  humor: '/assets/sounds/humor.mp3',
  // Add more categories and their corresponding sound files
};

let currentSound = null;

export const playAmbientSound = (category = 'default') => {
  if (currentSound) {
    currentSound.stop();
  }

  const sound = new Howl({
    src: [soundMap[category]],
    loop: true,
    volume: 0.5,
  });

  sound.play();
  currentSound = sound;
};

export const stopAmbientSound = () => {
  if (currentSound) {
    currentSound.stop();
    currentSound = null;
  }
};
