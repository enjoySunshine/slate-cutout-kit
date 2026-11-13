import { GraphicsContext } from '../GraphicsContext';
import { buildContextBatches } from '../utils/buildContextBatches';

import type { GpuGraphicsContext } from '../GraphicsContextSystem';

function buildGeometry(context: GraphicsContext): number[]
{
    const gpuContext = {
        batches: [],
        geometryData: { vertices: [], uvs: [], indices: [] },
        graphicsData: null,
    } as unknown as GpuGraphicsContext;

    buildContextBatches(context, gpuContext);

    return gpuContext.geometryData.vertices;
}

/**
 * Returns the [x, y] pairs of the hole polygon.
 * @param vertices - the flat vertex buffer built for the fill
 */
function getHoleCorners(vertices: number[]): [number, number][]
{
    const corners: [number, number][] = [];

    for (let i = vertices.length - 8; i < vertices.length; i += 2)
    {
        corners.push([vertices[i], vertices[i + 1]]);
    }

    return corners;
}

const plateHole: [number, number][] = [[50, 60], [70, 60], [70, 80], [50, 80]];
const rotatedHole: [number, number][] = [[20, 110], [20, 130], [10, 130], [10, 110]];
const plateOuter: [number, number][] = [[0, 0], [200, 0], [200, 200], [0, 200]];

describe('buildContextBatches holes', () =>
{
    it('should apply the transform of a translated hole', () =>
    {
        const context = new GraphicsContext();

        context
            .rect(0, 0, 200, 200)
            .fill()
            .translate(40, 50)
            .rect(10, 10, 20, 20)
            .cut();

        const corners = getHoleCorners(buildGeometry(context));

        corners.forEach((corner, i) =>
        {
            expect(corner[0]).toBeCloseTo(plateHole[i][0], 2);
            expect(corner[1]).toBeCloseTo(plateHole[i][1], 2);
        });
        expect(corners.length).toEqual(plateHole.length);
    });

    it('should apply the transform of a rotated hole', () =>
    {
        const context = new GraphicsContext();

        context
            .rect(0, 0, 200, 200)
            .fill()
            .translate(100, -20)
            .rotate(Math.PI / 2)
            .rect(10, 0, 20, 10)
            .cut();

        const corners = getHoleCorners(buildGeometry(context));

        corners.forEach((corner, i) =>
        {
            expect(corner[0]).toBeCloseTo(rotatedHole[i][0], 2);
            expect(corner[1]).toBeCloseTo(rotatedHole[i][1], 2);
        });
        expect(corners.length).toEqual(rotatedHole.length);
    });

    it('should leave the outer shape in path space', () =>
    {
        const context = new GraphicsContext();

        context
            .rect(0, 0, 200, 200)
            .fill()
            .translate(40, 50)
            .rect(10, 10, 20, 20)
            .cut();

        const vertices = buildGeometry(context);
        const outer = [];

        for (let i = 0; i < 8; i += 2)
        {
            outer.push([vertices[i], vertices[i + 1]]);
        }

        outer.forEach((corner, i) =>
        {
            expect(corner[0]).toBeCloseTo(plateOuter[i][0], 2);
            expect(corner[1]).toBeCloseTo(plateOuter[i][1], 2);
        });
        expect(outer.length).toEqual(plateOuter.length);
    });
});
