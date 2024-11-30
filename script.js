let currentSketch;

function loadSketch(sketchFile) {
  // Clear any existing sketch
  if (currentSketch) {
    currentSketch.remove();
  }

  // Fetch the external sketch and execute it
  fetch(`sketches/${sketchFile}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${sketchFile}: ${response.statusText}`);
      }
      return response.text();
    })
    .then((code) => {
      // Create a new sketch instance with the fetched code
      const sketchFunction = new Function("p", code);
      currentSketch = new p5(sketchFunction, 'sketch-container');
    })
    .catch((error) => console.error(error));
}
