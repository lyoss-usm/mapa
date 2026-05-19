type Campus = 'cc' | 'jmc' | 'sj' | 'conce';

interface POIProperties {
  name: string;
  description?: string;
  category: string;
  floor?: number;
  campus: Campus;
  image_url?: string;
}

interface Feature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: POIProperties;
}