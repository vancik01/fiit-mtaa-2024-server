import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	await prisma.user.deleteMany();
	await prisma.user.create({
		data: {
			email: "test@email",
			name: "My name is antom",
		},
	});
}

main();
