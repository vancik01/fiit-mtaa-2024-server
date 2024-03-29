import {
    AccountType,
    Event,
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

const getRandomUser = (type: AccountType, n: number, email?: string) => {
    return Array(n)
        .fill("")
        .map((_, i) => {
            return {
                email: email ? email : faker.internet.email(),
                name: faker.person.fullName(),
                phoneNumber: faker.phone.number(),
                type: type ? type : "HARVESTER",
                avatarURL: getRandomimage(),
                password: md5("password123")
            };
        });
};

const getRandomEventData = () => {
    const sallaryType = faker.datatype.boolean()
        ? SallaryType.GOODS
        : SallaryType.MONEY;

    const ret = {
        capacity: faker.number.int({ min: 5, max: 10 }),
        description: faker.commerce.productDescription(),
        happeningAt: faker.date.future(),
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

async function main() {
    const fruitsAndVegetablesEmojis = [
        { emoji: "🍎", name: "Jablko" },
        { emoji: "🍐", name: "Hruška" },
        { emoji: "🍊", name: "Mandarínka" },
        { emoji: "🍋", name: "Citron" },
        { emoji: "🍌", name: "Banán" },
        { emoji: "🍉", name: "Melón" },
        { emoji: "🍇", name: "Hrozno" },
        { emoji: "🍓", name: "Jahoda" },
        { emoji: "🫐", name: "Čučoriedky" },
        { emoji: "🍒", name: "Čerešne" },
        { emoji: "🍑", name: "Broskyňa" },
        { emoji: "🥭", name: "Mango" },
        { emoji: "🍍", name: "Ananás" },
        { emoji: "🥥", name: "Kokos" },
        { emoji: "🥝", name: "Kiwi" },
        { emoji: "🍅", name: "Rajčina" },
        { emoji: "🍆", name: "Baklažán" },
        { emoji: "🥑", name: "Avokádo" },
        { emoji: "🥦", name: "Brokolica" },
        { emoji: "🥒", name: "Uhorka" },
        { emoji: "🌶", name: "Paprika" },
        { emoji: "🌽", name: "Kukurica" },
        { emoji: "🥕", name: "Mrkva" },
        { emoji: "🫒", name: "Oliva" },
        { emoji: "🧄", name: "Cesnak" },
        { emoji: "🧅", name: "Cibuľa" },
        { emoji: "🥔", name: "Zemiak" },
        { emoji: "🍠", name: "Batat" }
    ];

    await prisma.eventCategory.createMany({
        data: fruitsAndVegetablesEmojis.map((item) => ({
            icon: item.emoji,
            name: item.name
        }))
    });

    const categories = await prisma.eventCategory.findMany({
        select: {
            id: true
        }
    });

    await prisma.user.createMany({
        data: [
            ...getRandomUser("ORGANISER", 1, "admin1@grabit.sk"),
            ...getRandomUser("ORGANISER", 1, "admin2@grabit.sk"),
            ...getRandomUser("ORGANISER", 1, "admin3@grabit.sk")
        ]
    });
    const adminUsers = await prisma.user.findMany({ select: { id: true } });

    await prisma.location.createMany({
        data: Array(15)
            .fill("")
            .map((_, i) => ({
                address: faker.location.streetAddress(),
                city: faker.location.city(),
                locationLat: faker.location.latitude({ max: 180, min: -180 }),
                locationLon: faker.location.longitude({ max: 180, min: -180 })
            }))
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
                    data: getRandomUser("ORGANISER", 1)[0],
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
        data: getRandomUser("ORGANISER", 1, "worker1@grabit.sk")[0],
        select: {
            id: true
        }
    });

    const liveEvent = await prisma.event.create({
        data: {
            userId: adminUsers[0].id,
            locationId: locations[0].id,
            ...{ ...getRandomEventData(), status: "PROGRESS" }
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

    await Promise.all(
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
