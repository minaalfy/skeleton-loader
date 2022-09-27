export function triggerUpdate(property: string, val: number) {
  const event = new CustomEvent("shape-update", {
    detail: {
      [property]: val,
    },
  });
  window.dispatchEvent(event);
}

export function getBGs(shapes: any[], fg: string, [r, g, b]: string[]) {
  let bgs = `linear-gradient( 90deg, rgba(${r}, ${g}, ${b}, 0), rgba(${r}, ${g}, ${b}, 0.8) 50%, rgba(${r}, ${g}, ${b}, 0) 100% )`;
  for (let shape of shapes) {
    if (shape.circle) {
      bgs += `, 
        radial-gradient( circle ${shape.width / 2}px at ${shape.width / 2}px ${
        shape.height / 2
      }px, ${fg} 99%, transparent 0 )`;
    } else {
      bgs += `, 
        linear-gradient(${fg} ${shape.height}px, transparent 0)`;
    }
  }
  return bgs;
}

export function getSizes(shapes: any[]) {
  let sizes = `200px 100%`;
  for (let shape of shapes) {
    sizes += `, ${shape.width}px ${shape.height}px`;
  }
  return sizes;
}

export function getPositions(shapes: any[]) {
  let positions = "";
  for (let shape of shapes) {
    positions += `, ${shape.left}px ${shape.top}px`;
  }
  return positions;
}
