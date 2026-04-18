/**
 * TSP (TRAVELLING SALESPERSON PROBLEM) SOLVER - PURE TYPESCRIPT (ZERO-STUB)
 * Implements the Nearest Neighbor heuristic for route optimization in Doha.
 */
export class RouteOptimizer {
  /**
   * Calculates the most efficient path for a driver to visit multiple locations.
   * @param locations Array of coordinates [lat, lng]
   */
  static solve(locations: [number, number][]): [number, number][] {
    if (locations.length <= 2) return locations;

    const visited: boolean[] = new Array(locations.length).fill(false);
    const route: [number, number][] = [];

    // Start at the first location (usually the hub)
    let currentIdx = 0;
    route.push(locations[currentIdx]);
    visited[currentIdx] = true;

    for (let i = 1; i < locations.length; i++) {
      let nearestIdx = -1;
      let minDist = Infinity;

      for (let j = 0; j < locations.length; j++) {
        if (!visited[j]) {
          const dist = this.getDistance(locations[currentIdx], locations[j]);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = j;
          }
        }
      }

      if (nearestIdx !== -1) {
        currentIdx = nearestIdx;
        route.push(locations[currentIdx]);
        visited[currentIdx] = true;
      }
    }

    // Return to hub
    route.push(locations[0]);
    return route;
  }

  /**
   * Haversine formula for distance between two points on Earth
   */
  private static getDistance(p1: [number, number], p2: [number, number]): number {
    const R = 6371; // Earth radius in km
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
