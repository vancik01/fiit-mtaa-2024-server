import { PrismaClient } from "@prisma/client";

export type Coordinates = {
	lat: number;
	lon: number;
};

const prisma = new PrismaClient();

export function calculateDistance(
	pointA: Coordinates,
	pointB: Coordinates
): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = degreesToRadians(pointB.lat - pointA.lat);
	const dLon = degreesToRadians(pointB.lon - pointA.lon);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(degreesToRadians(pointA.lat)) *
			Math.cos(degreesToRadians(pointB.lat)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c; // Distance in km
	return distance;
}

function degreesToRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

// ******** GPT WORK ********

export const distanceQuery = async (point: Coordinates, radius: number) =>
	await prisma.$queryRaw`
    SELECT *, 6371 * acos(
        cos(radians(${point.lat}))
        * cos(radians("locationLat"))
        * cos(radians("locationLon") - radians(${point.lon}))
        + sin(radians(${point.lat})) * sin(radians("locationLat"))
      ) as "distance" FROM "Event"
where 6371 * acos(
        cos(radians(${point.lat}))
        * cos(radians("locationLat"))
        * cos(radians("locationLon") - radians(${point.lon}))
        + sin(radians(${point.lat})) * sin(radians("locationLat"))
      ) < ${radius}
    order by "distance"
  `;

// ******** GPT WORK ********
