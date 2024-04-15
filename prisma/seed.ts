import {
    AccountType,
    ColorVariant,
    Event,
    EventAssignmentStatus,
    EventPresenceStatus,
    EventStatus,
    PrismaClient,
    SallaryType,
    User
} from "@prisma/client";
const prisma = new PrismaClient();
import { faker } from "@faker-js/faker";
import moment from "moment";
import md5 from "md5";

const getRandomProduct = (n: number) => {
    return Array(n)
        .fill("")
        .map((_, i) => ({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            maker: faker.company.name(),
            price: parseInt(faker.commerce.price()),
            image: `https://picsum.photos/seed/${i}/1280/720`
        }));
};

const getRandomimage = () =>
    `https://picsum.photos/seed/${faker.number.int({
        min: 0,
        max: 1000
    })}/1280/720`;

const getRandomUser = (
    type: AccountType,
    n: number,
    email?: string,
    id?: string
) => {
    return Array(n)
        .fill("")
        .map((_, i) => {
            return {
                id: id ? id : undefined,
                email: email ? email : faker.internet.email(),
                name: faker.person.fullName(),
                phoneNumber: faker.phone.number(),
                type: type ? type : "HARVESTER",
                avatarURL: getRandomimage(),
                password: md5("password123")
            };
        });
};

const getRandomEventData = (capacity?: number, id?: string) => {
    const sallaryType = faker.datatype.boolean()
        ? SallaryType.GOODS
        : SallaryType.MONEY;

    const ret = {
        id: id ? id : undefined,
        capacity: capacity ? capacity : faker.number.int({ min: 5, max: 10 }),
        description: faker.commerce.productDescription(),
        happeningAt: moment(faker.date.soon())
            .set("hour", faker.number.int({ min: 6, max: 10 }))
            .toDate(),
        name: faker.commerce.productName(),
        sallaryType: sallaryType,
        sallaryAmount:
            sallaryType === "MONEY"
                ? faker.number.int({ min: 8, max: 30 }) * 0.5
                : faker.number.int({ min: 1, max: 7 }) * 0.2,
        sallaryUnit:
            sallaryType === "GOODS"
                ? faker.helpers.arrayElement(["kg", "ks", "mg", "ml"])
                : null,
        sallaryProductName:
            sallaryType === "GOODS" ? faker.commerce.productName() : undefined,
        thumbnailURL: getRandomimage(),
        toolingProvided: faker.datatype.boolean() ? "Fúriky, kýble" : null,
        toolingRequired: faker.datatype.boolean() ? "Rukavice, lopaty" : null
    };

    return ret;
};

const getHarmonogramItemData = (happeningAt: Date, offset: number) => {
    const from = moment(happeningAt)
        .set("hour", 8)
        .set("minutes", 0)
        .set("seconds", 0);
    return {
        from: from.add(offset, "hours").format("HH:MM"),
        title: faker.lorem.words({ min: 2, max: 10 }),
        description: faker.lorem.paragraph(),
        to: from.add(1, "hours").format("HH:MM")
    };
};

function slugify(title: string) {
    if (title == "" || !title) return "ERROR";

    return title
        .normalize("NFD") // Normalize to decompose special characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-zA-Z0-9 -]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .toLowerCase(); // Convert to lowercase
}

function generateNearbyCoordinate(
    centerLat: number,
    centerLon: number,
    radius = 0.1
) {
    return {
        latitude:
            centerLat +
            faker.number.float() * radius * (faker.datatype.boolean() ? 1 : -1),
        longitude:
            centerLon +
            faker.number.float() * radius * (faker.datatype.boolean() ? 1 : -1)
    };
}

