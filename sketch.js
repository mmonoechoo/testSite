let fadeAlpha = 50; // Start fully opaque
let stars = [];
let blackholes = [];
let lastRedraw = 0;
const redrawInterval = 17; // Interval to redraw (in milliseconds), increased for demonstration
let isFadingOut = true; // Control if we are fading out or in

let song; // The audio file
let fft;  // FFT analyzer

function preload() {
  song = loadSound('https://raw.githubusercontent.com/mmonoechoo/songs/main/22_mmm.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2.0);
  colorMode(RGB, 255, 255, 255, 100);
  background(0, 0, 0, 40);

  fft = new p5.FFT(); // Create FFT analyzer
  song.loop(); // Play the song in a loop

  initSketch(); // Initialize sketch elements
}

function initSketch() {
  // Reset stars and blackholes for the new design
  stars = [];
  blackholes = [];
  for (let i = 2000; i--;) {
    stars.push({
      x: random(width) - width / 2,
      y: random(height) - height / 2,
      colour: i % 255
    });
  }
  for (let i = 17; i--;) {
    blackholes.push({
      x: random(-width / 2, width / 2),
      y: random(-height / 2, height / 2),
      driftX: sin(random(-100, 100)) * 4, // Random drift along X-axis
      driftY: cos(random(-100, 100)) * 4 // Random drift along Y-axis
    });
  }
}

function draw() {
  // Analyze audio data
  let spectrum = fft.analyze(); // Get the frequency spectrum
  let bass = fft.getEnergy('bass'); // Get the bass energy
  let treble = fft.getEnergy('treble'); // Get the treble energy
  let mid = fft.getEnergy('mid'); // Get the mid energy

  // React to the bass energy for fade effect
  fadeAlpha = map(mid, 0, 255, 0, 100);

  // Handle the transition effect
  if (millis() - lastRedraw > redrawInterval) {
    if (isFadingOut) {
      fadeAlpha -= 5; // Fade out speed
      if (fadeAlpha <= 0) {
        initSketch(); // Initialize the next design once fully faded out
        isFadingOut = false; // Start fading in
      }
    } else {
      fadeAlpha += 5; // Fade in speed
      if (fadeAlpha >= 100) {
        lastRedraw = millis(); // Reset timer for the next transition
        isFadingOut = true; // Ready to fade out again
      }
    }
  }

  translate(width / 2, height / 2);
  scale(0.75, 0.75);
  
  // Draw the circular waveform
  drawCircularWaveform(bass, mid, treble);

  // Draw stars and blackholes
  for (const s of stars) {
    let direction = 17;
    for (const b of blackholes) {
      direction += atan2(b.y - s.y, b.x - s.x) * 7;
    }
    // Use treble energy to influence star colors
    let brightness = map(treble, 0, 255, 0, 100);

    stroke(s.colour - bass/2, s.colour - mid/2, treble/2, fadeAlpha);
    strokeWeight(2);
    line(s.x, s.y, s.x += cos(direction) * random(8), s.y += sin(direction) * random(8));
    strokeWeight(7);
   // print(bass);
    stroke((bass-150)*1.5, (mid-150)*4, (mid-150)*4, fadeAlpha/2);
    point(s.x, s.y);
  }

  // Update black hole positions for drifting effect
  for (const b of blackholes) {
    // React to mid frequencies for black hole movement
    let driftFactor = map(treble, 0, 255, 0, 8);
    b.x += b.driftX * driftFactor;
    b.y += b.driftY * driftFactor;

    // Wrap around the canvas if they go out of bounds
    if (b.x < -width / 2) b.x = width / 2;
    if (b.x > width / 2) b.x = -width / 2;
    if (b.y < -height / 2) b.y = height / 2;
    if (b.y > height / 2) b.y = -height / 2;
  }
}

function drawCircularWaveform(bass, mid, treble) {
  let waveform = fft.waveform(); // Get waveform data
  
  //noFill();
  fill(0,0,25,1)
  //print(bass);
  // Color the waveform based on bass, mid, and treble energy
  let r = map(bass, 0, 255, 0, 100); // Bass controls red
  let g = map(mid, 0, 255, 0, 100);  // Mid controls green
  let b = map(treble, 0, 255, 0, 100);  // Treble controls blue
  //print(b);
  stroke(g, g, g, b*10); // Apply the dynamic color based on the frequency bands
  strokeWeight(10); // Adjust stroke weight for better visibility

  let radius = 420; // Radius of the circular path
  let angleOffset = frameCount += .010; // Rotate the waveform over time

  beginShape();

  // Reduce the resolution by taking every nth point of the waveform
  let resolution = 5; // 
  for (let i = 0; i < waveform.length; i += resolution) {
    let angle = map(i, 0, waveform.length, 0, TWO_PI); // Spread out the points around the circle
    let scaledRadius = radius + waveform[i] * 100; // Increased scaling for visible peaks
    let x = cos(angle + angleOffset) * scaledRadius;
    let y = sin(angle + angleOffset) * scaledRadius;

    vertex(x, y);
   //point(x, y/2);
  }
  endShape(CLOSE);
}