async function main() {
    const fruitsAndVegetablesEmojis: {
        emoji: string;
        name: string;
        colorVariant: ColorVariant;
    }[] = [
        { emoji: "🍎", name: "Jablko", colorVariant: ColorVariant.APPLE },
        { emoji: "🍐", name: "Hruška", colorVariant: ColorVariant.APPLE },
        { emoji: "🍊", name: "Mandarínka", colorVariant: ColorVariant.ORANGE },
        { emoji: "🍋", name: "Citron", colorVariant: ColorVariant.LIME },
        { emoji: "🍌", name: "Banán", colorVariant: ColorVariant.LIME },
        { emoji: "🍉", name: "Melón", colorVariant: ColorVariant.CHERRY },
        { emoji: "🍇", name: "Hrozno", colorVariant: ColorVariant.LIME },
        { emoji: "🍓", name: "Jahoda", colorVariant: ColorVariant.CHERRY },
        { emoji: "🫐", name: "Čučoriedky", colorVariant: ColorVariant.LEMON },
        { emoji: "🍒", name: "Čerešne", colorVariant: ColorVariant.CHERRY },
        { emoji: "🍑", name: "Broskyňa", colorVariant: ColorVariant.ORANGE },
        { emoji: "🥭", name: "Mango", colorVariant: ColorVariant.LIME },
        { emoji: "🍍", name: "Ananás", colorVariant: ColorVariant.APPLE },
        { emoji: "🥥", name: "Kokos", colorVariant: ColorVariant.APPLE },
        { emoji: "🥝", name: "Kiwi", colorVariant: ColorVariant.LIME },
        { emoji: "🍅", name: "Rajčina", colorVariant: ColorVariant.CHERRY },
        { emoji: "🍆", name: "Baklažán", colorVariant: ColorVariant.LIME },
        { emoji: "🥑", name: "Avokádo", colorVariant: ColorVariant.LIME },
        { emoji: "🥦", name: "Brokolica", colorVariant: ColorVariant.APPLE },
        { emoji: "🥒", name: "Uhorka", colorVariant: ColorVariant.APPLE },
        { emoji: "🌶", name: "Paprika", colorVariant: ColorVariant.CHERRY },
        { emoji: "🌽", name: "Kukurica", colorVariant: ColorVariant.LEMON },
        { emoji: "🥕", name: "Mrkva", colorVariant: ColorVariant.ORANGE },
        { emoji: "🫒", name: "Oliva", colorVariant: ColorVariant.LIME },
        { emoji: "🧄", name: "Cesnak", colorVariant: ColorVariant.LIME },
        { emoji: "🧅", name: "Cibuľa", colorVariant: ColorVariant.LIME },
        { emoji: "🥔", name: "Zemiak", colorVariant: ColorVariant.LIME },
        { emoji: "🍠", name: "Batat", colorVariant: ColorVariant.ORANGE }
    ];

    await prisma.eventCategory.createMany({
        data: fruitsAndVegetablesEmojis.map((item) => ({
            icon: item.emoji,
            name: item.name,
            colorVariant: item.colorVariant
        }))
    });

    const categories = await prisma.eventCategory.findMany({
        select: {
            id: true
        }
    });

    await prisma.user.createMany({
        data: [
            ...getRandomUser("ORGANISER", 1, "admin1@grabit.sk", "admin1"),
            ...getRandomUser("ORGANISER", 1, "admin2@grabit.sk", "admin2"),
            ...getRandomUser("ORGANISER", 1, "admin3@grabit.sk", "admin3")
        ]
    });
    const adminUsers = await prisma.user.findMany({ select: { id: true } });

    await prisma.location.createMany({
        data: Array(15)
            .fill("")
            .map((_, i) => {
                const { latitude, longitude } = generateNearbyCoordinate(
                    48.934328,
                    18.160032
                );
                return {
                    name: faker.company.name(),
                    address: faker.location.streetAddress(),
                    city: faker.location.city(),
                    locationLat: latitude,
                    locationLon: longitude
                };
            })
    });

    const locations = await prisma.location.findMany({ select: { id: true } });

    await prisma.event.createMany({
        data: Array(15)
            .fill("")
            .map((_, i) => ({
                ...getRandomEventData(),
                userId: adminUsers[i % 3].id,
                locationId: locations[i].id
            }))
    });

    const events = await prisma.event.findMany({
        select: {
            id: true,
            capacity: true,
            happeningAt: true
        }
    });
    events.map(async (event) => {
        const userPromises = Array.from(
            { length: faker.number.int({ min: 0, max: event.capacity }) },
            async () =>
                prisma.user.create({
                    data: getRandomUser("HARVESTER", 1)[0],
                    select: { id: true }
                })
        );

        const userIds = await Promise.all(userPromises);

        //Assign categories to events
        await Promise.all(
            Array(faker.number.int({ min: 1, max: 3 }))
                .fill("")
                .map((_) =>
                    prisma.eventCategoryRelation.create({
                        data: {
                            eventId: event.id,
                            eventCategoryId:
                                categories[
                                    faker.number.int({
                                        min: 0,
                                        max: categories.length - 1
                                    })
                                ].id
                        }
                    })
                )
        );

        // Create harmonogram events
        await Promise.all(
            Array(5)
                .fill("")
                .map((_, i) => {
                    return prisma.harmonogramItem.create({
                        data: {
                            eventId: event.id,
                            ...getHarmonogramItemData(event.happeningAt, i)
                        }
                    });
                })
        );

        // Create an eventAssignment for each userId
        await Promise.all(
            userIds.map((user) =>
                prisma.eventAssignment.create({
                    data: {
                        eventId: event.id,
                        userId: user.id
                    }
                })
            )
        );
    });

    const workerId = await prisma.user.create({
        data: getRandomUser(
            "HARVESTER",
            1,
            "worker1@grabit.sk",
            "harvester1"
        )[0],
        select: {
            id: true
        }
    });

    const liveEvent = await prisma.event.create({
        data: {
            userId: adminUsers[0].id,
            locationId: locations[0].id,
            ...{
                ...getRandomEventData(15, "liveEventId"),
                status: "PROGRESS",
                happeningAt: moment().set("hours", 7).toDate()
            }
        },
        select: {
            id: true,
            capacity: true,
            happeningAt: true
        }
    });

    const userPromises = Array.from(
        { length: liveEvent.capacity - 1 },
        async () =>
            prisma.user.create({
                data: getRandomUser("HARVESTER", 1)[0],
                select: { id: true }
            })
    );

    const userIds = await Promise.all(userPromises);

    const assignments = await Promise.all(
        userIds.map((user) =>
            prisma.eventAssignment.create({
                data: {
                    eventId: liveEvent.id,
                    userId: user.id
                }
            })
        )
    );

    await prisma.eventAssignment.create({
        data: {
            eventId: liveEvent.id,
            userId: workerId.id
        }
    });

    await Promise.all(
        assignments.map((assignment) => {
            const statusChangeTo = faker.helpers.arrayElement([
                //EventPresenceStatus.PRESENT,
                //EventPresenceStatus.LEFT,
                EventPresenceStatus.NOT_PRESENT
            ]);

            const arrivedAt = [
                EventPresenceStatus.PRESENT.toString(),
                EventPresenceStatus.LEFT.toString()
            ].includes(statusChangeTo)
                ? moment(liveEvent.happeningAt)
                      .add(faker.number.int({ min: 2, max: 45 }), "minutes")
                      .toDate()
                : undefined;

            const leftAt = [EventPresenceStatus.LEFT.toString()].includes(
                statusChangeTo
            )
                ? moment(arrivedAt)
                      .add(faker.number.int({ min: 2, max: 12 }), "hours")
                      .add(faker.number.int({ min: 2, max: 45 }), "minutes")
                      .toDate()
                : undefined;

            return prisma.eventAssignment.update({
                data: {
                    presenceStatus: statusChangeTo,
                    arrivedAt: arrivedAt,
                    leftAt: leftAt
                },
                where: {
                    id: assignment.id
                }
            });
        })
    );

    await Promise.all(
        Array(5)
            .fill("")
            .map((_, i) => {
                const from = moment(liveEvent.happeningAt)
                    .set("hour", 8)
                    .set("minutes", 0)
                    .set("seconds", 0);
                return prisma.harmonogramItem.create({
                    data: {
                        eventId: liveEvent.id,
                        ...getHarmonogramItemData(liveEvent.happeningAt, i)
                    }
                });
            })
    );

    await Promise.all(
        Array(10)
            .fill("")
            .map((_, i) => {
                const published_at = moment(liveEvent.happeningAt)
                    .set("hours", 8)
                    .set("minutes", 0)
                    .set("seconds", 0)
                    .add(i, "hours")
                    .add(faker.number.int({ min: 1, max: 60 }), "minutes")
                    .add(faker.number.int({ min: 1, max: 60 }), "seconds");
                return prisma.announcementItem.create({
                    data: {
                        eventId: liveEvent.id,
                        message: faker.lorem.sentence(),
                        userId: adminUsers[0].id,
                        createdAt: published_at.toDate()
                    }
                });
            })
    );
}

main();
